// NurseOS landing — interactions. Vanilla JS, no dependencies.
(function () {
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Pinned tour --------------------------------------------------------
  var sec = document.getElementById('screens');
  var phone = document.getElementById('tourphone');
  var screens = Array.prototype.slice.call(document.querySelectorAll('.scr'));
  var caps = Array.prototype.slice.call(document.querySelectorAll('.tour-cap'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tb'));
  var active = -1;

  function setActive(idx) {
    if (idx === active) return;
    active = idx;
    screens.forEach(function (el, i) {
      el.classList.toggle('active', i === idx);
      el.classList.toggle('past', i < idx);
    });
    caps.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
    tabs.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
  }

  var rafTour = null;
  function tourCheck() {
    if (!sec) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var denom = Math.max(1, sec.offsetHeight - vh);
    var p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / denom));
    setActive(Math.min(4, Math.floor(p * 5)));
  }
  function onTour() {
    if (rafTour) return;
    rafTour = requestAnimationFrame(function () { rafTour = null; tourCheck(); });
  }
  window.addEventListener('scroll', onTour, { passive: true });
  window.addEventListener('resize', onTour);
  tourCheck();

  // Screen content is designed at 690px tall; scale to the phone's real height.
  function measure() {
    if (!phone) return;
    var h = phone.clientHeight;
    if (!h) return;
    var k = Math.min(1, h / 690);
    phone.style.setProperty('--k', k);
    phone.style.setProperty('--pct', (100 / k).toFixed(2) + '%');
  }
  window.addEventListener('resize', measure);
  requestAnimationFrame(measure);
  setTimeout(measure, 300);
  setTimeout(measure, 1000);
  if (window.ResizeObserver && phone) new ResizeObserver(measure).observe(phone);

  // Caption / tab click → scroll to that screen's offset within the tour.
  function goTo(i) {
    if (!sec) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var top = sec.offsetTop + (sec.offsetHeight - vh) * ((i + 0.5) / 5);
    window.scrollTo({ top: top, behavior: rm ? 'auto' : 'smooth' });
  }
  caps.forEach(function (el, i) { el.addEventListener('click', function () { goTo(i); }); });
  tabs.forEach(function (el, i) { el.addEventListener('click', function () { goTo(i); }); });

  // Flashcard flip (Study screen).
  var flash = document.getElementById('flashcard');
  if (flash) flash.addEventListener('click', function () {
    document.getElementById('flash-answer').style.display = 'block';
    document.getElementById('flash-hint').style.display = 'none';
  });

  // ---- Scroll reveal ------------------------------------------------------
  // Initial hidden state is applied here (not in HTML) so content is never
  // stuck invisible without JS; 1200ms fallback shows everything regardless.
  var els = Array.prototype.slice.call(document.querySelectorAll('h1, h2, figure, [data-reveal]'));
  if (!rm && 'IntersectionObserver' in window) {
    els.forEach(function (el) {
      el.style.transition = 'opacity .85s cubic-bezier(.2,.65,.2,1), transform .85s cubic-bezier(.2,.65,.2,1)';
      el.classList.add('reveal-init');
    });
    var shown = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = ((els.indexOf(el) % 4) * 80) + 'ms';
        el.classList.add('reveal-in');
        io.unobserve(el);
        shown++;
      });
    }, { threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      if (shown === 0) els.forEach(function (el) { el.classList.add('reveal-in'); });
    }, 1200);
  }

  // ---- Setup paste demo ---------------------------------------------------
  var pasteBtn = document.getElementById('paste-btn');
  if (pasteBtn) pasteBtn.addEventListener('click', function () {
    pasteBtn.textContent = 'Pasted ✓';
    document.getElementById('paste-result').classList.add('shown');
  });

  // ---- FAQ accordion (one open at a time) ---------------------------------
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  items.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      items.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-mark').textContent = '+';
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        item.querySelector('.faq-mark').textContent = '−';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

})();
