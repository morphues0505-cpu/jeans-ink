/* ============================================
   JEANS·INK — Main JS
   ============================================ */

/* ── SOCIAL LINKS (нэг газраас удирдана) ──────
   IG нээгдсэн үед instagram-д линкээ тавиад
   enabled: true болгоно. Болоо.            */
const SOCIAL = {
  facebook:  { url: 'https://m.me/1158158530715843', enabled: true },
  instagram: { url: '', enabled: false },
};

function applySocialLinks() {
  // Facebook — бүх FB линк + товч
  document.querySelectorAll('a[title="Facebook"], #fbLink, [data-social="facebook"]').forEach(el => {
    if (SOCIAL.facebook.enabled && SOCIAL.facebook.url) {
      el.href = SOCIAL.facebook.url;
      el.target = '_blank';
      el.rel = 'noopener';
    }
  });
  // Instagram — нээгдээгүй бол нуух
  document.querySelectorAll('a[title="Instagram"], #igLink, [data-social="instagram"]').forEach(el => {
    if (SOCIAL.instagram.enabled && SOCIAL.instagram.url) {
      el.href = SOCIAL.instagram.url;
      el.target = '_blank';
      el.rel = 'noopener';
    } else {
      el.style.display = 'none';
    }
  });
}
applySocialLinks();

// ── Navigation ──────────────────────────────
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('navMobile');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    const isOpen = mobileMenu.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ── Active nav link (handles /, /catalog and /catalog.html) ──
const norm = (s) => {
  s = (s || '').split('/').pop().replace(/\.html$/, '');
  return (s === '' || s === 'index') ? 'index' : s;
};
const currentPage = norm(window.location.pathname);
document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
  if (norm(a.getAttribute('href')) === currentPage) a.classList.add('active');
});

// ── Scroll reveal ─────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
// auto-stagger direct children of [data-stagger]
document.querySelectorAll('[data-stagger] > *').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 6) * 0.08 + 's';
  revealObserver.observe(el);
});

// ── Page transition: neon wipe panel sweeps up before navigating ──
(function pageTransitions() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const style = document.createElement('style');
  style.textContent = `
    #pageWipe{position:fixed;inset:0;z-index:99990;background:#0D0D0D;transform:translateY(105%);
      transition:transform .46s cubic-bezier(.76,0,.24,1);display:flex;align-items:center;justify-content:center;
      border-top:3px solid #C5F230;box-shadow:0 -10px 40px rgba(197,242,48,.35);}
    #pageWipe img{width:66px;height:66px;opacity:0;transform:scale(.7) rotate(-10deg);
      transition:opacity .24s ease .12s, transform .4s cubic-bezier(.34,1.56,.64,1) .12s;
      filter:drop-shadow(0 0 16px rgba(197,242,48,.7));}
    #pageWipe.cover{transform:translateY(0);}
    #pageWipe.cover img{opacity:1;transform:scale(1) rotate(0);}`;
  document.head.appendChild(style);
  const w = document.createElement('div'); w.id = 'pageWipe';
  w.innerHTML = '<img src="assets/logo-nav.png" alt="">';
  document.body.appendChild(w);
  document.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (a.target === '_blank' || a.hasAttribute('download') || href.startsWith('#') ||
          href.startsWith('mailto') || href.startsWith('tel')) return;
      if (href.startsWith('http') && !href.includes(location.host)) return;
      if (!href.endsWith('.html') && href !== '/' && !href.endsWith('/')) return;
      e.preventDefault();
      w.classList.add('cover');
      setTimeout(() => { location.href = a.href; }, 450);
    });
  });
})();

// ── Modal ────────────────────────────────────
window.openModal = function(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
};
window.closeModal = function(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
};
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

// ── Catalog data (synced with Excel) ────────
window.PATCHES = [
  { id:'001', name:'ALTAN URAG',    category:'Mongolian', total:22, sold:0 },
  { id:'002', name:'VOID GEOMETRY', category:'Geometric', total:22, sold:0 },
  { id:'003', name:'TRIBAL MARK',   category:'Tribal',    total:22, sold:0 },
  { id:'004', name:'URBAN GLITCH',  category:'Abstract',  total:22, sold:0 },
  { id:'005', name:'NIGHT SUTRA',   category:'Minimal',   total:22, sold:0 },
  { id:'006', name:'STEPPE LINE',   category:'Mongolian', total:22, sold:0 },
  { id:'007', name:'RAW CIRCUIT',   category:'Geometric', total:22, sold:0 },
  { id:'008', name:'GHOST KNOT',    category:'Abstract',  total:22, sold:0 },
];

// ── Smooth scroll for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Favicon (бүх хуудсанд) ───────────────────
(function injectFavicon() {
  if (document.querySelector('link[rel="icon"]')) return;
  const link = document.createElement('link');
  link.rel = 'icon'; link.type = 'image/png'; link.href = 'assets/favicon.png?v=1';
  document.head.appendChild(link);
  const apple = document.createElement('link');
  apple.rel = 'apple-touch-icon'; apple.href = 'assets/favicon.png?v=1';
  document.head.appendChild(apple);
})();

// ── Хөвөгч Messenger товч (бүх хуудсанд) ─────
(function floatingChat() {
  if (!SOCIAL.facebook.enabled || !SOCIAL.facebook.url) return;
  if (document.getElementById('floatChat')) return;
  const style = document.createElement('style');
  style.textContent = `
    #floatChat{position:fixed;right:18px;bottom:18px;z-index:1500;width:58px;height:58px;border-radius:50%;
      background:var(--accent,#C5F230);display:flex;align-items:center;justify-content:center;
      box-shadow:0 6px 22px rgba(197,242,48,.45),0 2px 8px rgba(0,0,0,.4);
      transition:transform .2s ease, box-shadow .2s ease;animation:fcPulse 2.6s ease-in-out infinite;}
    #floatChat:hover{transform:scale(1.1);box-shadow:0 8px 28px rgba(197,242,48,.6);}
    #floatChat svg{width:30px;height:30px;}
    @keyframes fcPulse{0%,100%{box-shadow:0 6px 22px rgba(197,242,48,.35),0 2px 8px rgba(0,0,0,.4)}
      50%{box-shadow:0 6px 30px rgba(197,242,48,.7),0 2px 8px rgba(0,0,0,.4)}}
    @media(max-width:600px){#floatChat{right:14px;bottom:14px;width:54px;height:54px}}
    @media(prefers-reduced-motion:reduce){#floatChat{animation:none}}`;
  document.head.appendChild(style);
  const a = document.createElement('a');
  a.id = 'floatChat'; a.href = SOCIAL.facebook.url; a.target = '_blank'; a.rel = 'noopener';
  a.title = 'Messenger-ээр бичих';
  a.setAttribute('aria-label', 'Messenger');
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="#0D0D0D"><path d="M12 2C6.3 2 2 6.2 2 11.6c0 2.9 1.3 5.4 3.3 7.2.2.1.3.4.3.6l.1 1.8c0 .6.6 1 1.1.7l2-.9c.2-.1.4-.1.6 0 .9.3 1.9.4 2.9.4 5.7 0 10-4.2 10-9.6S17.7 2 12 2zm6 7.5l-2.9 4.6c-.5.7-1.5.9-2.2.4l-2.3-1.7c-.2-.2-.5-.2-.7 0l-3.1 2.4c-.4.3-.9-.2-.7-.6l2.9-4.6c.5-.7 1.5-.9 2.2-.4l2.3 1.7c.2.2.5.2.7 0l3.1-2.4c.4-.3.9.2.7.6z"/></svg>';
  document.body.appendChild(a);
})();

// ── Neon cursor + meteor trail (desktop only) ──
(function neonCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const style = document.createElement('style');
  style.textContent = `
    html.neon-cur, html.neon-cur * { cursor: none !important; }
    .cur-dot, .cur-ring { position:fixed; top:0; left:0; pointer-events:none; z-index:99999;
      border-radius:50%; transform:translate(-50%,-50%); will-change:left,top; }
    .cur-dot { width:8px; height:8px; background:#C5F230; box-shadow:0 0 12px #C5F230, 0 0 4px #C5F230; }
    .cur-ring { width:32px; height:32px; border:1.5px solid rgba(197,242,48,.55);
      transition:width .18s ease, height .18s ease, background .18s ease, border-color .18s ease; }
    .cur-ring.big { width:54px; height:54px; background:rgba(197,242,48,.12); border-color:rgba(197,242,48,.9); }
    .cur-trail { position:fixed; top:0; left:0; width:7px; height:7px; border-radius:50%;
      background:#C5F230; pointer-events:none; z-index:99998; transform:translate(-50%,-50%);
      box-shadow:0 0 8px #C5F230; animation:curTrail .6s ease forwards; }
    @keyframes curTrail { from{opacity:.85; transform:translate(-50%,-50%) scale(1)}
      to{opacity:0; transform:translate(-50%,-50%) scale(.15)} }`;
  document.head.appendChild(style);
  document.documentElement.classList.add('neon-cur');
  const dot = document.createElement('div'); dot.className = 'cur-dot';
  const ring = document.createElement('div'); ring.className = 'cur-ring';
  document.body.append(dot, ring);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, last = 0;
  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    const now = e.timeStamp;
    if (now - last > 26) {
      last = now;
      const t = document.createElement('div'); t.className = 'cur-trail';
      t.style.left = mx + 'px'; t.style.top = my + 'px';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 600);
    }
  });
  (function loop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
  const hot = 'a,button,.btn,.mk-type,.mk-color,.mk-size,.pat-tile,.mk-tray-item,.faq-q,.mk-zoom-btn,.mk-vbtn';
  addEventListener('mouseover', (e) => { if (e.target.closest(hot)) ring.classList.add('big'); });
  addEventListener('mouseout',  (e) => { if (e.target.closest(hot)) ring.classList.remove('big'); });
  addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
  addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
})();
