/* ============================================
   JEANS·INK — Lightfall animated hero overlay
   Vanilla port of the React Bits <Lightfall/> (ogl + WebGL shader).
   Mounts on #heroLightfall, blends over the existing hero background.
   Disabled on phones / reduced-motion for performance.
   ============================================ */
import { Renderer, Program, Mesh, Triangle } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm';

const mount = document.getElementById('heroLightfall');
const small = window.matchMedia('(max-width: 768px)').matches;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!mount) console.warn('[lightfall] #heroLightfall not found');
else if (small) console.info('[lightfall] disabled on small screen');
else if (reduce) console.info('[lightfall] disabled (reduced motion)');
else {
  try { start(mount); console.info('[lightfall] started'); }
  catch (e) { console.error('[lightfall] failed', e); }
}

function hexToRGB(hex) {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255];
}
function prepColors(input) {
  const MAX = 8;
  const base = (input && input.length ? input : ['#C5F230', '#63B3ED', '#A06BFF']).slice(0, MAX);
  const count = base.length, arr = [], avg = [0, 0, 0];
  for (let i = 0; i < MAX; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
  for (let i = 0; i < count; i++) { avg[0] += arr[i][0]; avg[1] += arr[i][1]; avg[2] += arr[i][2]; }
  avg[0] /= count; avg[1] /= count; avg[2] /= count;
  return { arr, count, avg };
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
precision highp float;
uniform vec3 iResolution; uniform vec2 iMouse; uniform float iTime;
uniform vec3 uColor0; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6; uniform vec3 uColor7;
uniform int uColorCount;
uniform vec3 uBgColor; uniform vec3 uMouseColor;
uniform float uSpeed; uniform int uStreakCount; uniform float uStreakWidth; uniform float uStreakLength;
uniform float uGlow; uniform float uDensity; uniform float uTwinkle; uniform float uZoom;
uniform float uBgGlow; uniform float uOpacity;
uniform float uMouseEnabled; uniform float uMouseStrength; uniform float uMouseRadius;
varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount; if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0; if (idx == 1) return uColor1; if (idx == 2) return uColor2;
  if (idx == 3) return uColor3; if (idx == 4) return uColor4; if (idx == 5) return uColor5;
  if (idx == 6) return uColor6; return uColor7;
}
vec3 tanhv(vec3 x) { vec3 e = exp(-2.0 * x); return (1.0 - e) / (1.0 + e); }
vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x; float z = 0.0; float d = 1e3; vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O)); z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}
void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy; vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);
  vec2 c0 = sceneC(C, r); vec2 cdx = sceneC(C + vec2(1.0, 0.0), r); vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0; vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy); C = c0;
  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);
  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x; float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }
  float zr = 5e-4 * uStreakWidth; vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);
  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0); Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic); vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle); weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }
  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}
void main() { vec4 color; mainImage(color, vUv * iResolution.xy); gl_FragColor = color; }
`;

function start(container) {
  // brand-tinted, subtle settings for a hero overlay
  const opts = {
    colors: ['#C5F230', '#63B3ED', '#FF2E63'],
    backgroundColor: '#0D0D0D',
    speed: 0.7, streakCount: 9, streakWidth: 1.1, streakLength: 1,
    glow: 1.15, density: 0.85, twinkle: 1, zoom: 2.6, backgroundGlow: 0.6, opacity: 0.9,
    mouseInteraction: true, mouseStrength: 0.7, mouseRadius: 0.9, mouseDampening: 0.15
  };

  const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.25), alpha: true, antialias: true });
  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(canvas);

  const { arr, count, avg } = prepColors(opts.colors);
  const uniforms = {
    iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
    iMouse: { value: [0, 0] }, iTime: { value: 0 },
    uColor0: { value: arr[0] }, uColor1: { value: arr[1] }, uColor2: { value: arr[2] }, uColor3: { value: arr[3] },
    uColor4: { value: arr[4] }, uColor5: { value: arr[5] }, uColor6: { value: arr[6] }, uColor7: { value: arr[7] },
    uColorCount: { value: count },
    uBgColor: { value: hexToRGB(opts.backgroundColor) }, uMouseColor: { value: avg },
    uSpeed: { value: opts.speed }, uStreakCount: { value: opts.streakCount }, uStreakWidth: { value: opts.streakWidth },
    uStreakLength: { value: opts.streakLength }, uGlow: { value: opts.glow }, uDensity: { value: opts.density },
    uTwinkle: { value: opts.twinkle }, uZoom: { value: opts.zoom }, uBgGlow: { value: opts.backgroundGlow },
    uOpacity: { value: opts.opacity }, uMouseEnabled: { value: opts.mouseInteraction ? 1 : 0 },
    uMouseStrength: { value: opts.mouseStrength }, uMouseRadius: { value: opts.mouseRadius }
  };

  const program = new Program(gl, { vertex, fragment, uniforms });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
  };
  resize();
  new ResizeObserver(resize).observe(container);

  // pointer light follows cursor (container is pointer-events:none, so listen on window)
  const target = [0, 0];
  window.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    const scale = renderer.dpr || 1;
    target[0] = (e.clientX - rect.left) * scale;
    target[1] = (rect.height - (e.clientY - rect.top)) * scale;
  }, { passive: true });

  let last = 0, running = true;
  // pause when the hero scrolls out of view (save GPU)
  const io = new IntersectionObserver(es => { running = es[0].isIntersecting; }, { threshold: 0 });
  io.observe(container);

  const tau = Math.max(1e-4, opts.mouseDampening);
  const loop = t => {
    requestAnimationFrame(loop);
    if (!running) return;
    uniforms.iTime.value = t * 0.001;
    if (!last) last = t;
    const dt = (t - last) / 1000; last = t;
    const f = Math.min(1, 1 - Math.exp(-dt / tau));
    const cur = uniforms.iMouse.value;
    cur[0] += (target[0] - cur[0]) * f; cur[1] += (target[1] - cur[1]) * f;
    try { renderer.render({ scene: mesh }); } catch (e) { /* ignore */ }
  };
  requestAnimationFrame(loop);
}
