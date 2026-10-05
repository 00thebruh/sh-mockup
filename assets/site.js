
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
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === current ? 'true' : 'false'); });
    }
    function go(i) { current = (i + n) % n; render(); }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(current + 1); }, 7000); }
    document.getElementById('rv-prev').addEventListener('click', function () { go(current - 1); restart(); });
    document.getElementById('rv-next').addEventListener('click', function () { go(current + 1); restart(); });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { if (i !== current) { go(i); restart(); } }); });
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
