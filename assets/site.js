
(function () {
  /* Mobile drawer */
  var drawer = document.getElementById('drawer');
  var openBtn = document.getElementById('drawer-open');
  function setDrawer(open) {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  openBtn.addEventListener('click', function () { setDrawer(true); });
  drawer.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', function () { setDrawer(false); }); });

  /* Floating dock: show once the visitor has scrolled past the hero's first screen */
  var dock = document.getElementById('dock');
  var totop = document.getElementById('totop');
  var curBtn = document.getElementById('currency-btn');
  var menu = document.getElementById('currency-menu');
  function onScroll() {
    var show = window.scrollY > 480;
    dock.classList.toggle('is-visible', show);
    dock.setAttribute('aria-hidden', show ? 'false' : 'true');
    totop.tabIndex = show ? 0 : -1;
    curBtn.tabIndex = show ? 0 : -1;
    if (!show) closeMenu();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  totop.addEventListener('click', function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* Currency menu */
  function openMenu() { menu.hidden = false; curBtn.setAttribute('aria-expanded', 'true'); var c = menu.querySelector('[aria-checked="true"]'); if (c) c.focus(); }
  function closeMenu() { menu.hidden = true; curBtn.setAttribute('aria-expanded', 'false'); }
  curBtn.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden ? openMenu() : closeMenu(); });
  menu.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      menu.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', 'false'); });
      b.setAttribute('aria-checked', 'true');
      document.getElementById('currency-code').textContent = b.dataset.code;
      document.getElementById('currency-flag').src = b.dataset.flag;
      closeMenu(); curBtn.focus();
    });
  });
  document.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('.currency')) closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!menu.hidden) { closeMenu(); curBtn.focus(); } setDrawer(false); }
  });

  /* Hero video: hold on the first frame for visitors who prefer reduced motion */
  (function () {
    var v = document.getElementById('hero-video');
    if (!v) return;
    /* Pick the right video for the screen: portrait on phones, tablet cut, desktop cut */
    var mobile = window.matchMedia('(max-width: 900px)').matches;
    var tablet = !mobile && window.matchMedia('(max-width: 1024px)').matches;
    var want = mobile ? v.dataset.srcMobile : (tablet ? v.dataset.srcTablet : v.dataset.srcDesktop);
    if (mobile && v.dataset.posterMobile) v.poster = v.dataset.posterMobile;
    if (want && v.currentSrc.indexOf(want) === -1) {
      v.src = want; v.load();
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { document.querySelectorAll('video[autoplay]').forEach(function (x) { x.removeAttribute('autoplay'); x.pause(); }); }
  })();

  /* Newsletter: collapsible on phones */
  (function () {
    var t = document.getElementById('nl-toggle');
    if (!t) return;
    var sec = t.closest('.newsletter');
    t.addEventListener('click', function () {
      var open = !sec.classList.contains('is-open');
      sec.classList.toggle('is-open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var i = document.getElementById('nl-email'); if (i) setTimeout(function () { i.focus({ preventScroll: true }); }, 50); }
    });
  })();

  /* Terms of service: expand / collapse all */
  (function () {
    var btn = document.getElementById('ts-toggle-all');
    if (!btn) return;
    var items = Array.prototype.slice.call(document.querySelectorAll('.ts-item'));
    function sync() {
      var allOpen = items.every(function (d) { return d.open; });
      btn.textContent = allOpen ? 'Collapse all' : 'Expand all';
      btn.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
    }
    btn.addEventListener('click', function () {
      var open = !items.every(function (d) { return d.open; });
      items.forEach(function (d) { d.open = open; });
      sync();
    });
    items.forEach(function (d) { d.addEventListener('toggle', sync); });
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t && t.tagName === 'DETAILS') t.open = true; }
  })();

  /* Collection carousel */
  (function () {
    var track = document.getElementById('col-track');
    if (!track) return;
    var prev = document.getElementById('col-prev');
    var next = document.getElementById('col-next');
    function step() { var c = track.querySelector('.col-card'); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth; }
    function update() {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* Reviews carousel */
  (function () {
    var stage = document.getElementById('rv-stage');
    if (!stage) return;
    var cards = Array.prototype.slice.call(stage.querySelectorAll('.rv-card'));
    var dotsWrap = document.getElementById('rv-dots');
    var n = cards.length, current = 0, timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Show review ' + (i + 1));
      d.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(d);
    });
    var dots = dotsWrap.querySelectorAll('button');
    function render() {
      cards.forEach(function (c, i) {
        var o = i - current;
        if (o > n / 2) o -= n;
        if (o < -n / 2) o += n;
        c.style.setProperty('--o', o);
        c.classList.toggle('is-active', o === 0);
        c.classList.toggle('is-near', Math.abs(o) === 1);
        c.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
        if (o !== 0 && c.classList.contains('is-expanded')) {
          c.classList.remove('is-expanded');
          var mb = c.querySelector('.rv-more');
          if (mb) { mb.setAttribute('aria-expanded', 'false'); mb.textContent = 'Read more'; }
        }
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === current ? 'true' : 'false'); });
    }
    function go(i) { current = (i + n) % n; render(); }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(current + 1); }, 7000); }
    document.getElementById('rv-prev').addEventListener('click', function () { go(current - 1); restart(); });
    document.getElementById('rv-next').addEventListener('click', function () { go(current + 1); restart(); });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { if (i !== current) { go(i); restart(); } }); });
    stage.querySelectorAll('.rv-more').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var card = b.closest('.rv-card');
        var open = !card.classList.contains('is-expanded');
        card.classList.toggle('is-expanded', open);
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        b.textContent = open ? 'Show less' : 'Read more';
        clearInterval(timer);
      });
    });
    var section = stage.closest('.reviews');
    section.addEventListener('mouseenter', function () { clearInterval(timer); });
    section.addEventListener('mouseleave', restart);
    section.addEventListener('focusin', function () { clearInterval(timer); });
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    });
    render(); restart();
  })();

  /* Newsletter (preview only: confirms on the page, nothing is sent) */
  var form = document.getElementById('nl-form');
  var note = document.getElementById('nl-note');
  var email = document.getElementById('nl-email');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!email.value || !email.checkValidity()) {
      note.textContent = 'Enter a valid email address, like name@example.com.';
      email.focus();
      return;
    }
    note.className = 'nl-done';
    note.textContent = 'Welcome to the list. Check your inbox for your 10% code.';
    form.reset();
  });
})();

/* Contact form (preview only: validates and confirms on the page; connect to Shopify's contact form for real sending) */
(function () {
  var form = document.getElementById('ct-form');
  if (!form) return;
  var status = document.getElementById('ct-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    form.querySelectorAll('input, textarea').forEach(function (f) {
      var bad = !f.value.trim() || !f.checkValidity();
      f.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !first) first = f;
    });
    if (first) {
      status.className = 'ct-status is-error';
      status.textContent = 'Please fill in your name, a valid email and a message.';
      first.focus();
      return;
    }
    status.className = 'ct-status';
    status.textContent = 'Thank you. Your message is ready to send once the form is connected.';
    form.reset();
  });
})();
