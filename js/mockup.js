/* ============================================
   JEANS·INK — Mockup Studio
   Real 2D jeans photo PER COLOR + fabric.js + imgly AI bg removal
   ============================================ */

import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm';

// ── Colors: swatch dot (UI) + image key ──
// Image file per type+color:  assets/photos/jeans-<type>-<key>.jpg
// (fallback to assets/photos/jeans-<type>.jpg if a color photo is missing)
const COLORS = [
  { key: 'lightblue', label: 'Цайвар цэнхэр', swatch: '#9FBDDC' },
  { key: 'blue',      label: 'Цэнхэр',         swatch: '#3F5E86' },
  { key: 'white',     label: 'Цагаан',         swatch: '#E7E8EC' },
  { key: 'gray',      label: 'Саарал',         swatch: '#71767C' },
  { key: 'black',     label: 'Хар',            swatch: '#26272B' },
];

// ── State ──
const state = { type: 'wide', color: COLORS[0], view: 'front', size: 'A4', price: 29000 };
const FB_URL = 'https://www.facebook.com/profile.php?id=61589026276209';

// ── Stage dimensions (portrait 3:4) ──
const stageEl = document.getElementById('mkStage');
const CW = Math.min(420, (window.innerWidth || 420) - 40);
const CH = Math.round(CW * 1.33);
stageEl.style.width = CW + 'px';
stageEl.style.height = CH + 'px';

// ── Jeans base photo element + missing-photo message ──
const jeansHost = document.getElementById('mkJeans');
const baseImg = document.createElement('img');
baseImg.alt = 'jeans';
baseImg.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
jeansHost.appendChild(baseImg);

const missMsg = document.createElement('div');
missMsg.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;text-align:center;padding:24px;font-family:Space Mono,monospace;font-size:.74rem;color:var(--text-dim)';
jeansHost.appendChild(missMsg);

function viewSuffix() { return state.view === 'back' ? '-back' : ''; }
function srcFor(type, key) { return `assets/photos/jeans-${type}-${key}${viewSuffix()}.jpg`; }
function genericFor(type) { return `assets/photos/jeans-${type}${viewSuffix()}.jpg`; }

function renderJeans() {
  missMsg.style.display = 'none';
  baseImg.style.display = 'block';
  baseImg.dataset.stage = 'color';            // first try the per-color photo
  baseImg.src = srcFor(state.type, state.color.key);
}
baseImg.onerror = () => {
  if (baseImg.dataset.stage === 'color') {
    baseImg.dataset.stage = 'generic';        // fall back to jeans-<type>[-back].jpg
    baseImg.src = genericFor(state.type);
  } else {
    baseImg.style.display = 'none';
    missMsg.style.display = 'flex';
    const v = state.view === 'back' ? 'хойд' : 'урд';
    missMsg.innerHTML = `«${state.color.label}» (${v}) зураг алга.<br>assets/photos/jeans-${state.type}-${state.color.key}${viewSuffix()}.jpg хадгална уу.`;
  }
};
renderJeans();

// ── View toggle (front / back) ──
document.querySelectorAll('.mk-vbtn').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.mk-vbtn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    state.view = el.dataset.view;
    renderJeans();
  });
});

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
    img.scaleToWidth(CW * 0.4);
    img.set({ left: CW / 2, top: CH / 2, originX: 'center', originY: 'center',
      cornerColor: '#F0401E', cornerStyle: 'circle', transparentCorners: false, borderColor: '#F0401E' });
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
  sw.className = 'mk-color' + (i === 0 ? ' active' : '');
  sw.style.background = c.swatch;
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
    addSticker(URL.createObjectURL(blob));
    statusEl.textContent = '✓ Дэвсгэр арилсан';
    barFill.style.width = '100%';
    setTimeout(() => barEl.classList.remove('show'), 800);
  } catch (err) {
    console.error('bg removal failed', err);
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

// ── Compose base photo + sticker into one PNG (2x) ──
function composeMockup() {
  return new Promise((resolve) => {
    const scale = 2;
    const out = document.createElement('canvas');
    out.width = CW * scale; out.height = CH * scale;
    const ctx = out.getContext('2d');
    const iw = baseImg.naturalWidth || CW, ih = baseImg.naturalHeight || CH;
    const s = Math.min(out.width / iw, out.height / ih);
    const dw = iw * s, dh = ih * s, dx = (out.width - dw) / 2, dy = (out.height - dh) / 2;
    if (baseImg.style.display !== 'none') ctx.drawImage(baseImg, dx, dy, dw, dh);
    ctx.drawImage(canvas.lowerCanvasEl, 0, 0, out.width, out.height);
    resolve(out.toDataURL('image/png'));
  });
}

// ── Download ──
document.getElementById('mkDownload').addEventListener('click', async () => {
  const data = await composeMockup();
  const a = document.createElement('a');
  a.href = data; a.download = `jeans-ink-mockup-${state.type}-${state.color.key}-${state.view}.png`;
  a.click();
});

// ── Continue → confirm → receipt (Phase B: POST to Apps Script + Telegram/Email) ──
const typeMn = () => (state.type === 'wide' ? 'Өргөн' : 'Нарийн');
const viewMn = () => (state.view === 'back' ? 'Хойд' : 'Урд');
let lastMockup = null;
let lastCode = null;

document.getElementById('mkContinue').addEventListener('click', async () => {
  if (!sticker) { alert('Эхлээд наах зургаа upload хийнэ үү.'); return; }
  lastMockup = await composeMockup();
  document.getElementById('cfImg').src = lastMockup;
  document.getElementById('cfSummary').innerHTML =
    `Jeans: <b>${typeMn()}</b><br>Өнгө: <b>${state.color.label}</b><br>Тал: <b>${viewMn()}</b><br>Хэмжээ: <b>${state.size}</b>`;
  document.getElementById('cfPrice').textContent = state.price.toLocaleString() + '₮';
  // show confirm state, hide receipt
  document.getElementById('cfConfirm').style.display = 'block';
  document.getElementById('cfReceipt').style.display = 'none';
  document.getElementById('cfStep').textContent = '— Баталгаажуулах';
  document.getElementById('cfTitle').textContent = 'Захиалга';
  window.openModal('confirmModal');
});

document.getElementById('cfConfirmBtn').addEventListener('click', () => {
  lastCode = String(Math.floor(10000 + Math.random() * 90000)); // random 5-digit (Phase B: Sheet ensures no repeats)
  document.getElementById('cfCode').textContent = lastCode;
  document.getElementById('cfImg2').src = lastMockup;
  document.getElementById('cfMsgr').href = FB_URL;
  // switch to receipt
  document.getElementById('cfConfirm').style.display = 'none';
  document.getElementById('cfReceipt').style.display = 'block';
  document.getElementById('cfStep').textContent = '— Бүртгэгдлээ';
  document.getElementById('cfTitle').textContent = 'Захиалга амжилттай';
  // save draft locally (Phase B will POST this + image to Google Apps Script)
  const draft = { code: lastCode, type: state.type, color: state.color.label, view: state.view,
    size: state.size, price: state.price, ts: Date.now() };
  try { localStorage.setItem('ji_order_draft', JSON.stringify(draft)); } catch (e) {}
});

document.getElementById('cfDownload').addEventListener('click', () => {
  if (!lastMockup) return;
  const a = document.createElement('a');
  a.href = lastMockup; a.download = `jeans-ink-${lastCode || 'mockup'}.png`; a.click();
});

document.getElementById('cfCopy').addEventListener('click', async () => {
  if (!lastCode) return;
  try { await navigator.clipboard.writeText(lastCode); document.getElementById('cfCopy').textContent = '✓ Хуулсан'; }
  catch (e) { alert('Захиалгын дугаар: ' + lastCode); }
});
