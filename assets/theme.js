/* ============================================================
   Sidhant R. Nair — Portfolio  ·  theme + motion controller
   - applies saved theme/accent/density before paint
   - builds the settings panel (accent / light-dark / density)
   - scroll-reveal via IntersectionObserver
   - subtle terminal-typing effect on the hero prompt
   ============================================================ */
(function () {
  var root = document.documentElement;
  var LS = window.localStorage;
  var ACCENTS = [
    { id: 'green',  v: 'oklch(0.78 0.13 165)' },
    { id: 'cyan',   v: 'oklch(0.74 0.12 230)' },
    { id: 'violet', v: 'oklch(0.70 0.15 295)' },
    { id: 'amber',  v: 'oklch(0.81 0.12 80)'  }
  ];

  /* ---- 1. apply saved prefs immediately (runs in <head>, pre-paint) ---- */
  function get(k){ try { return LS.getItem(k); } catch (e) { return null; } }
  function set(k,val){ try { LS.setItem(k, val); } catch (e) {} }

  var savedTheme   = get('srn-theme');                 // 'light' | null(dark)
  var savedAccent  = get('srn-accent');                // oklch string
  var savedDensity = get('srn-density');               // 'compact' | null(cozy)

  function applyTheme(mode){ // 'light' | 'dark'
    [root, document.body].forEach(function(el){ if(!el) return;
      if(mode==='light') el.setAttribute('data-theme','light'); else el.removeAttribute('data-theme'); });
  }
  function applyDensity(mode){ // 'compact' | 'cozy'
    [root, document.body].forEach(function(el){ if(!el) return;
      if(mode==='compact') el.setAttribute('data-density','compact'); else el.removeAttribute('data-density'); });
  }

  if (savedTheme === 'light') applyTheme('light');
  if (savedDensity === 'compact') applyDensity('compact');
  if (savedAccent) root.style.setProperty('--accent', savedAccent);

  /* ---- 2. build UI + behaviours once DOM is ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    // re-apply so <body> also carries the attributes
    if (root.getAttribute('data-theme') === 'light') applyTheme('light');
    if (root.getAttribute('data-density') === 'compact') applyDensity('compact');
    buildPanel();
    initReveal();
    initTyping();
  });

  /* ---------- settings panel ---------- */
  function buildPanel() {
    var fab = document.createElement('button');
    fab.id = 'srn-fab';
    fab.setAttribute('aria-label', 'Display settings');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.3" fill="var(--panel)"/><circle cx="8" cy="17" r="2.3" fill="var(--panel)"/></svg>';

    var panel = document.createElement('div');
    panel.id = 'srn-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Display settings');

    // theme group
    var curTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var curDensity = root.getAttribute('data-density') === 'compact' ? 'compact' : 'cozy';
    var curAccent = root.style.getPropertyValue('--accent').trim() || ACCENTS[0].v;

    panel.innerHTML =
      '<div class="grp"><div class="lbl">Theme</div><div class="seg" data-seg="theme">' +
        '<button data-val="dark">Dark</button><button data-val="light">Light</button></div></div>' +
      '<div class="grp"><div class="lbl">Accent</div><div class="swatches" data-seg="accent"></div></div>' +
      '<div class="grp"><div class="lbl">Density</div><div class="seg" data-seg="density">' +
        '<button data-val="cozy">Cozy</button><button data-val="compact">Compact</button></div></div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // swatches
    var sw = panel.querySelector('[data-seg="accent"]');
    ACCENTS.forEach(function (a) {
      var b = document.createElement('button');
      b.style.background = a.v;
      b.dataset.val = a.v;
      b.setAttribute('aria-label', a.id);
      sw.appendChild(b);
    });

    function syncActive() {
      panel.querySelectorAll('[data-seg="theme"] button').forEach(function (b) {
        b.classList.toggle('on', b.dataset.val === (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'));
      });
      panel.querySelectorAll('[data-seg="density"] button').forEach(function (b) {
        b.classList.toggle('on', b.dataset.val === (root.getAttribute('data-density') === 'compact' ? 'compact' : 'cozy'));
      });
      var acc = (root.style.getPropertyValue('--accent').trim() || ACCENTS[0].v);
      panel.querySelectorAll('[data-seg="accent"] button').forEach(function (b) {
        b.classList.toggle('on', b.dataset.val === acc);
      });
    }
    syncActive();

    panel.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var seg = btn.parentElement.dataset.seg;
      if (seg === 'theme') {
        if (btn.dataset.val === 'light') { applyTheme('light'); set('srn-theme', 'light'); }
        else { applyTheme('dark'); set('srn-theme', 'dark'); }
      } else if (seg === 'density') {
        if (btn.dataset.val === 'compact') { applyDensity('compact'); set('srn-density', 'compact'); }
        else { applyDensity('cozy'); set('srn-density', 'cozy'); }
      } else if (seg === 'accent') {
        root.style.setProperty('--accent', btn.dataset.val); set('srn-accent', btn.dataset.val);
      }
      syncActive();
    });

    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== fab) panel.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') panel.classList.remove('open');
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var sel = '.sh, .stat, .card, .pub, .pubd, .expd, .cvrow, .ref, .skills';
    var items = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!items.length || !('IntersectionObserver' in window)) return;

    items.forEach(function (el) { el.setAttribute('data-reveal', ''); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          // light stagger among siblings in the same row/grid
          var sibs = Array.prototype.slice.call(el.parentElement.children).filter(function (c) { return c.hasAttribute('data-reveal'); });
          var i = sibs.indexOf(el);
          el.style.transitionDelay = Math.min(i, 5) * 55 + 'ms';
          el.classList.add('revealed');
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero terminal typing ---------- */
  function initTyping() {
    var el = document.querySelector('.prompt[data-type]');
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var full = el.getAttribute('data-type');
    el.textContent = '';
    var i = 0;
    (function tick() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        i++;
        setTimeout(tick, 70 + Math.random() * 50);
      }
    })();
  }
})();
