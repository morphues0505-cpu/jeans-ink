/* ============================================
   JEANS·INK — Mockup Studio
   fabric.js canvas + imgly AI background removal
   ============================================ */

import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm';

// ── Denim colors (tsagaan, tsenher, tsaivar tsenher, har, saaral) ──
const COLORS = [
  { key: 'white',     label: 'Цагаан',        hex: '#E7E8EC' },
  { key: 'blue',      label: 'Цэнхэр',         hex: '#3F5E86' },
  { key: 'lightblue', label: 'Цайвар цэнхэр',  hex: '#9FBDDC' },
  { key: 'black',     label: 'Хар',            hex: '#26272B' },
  { key: 'gray',      label: 'Саарал',         hex: '#71767C' },
];

// ── Stage dimensions (computed once) ──
const stageEl = document.getElementById('mkStage');
const CW = Math.min(380, (window.innerWidth || 380) - 40);
const CH = Math.round(CW * 1.5);
stageEl.style.width = CW + 'px';
stageEl.style.height = CH + 'px';

// ── State ──
const state = { type: 'wide', color: COLORS[1], size: 'A4', price: 40000 };

// ── Jeans SVG builder (flat, tintable via fill) ──
function jeansSVG(type, hex) {
  // silhouette path in a 420x600 viewBox
  const body = type === 'wide'
    ? 'M138,66 H282 L302,300 L326,576 L252,576 L216,156 L210,168 L204,156 L168,576 L94,576 L118,300 Z'
    : 'M146,66 H274 L286,300 L262,576 L226,576 L214,156 L210,168 L206,156 L194,576 L158,576 L134,300 Z';
  const seamX = 210;
  return `
  <svg viewBox="0 0 420 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="sh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
        <stop offset="0.5" stop-color="#000000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.14"/>
      </linearGradient>
      <clipPath id="bodyClip"><path d="${body}"/></clipPath>
    </defs>
    <!-- soft ground shadow -->
    <ellipse cx="210" cy="588" rx="120" ry="10" fill="#000" opacity="0.06"/>
    <!-- body -->
    <path d="${body}" fill="${hex}"/>
    <rect x="0" y="0" width="420" height="600" fill="url(#sh)" clip-path="url(#bodyClip)"/>
    <!-- waistband -->
    <g clip-path="url(#bodyClip)">
      <rect x="120" y="60" width="180" height="34" fill="#000" opacity="0.10"/>
      <line x1="120" y1="94" x2="300" y2="94" stroke="#000" stroke-opacity="0.18" stroke-width="2"/>
      <!-- belt loops -->
      <rect x="150" y="60" width="5" height="20" fill="#000" opacity="0.15"/>
      <rect x="265" y="60" width="5" height="20" fill="#000" opacity="0.15"/>
      <!-- button -->
      <circle cx="210" cy="78" r="5" fill="#000" opacity="0.22"/>
      <!-- fly stitch -->
      <path d="M210,86 q10,40 0,72" fill="none" stroke="#fff" stroke-opacity="0.30" stroke-width="1.5" stroke-dasharray="4 4"/>
      <!-- pockets -->
      <path d="M150,96 q24,18 40,2" fill="none" stroke="#fff" stroke-opacity="0.28" stroke-width="1.5" stroke-dasharray="4 3"/>
      <path d="M230,98 q24,16 40,-2" fill="none" stroke="#fff" stroke-opacity="0.28" stroke-width="1.5" stroke-dasharray="4 3"/>
      <!-- center + leg seams -->
      <line x1="${seamX}" y1="160" x2="${type==='wide'?170:185}" y2="572" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>
      <line x1="${seamX}" y1="160" x2="${type==='wide'?250:235}" y2="572" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>
    </g>
    <!-- outline -->
    <path d="${body}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="2"/>
  </svg>`;
}

const jeansHost = document.getElementById('mkJeans');
function renderJeans() { jeansHost.innerHTML = jeansSVG(state.type, state.color.hex); }
renderJeans();

// ── fabric canvas overlay ──
const canvasEl = document.getElementById('mkCanvas');
canvasEl.width = CW; canvasEl.height = CH;
const canvas = new fabric.Canvas('mkCanvas', { backgroundColor: 'transparent', preserveObjectStacking: true });
canvas.setWidth(CW); canvas.setHeight(CH);

const emptyEl = document.getElementById('mkEmpty');
let sticker = null;

function addSticker(url) {
  fabric.Image.fromURL(url, (img) => {
    if (sticker) canvas.remove(sticker);
    const target = CW * 0.42;
    img.scaleToWidth(target);
    img.set({ left: CW / 2, top: CH / 2, originX: 'center', originY: 'center', cornerColor: '#F0401E', cornerStyle: 'circle', transparentCorners: false, borderColor: '#F0401E' });
    canvas.add(img); canvas.setActiveObject(img);
    sticker = img;
    emptyEl.classList.add('hide');
    canvas.renderAll();
  }, { crossOrigin: 'anonymous' });
}

// ── Step 1: jeans type ──
document.querySelectorAll('.mk-type').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.mk-type').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    state.type = el.dataset.type;
    renderJeans();
  });
});

// ── Step 2: colors ──
const colorsHost = document.getElementById('mkColors');
COLORS.forEach((c, i) => {
  const sw = document.createElement('button');
  sw.className = 'mk-color' + (i === 1 ? ' active' : '');
  sw.style.background = c.hex;
  sw.title = c.label;
  sw.addEventListener('click', () => {
    document.querySelectorAll('.mk-color').forEach(x => x.classList.remove('active'));
    sw.classList.add('active');
    state.color = c;
    renderJeans();
  });
  colorsHost.appendChild(sw);
});

// ── Step 3: upload + AI background removal ──
const fileInput = document.getElementById('mkFile');
const statusEl = document.getElementById('mkStatus');
const barEl = document.getElementById('mkBar');
const barFill = document.getElementById('mkBarFill');

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  statusEl.textContent = 'AI дэвсгэр арилгаж байна…';
  statusEl.classList.add('show');
  barEl.classList.add('show'); barFill.style.width = '5%';
  try {
    const blob = await removeBackground(file, {
      progress: (key, current, total) => {
        const pct = total ? Math.round((current / total) * 100) : 0;
        if (key && key.indexOf('fetch') === 0) {
          statusEl.textContent = `AI model татаж байна… ${pct}%`;
          barFill.style.width = Math.max(5, pct) + '%';
        } else {
          statusEl.textContent = 'Боловсруулж байна…';
          barFill.style.width = '92%';
        }
      },
    });
    const url = URL.createObjectURL(blob);
    addSticker(url);
    statusEl.textContent = '✓ Дэвсгэр арилсан';
    barFill.style.width = '100%';
    setTimeout(() => { barEl.classList.remove('show'); }, 800);
  } catch (err) {
    console.error('bg removal failed', err);
    // fallback: use original image without removal
    statusEl.textContent = '⚠ Дэвсгэр арилгаж чадсангүй — эх зургийг ашиглалаа';
    barEl.classList.remove('show');
    addSticker(URL.createObjectURL(file));
  }
});

// ── Step 4: size ──
document.querySelectorAll('.mk-size').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.mk-size').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    state.size = el.dataset.size;
    state.price = parseInt(el.dataset.price, 10);
  });
});

// ── Toolbar ──
document.getElementById('mkCenter').addEventListener('click', () => {
  if (!sticker) return;
  sticker.set({ left: CW / 2, top: CH / 2 }); sticker.setCoords(); canvas.renderAll();
});
document.getElementById('mkFlip').addEventListener('click', () => {
  if (!sticker) return;
  sticker.set('flipX', !sticker.flipX); canvas.renderAll();
});
document.getElementById('mkDelete').addEventListener('click', () => {
  if (!sticker) return;
  canvas.remove(sticker); sticker = null; emptyEl.classList.remove('hide');
});

// ── Compose jeans SVG + sticker into one PNG (2x) ──
function composeMockup() {
  return new Promise((resolve) => {
    const scale = 2;
    const out = document.createElement('canvas');
    out.width = CW * scale; out.height = CH * scale;
    const ctx = out.getContext('2d');
    const svgStr = jeansSVG(state.type, state.color.hex);
    const svgImg = new Image();
    svgImg.onload = () => {
      ctx.drawImage(svgImg, 0, 0, out.width, out.height);
      ctx.drawImage(canvas.lowerCanvasEl, 0, 0, out.width, out.height);
      resolve(out.toDataURL('image/png'));
    };
    svgImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  });
}

// ── Download ──
document.getElementById('mkDownload').addEventListener('click', async () => {
  const data = await composeMockup();
  const a = document.createElement('a');
  a.href = data; a.download = `jeans-ink-mockup-${state.type}-${state.color.key}.png`;
  a.click();
});

// ── Continue → order (Phase B will wire payment + Sheet + notification) ──
document.getElementById('mkContinue').addEventListener('click', async () => {
  if (!sticker) { alert('Эхлээд наах зургаа upload хийнэ үү.'); return; }
  // generate a client-side order code (Phase B: POST to Apps Script → Sheet + notify)
  const code = 'JI-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  const data = await composeMockup();
  // auto-download mockup so the customer can attach it in DM for now
  const a = document.createElement('a');
  a.href = data; a.download = `jeans-ink-${code}.png`; a.click();
  // stash order draft for the order page
  const draft = { code, type: state.type, color: state.color.label, size: state.size, price: state.price, ts: Date.now() };
  try { localStorage.setItem('ji_order_draft', JSON.stringify(draft)); } catch (e) {}
  // route to order page with the code
  location.href = `order.html?code=${encodeURIComponent(code)}&type=${state.type}&color=${encodeURIComponent(state.color.label)}&size=${state.size}`;
});
