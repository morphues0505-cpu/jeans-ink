/* ============================================
   JEANS·INK — Mockup Studio
   Front + Back shown together · per-color photos · imgly AI bg removal
   ============================================ */

import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm';

const COLORS = [
  { key: 'lightblue', label: 'Цайвар цэнхэр', swatch: '#9FBDDC' },
  { key: 'blue',      label: 'Цэнхэр',         swatch: '#3F5E86' },
  { key: 'white',     label: 'Цагаан',         swatch: '#E7E8EC' },
  { key: 'gray',      label: 'Саарал',         swatch: '#71767C' },
  { key: 'black',     label: 'Хар',            swatch: '#26272B' },
];

const CFG = window.JI_CONFIG || {};
const FB_URL = CFG.FB_URL || 'https://www.facebook.com/profile.php?id=61589026276209';
const API = CFG.JI_API || '';
const state = { type: 'wide', color: COLORS[0], size: 'A4', price: 29000, activeSide: 'front' };

// ── Stage size (two columns on desktop, stacked on mobile) ──
const isNarrow = (window.innerWidth || 1000) < 600;
const CW = isNarrow ? Math.min(360, (window.innerWidth || 360) - 40) : 300;
const CH = Math.round(CW * 1.33);

let lastSticker = null;     // last bg-removed sticker URL
let lastCode = null;
let lastMockup = null;

// ── Build one side (jeans photo + fabric canvas) ──
function buildSide(side) {
  const stageEl = document.getElementById(side === 'front' ? 'mkStageFront' : 'mkStageBack');
  const jeansHost = document.getElementById(side === 'front' ? 'mkJeansFront' : 'mkJeansBack');
  const canvasEl = document.getElementById(side === 'front' ? 'mkCanvasFront' : 'mkCanvasBack');
  const emptyEl = document.getElementById(side === 'front' ? 'mkEmptyFront' : 'mkEmptyBack');

  stageEl.style.width = CW + 'px';
  stageEl.style.height = CH + 'px';

  const baseImg = document.createElement('img');
  baseImg.alt = side;
  baseImg.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
  const miss = document.createElement('div');
  miss.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;text-align:center;padding:18px;font-family:Montserrat,sans-serif;font-size:.7rem;color:var(--text-dim)';
  jeansHost.appendChild(baseImg);
  jeansHost.appendChild(miss);

  canvasEl.width = CW; canvasEl.height = CH;
  const canvas = new fabric.Canvas(canvasEl, { backgroundColor: 'transparent', preserveObjectStacking: true, allowTouchScrolling: true, selection: false });
  canvas.setWidth(CW); canvas.setHeight(CH);

  const s = { side, stageEl, baseImg, miss, emptyEl, canvas, sticker: null };

  baseImg.onerror = () => {
    if (baseImg.dataset.stage === 'color') {
      baseImg.dataset.stage = 'generic';
      baseImg.src = `assets/photos/jeans-${state.type}${side === 'back' ? '-back' : ''}.jpg`;
    } else {
      baseImg.style.display = 'none';
      miss.style.display = 'flex';
      miss.innerHTML = `«${state.color.label}» зураг алга`;
    }
  };
  // focus this side when its stage clicked
  stageEl.addEventListener('mousedown', () => setActiveSide(side));
  stageEl.addEventListener('touchstart', () => setActiveSide(side), { passive: true });
  return s;
}

const sides = { front: buildSide('front'), back: buildSide('back') };

function renderJeans() {
  ['front', 'back'].forEach(side => {
    const s = sides[side];
    s.miss.style.display = 'none';
    s.baseImg.style.display = 'block';
    s.baseImg.dataset.stage = 'color';
    s.baseImg.src = `assets/photos/jeans-${state.type}-${state.color.key}${side === 'back' ? '-back' : ''}.jpg`;
  });
}
renderJeans();

// ── Active side ──
function setActiveSide(side) {
  state.activeSide = side;
  document.querySelectorAll('.mk-side-pick .mk-vbtn').forEach(b =>
    b.classList.toggle('active', b.dataset.side === side));
  sides.front.stageEl.classList.toggle('sel', side === 'front');
  sides.back.stageEl.classList.toggle('sel', side === 'back');
}
document.querySelectorAll('.mk-side-pick .mk-vbtn').forEach(b => {
  b.addEventListener('click', () => setActiveSide(b.dataset.side));
});

// ── Add sticker to a side ──
function addSticker(url, side, idx) {
  const s = sides[side];
  fabric.Image.fromURL(url, (img) => {
    img.scaleToWidth(CW * 0.42);
    const off = (idx || 0) * 20;
    img.set({ left: CW / 2 + off, top: CH / 2 + off, originX: 'center', originY: 'center',
      cornerColor: '#C5F230', cornerStyle: 'circle', transparentCorners: false, borderColor: '#C5F230' });
    s.canvas.add(img); s.canvas.setActiveObject(img);
    s.sticker = img;             // last added (stacking allowed — several stickers per side)
    s.emptyEl.classList.add('hide');
    s.canvas.renderAll();
  }, { crossOrigin: 'anonymous' });
}

// ── Ready-sticker tray (tap to add to active side) ──
const trayEl = document.getElementById('mkTray');
const trayHint = document.getElementById('mkTrayHint');
const traySet = new Set();
function addToTray(src) {
  if (traySet.has(src)) return;
  traySet.add(src);
  const item = document.createElement('div');
  item.className = 'mk-tray-item';
  item.title = 'Идэвхтэй тал дээр нэмэх';
  item.innerHTML = `<img src="${src}" alt="">`;
  item.addEventListener('click', () => addSticker(src, state.activeSide));
  trayEl.appendChild(item);
  if (trayHint) trayHint.textContent = 'Наалт дээр дарж идэвхтэй (сонгосон) тал дээрээ нэмнэ.';
}

// ── Type & color ──
document.querySelectorAll('.mk-type').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.mk-type').forEach(t => t.classList.remove('active'));
    el.classList.add('active'); state.type = el.dataset.type; renderJeans();
  });
});
const colorsHost = document.getElementById('mkColors');
COLORS.forEach((c, i) => {
  const sw = document.createElement('button');
  sw.className = 'mk-color' + (i === 0 ? ' active' : '');
  sw.style.background = c.swatch; sw.title = c.label;
  sw.addEventListener('click', () => {
    document.querySelectorAll('.mk-color').forEach(x => x.classList.remove('active'));
    sw.classList.add('active'); state.color = c; renderJeans();
  });
  colorsHost.appendChild(sw);
});

// ── Upload + AI bg removal ──
const fileInput = document.getElementById('mkFile');
const statusEl = document.getElementById('mkStatus');
const barEl = document.getElementById('mkBar');
const barFill = document.getElementById('mkBarFill');

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  statusEl.textContent = 'AI дэвсгэр арилгаж байна…';
  statusEl.classList.add('show'); barEl.classList.add('show'); barFill.style.width = '5%';
  try {
    const blob = await removeBackground(file, {
      progress: (key, cur, total) => {
        const pct = total ? Math.round((cur / total) * 100) : 0;
        if (key && key.indexOf('fetch') === 0) { statusEl.textContent = `AI model татаж байна… ${pct}%`; barFill.style.width = Math.max(5, pct) + '%'; }
        else { statusEl.textContent = 'Боловсруулж байна…'; barFill.style.width = '92%'; }
      },
    });
    lastSticker = URL.createObjectURL(blob);
    addSticker(lastSticker, state.activeSide); addToTray(lastSticker);
    statusEl.textContent = `✓ Дэвсгэр арилсан — ${state.activeSide === 'back' ? 'хойд' : 'урд'} талд нэмэв`;
    barFill.style.width = '100%';
    setTimeout(() => barEl.classList.remove('show'), 800);
  } catch (err) {
    console.error('bg removal failed', err);
    statusEl.textContent = '⚠ Дэвсгэр арилгаж чадсангүй — эх зургийг ашиглалаа';
    barEl.classList.remove('show');
    lastSticker = URL.createObjectURL(file);
    addSticker(lastSticker, state.activeSide); addToTray(lastSticker);
  }
});

// ── Size ──
document.querySelectorAll('.mk-size').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.mk-size').forEach(s => s.classList.remove('active'));
    el.classList.add('active'); state.size = el.dataset.size; state.price = parseInt(el.dataset.price, 10);
  });
});

// ── Toolbar (acts on whichever side has an active object) ──
function activeCtx() {
  for (const side of ['front', 'back']) {
    const o = sides[side].canvas.getActiveObject();
    if (o) return { s: sides[side], o };
  }
  // fallback: the active side
  return { s: sides[state.activeSide], o: sides[state.activeSide].sticker };
}
document.getElementById('mkOther').addEventListener('click', () => {
  if (!lastSticker) { alert('Эхлээд зураг upload хийнэ үү.'); return; }
  const other = state.activeSide === 'front' ? 'back' : 'front';
  addSticker(lastSticker, other);
  setActiveSide(other);
});
function rotateActive(deg) {
  const { s, o } = activeCtx(); if (!o) return;
  o.rotate(((o.angle || 0) + deg + 360) % 360); o.setCoords(); s.canvas.renderAll();
}
document.getElementById('mkRotL').addEventListener('click', () => rotateActive(-15));
document.getElementById('mkRotR').addEventListener('click', () => rotateActive(15));
document.getElementById('mkCenter').addEventListener('click', () => {
  const { s, o } = activeCtx(); if (!o) return;
  o.set({ left: CW / 2, top: CH / 2 }); o.setCoords(); s.canvas.renderAll();
});
document.getElementById('mkFlip').addEventListener('click', () => {
  const { o, s } = activeCtx(); if (!o) return;
  o.set('flipX', !o.flipX); s.canvas.renderAll();
});
document.getElementById('mkDelete').addEventListener('click', () => {
  const { s, o } = activeCtx(); if (!o) return;
  s.canvas.remove(o); if (s.sticker === o) s.sticker = null; s.emptyEl.classList.remove('hide');
});

// ── Compose front + back into one PNG ──
function drawSide(ctx, s, offsetX, scale) {
  const img = s.baseImg, iw = img.naturalWidth || CW, ih = img.naturalHeight || CH;
  const sc = Math.min((CW * scale) / iw, (CH * scale) / ih);
  const dw = iw * sc, dh = ih * sc, dx = offsetX + ((CW * scale) - dw) / 2, dy = ((CH * scale) - dh) / 2;
  if (img.style.display !== 'none') ctx.drawImage(img, dx, dy, dw, dh);
  ctx.drawImage(s.canvas.lowerCanvasEl, offsetX, 0, CW * scale, CH * scale);
}
function composeMockup() {
  return new Promise((resolve) => {
    const scale = 2, gap = 24 * scale;
    const out = document.createElement('canvas');
    out.width = CW * scale * 2 + gap; out.height = CH * scale;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#0D0D0D'; ctx.fillRect(0, 0, out.width, out.height);
    drawSide(ctx, sides.front, 0, scale);
    drawSide(ctx, sides.back, CW * scale + gap, scale);
    resolve(out.toDataURL('image/png'));
  });
}

document.getElementById('mkDownload').addEventListener('click', async () => {
  const data = await composeMockup();
  const a = document.createElement('a');
  a.href = data; a.download = `jeans-ink-mockup-${state.type}-${state.color.key}.png`; a.click();
});

// ── Continue → confirm → receipt ──
const typeMn = () => (state.type === 'wide' ? 'Өргөн' : 'Нарийн');

document.getElementById('mkContinue').addEventListener('click', async () => {
  if (!sides.front.sticker && !sides.back.sticker) { alert('Эхлээд наах зургаа upload хийнэ үү.'); return; }
  lastMockup = await composeMockup();
  document.getElementById('cfImg').src = lastMockup;
  const placed = [sides.front.sticker ? 'Урд' : null, sides.back.sticker ? 'Хойд' : null].filter(Boolean).join(' + ');
  document.getElementById('cfSummary').innerHTML =
    `Jeans: <b>${typeMn()}</b><br>Өнгө: <b>${state.color.label}</b><br>Наалт: <b>${placed}</b><br>Хэмжээ: <b>${state.size}</b>`;
  document.getElementById('cfPrice').textContent = state.price.toLocaleString() + '₮';
  document.getElementById('cfConfirm').style.display = 'block';
  document.getElementById('cfReceipt').style.display = 'none';
  document.getElementById('cfStep').textContent = '— Баталгаажуулах';
  document.getElementById('cfTitle').textContent = 'Захиалга';
  window.openModal('confirmModal');
});

const cfConfirmBtn = document.getElementById('cfConfirmBtn');
cfConfirmBtn.addEventListener('click', async () => {
  const order = { type: typeMn(), color: state.color.label, size: state.size, price: state.price };
  let code = null;

  if (API) {
    const old = cfConfirmBtn.textContent;
    cfConfirmBtn.textContent = 'Бүртгэж байна…'; cfConfirmBtn.disabled = true;
    try {
      // text/plain → preflight-гүй (CORS), Apps Script postData.contents-аар уншина
      const res = await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'create', ...order }) });
      const data = await res.json();
      if (data && data.ok && data.code) code = String(data.code);
    } catch (e) { console.warn('backend create failed, offline fallback', e); }
    cfConfirmBtn.textContent = old; cfConfirmBtn.disabled = false;
  }

  // Offline fallback (backend тохируулаагүй эсвэл алдаа гарвал)
  if (!code) code = String(Math.floor(10000 + Math.random() * 90000));

  lastCode = code;
  document.getElementById('cfCode').textContent = lastCode;
  document.getElementById('cfImg2').src = lastMockup;
  document.getElementById('cfMsgr').href = FB_URL;
  document.getElementById('cfConfirm').style.display = 'none';
  document.getElementById('cfReceipt').style.display = 'block';
  document.getElementById('cfStep').textContent = '— Бүртгэгдлээ';
  document.getElementById('cfTitle').textContent = 'Захиалга амжилттай';
  const draft = { code: lastCode, type: state.type, color: state.color.label, size: state.size, price: state.price, ts: Date.now() };
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

// ── Patterns chosen on the Catalog page → auto-add to FRONT ──
(function fillTray() {
  const DEFAULTS = ['p1','p2','p4','p5','p9','p11','p16','p21'].map(id => `assets/patterns/${id}.webp?v=3`);
  let sel = [];
  try { sel = JSON.parse(localStorage.getItem('ji_patterns') || '[]'); } catch (e) {}
  localStorage.removeItem('ji_patterns');
  // 1) tray-д бүгдийг нэмнэ (сонгосон нь эхэнд)
  [...sel, ...DEFAULTS].forEach(addToTray);
  // 2) catalog-аас сонгож ирсэн наалтуудыг jeans-ний урд тал дээр шууд байрлуулна
  if (sel.length) {
    setActiveSide('front');
    sel.forEach((src, i) => addSticker(src, 'front', i));
  }
})();
