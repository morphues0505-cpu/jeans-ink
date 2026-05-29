/* ============================================
   JEANS·INK — Main JS
   ============================================ */

/* ── SOCIAL LINKS (нэг газраас удирдана) ──────
   IG нээгдсэн үед instagram-д линкээ тавиад
   enabled: true болгоно. Болоо.            */
const SOCIAL = {
  facebook:  { url: 'https://www.facebook.com/profile.php?id=61589026276209', enabled: true },
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

// ── Active nav link ──────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// ── Scroll reveal ─────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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
