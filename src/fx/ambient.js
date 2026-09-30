import { gsap, $, $$, scroll, finePointer, isMobile, reduced } from '../core.js';
import { cookieURL, cookieCanvas, FLAVORS, rng } from '../art/cookie.js';

/* ---------------- floating crumbs over the whole page ---------------- */
export function initCrumbs() {
  const c = $('.crumbs-fx');
  if (!c || reduced()) return;
  const ctx = c.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const r = rng(3);
  let W = 0, H = 0;
  const N = isMobile() ? 18 : 34;
  const colors = ['#c88a4e', '#a86a35', '#3b1f12', '#e2b27a', '#f58eab'];
  const P = Array.from({ length: N }, () => ({
    x: r(), y: r(), s: 2 + r() * 5, vx: (r() - 0.5) * 0.02, vy: -0.01 - r() * 0.02,
    rot: r() * 6, vr: (r() - 0.5) * 0.02, c: colors[Math.floor(r() * colors.length)], sides: 5 + Math.floor(r() * 3), depth: 0.3 + r() * 0.7,
  }));
  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const resize = () => { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);

  gsap.ticker.add((t, dt) => {
    if (document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    const k = Math.min(dt, 50) / 16.6;
    const push = scroll.v * 0.0006;
    for (const p of P) {
      p.x += p.vx * 0.05 * k;
      p.y += (p.vy * 0.05 - push * p.depth) * k;
      p.rot += p.vr * k;
      const px = p.x * W, py = p.y * H;
      const dx = px - mouse.x, dy = py - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 12000) { const d = Math.sqrt(d2) || 1; p.x += (dx / d) * 0.004; p.y += (dy / d) * 0.004; }
      if (p.y < -0.05) p.y = 1.05; if (p.y > 1.05) p.y = -0.05;
      if (p.x < -0.05) p.x = 1.05; if (p.x > 1.05) p.x = -0.05;
      ctx.save(); ctx.translate(px, py); ctx.rotate(p.rot);
      ctx.globalAlpha = 0.5 + p.depth * 0.5;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      for (let i = 0; i < p.sides; i++) {
        const a = (i / p.sides) * Math.PI * 2, rr = p.s * (0.7 + ((i * 37) % 10) / 25);
        i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  });
}

/* ---------------- cookie cursor ---------------- */
export function initCursor() {
  if (!finePointer() || isMobile()) return;
  const el = $('.cursor'), ck = $('.cursor-cookie', el), label = $('.cursor-label', el);
  document.documentElement.classList.add('has-cursor');
  ck.style.backgroundImage = `url(${cookieURL(160, { ...FLAVORS.chocolateChip, seed: 4, shadow: false })})`;
  const pos = { x: -100, y: -100 }, m = { x: -100, y: -100 };
  const setX = gsap.quickSetter(el, 'x', 'px'), setY = gsap.quickSetter(el, 'y', 'px');
  let rot = 0;
  addEventListener('mousemove', (e) => { m.x = e.clientX; m.y = e.clientY; el.classList.add('on'); }, { passive: true });
  document.addEventListener('mouseleave', () => el.classList.remove('on'));
  gsap.ticker.add(() => {
    const dx = m.x - pos.x;
    pos.x += dx * 0.2; pos.y += (m.y - pos.y) * 0.2;
    rot += dx * 0.15;
    setX(pos.x); setY(pos.y);
    ck.style.rotate = `${rot.toFixed(1)}deg`;
  });
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('a, button, [data-cursor]');
    el.classList.toggle('is-order', !!t);
    if (t) label.textContent = t.dataset.cursor === 'order' ? 'order' : 'yum';
  });
}

/* ---------------- loader: the cookie gets eaten as the site loads ----------------
   createLoader() paints the cookie immediately; progress(p) follows real init work;
   finish() runs the last bites and opens the page. */
export function createLoader() {
  const root = $('.loader');
  const canvas = $('.loader-canvas', root);
  const ctx = canvas.getContext('2d');
  const count = $('[data-count]', root);
  const line = $('.loader-line', root);
  const lines = ['preheating the oven…', 'creaming the butter…', 'folding in the chips…', 'fresh out of the oven!'];
  const bites = [{ angle: -0.5, size: 0.3 }, { angle: 0.6, size: 0.36 }, { angle: 2.3, size: 0.4 }, { angle: 3.6, size: 0.45 }];
  let stage = -1;
  const shown = { v: 0 };
  const draw = (n) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cookieCanvas(520, { ...FLAVORS.chocolateChip, seed: 9, bite: n ? bites.slice(0, n) : null }), 0, 0);
  };
  const render = () => {
    count.textContent = Math.round(shown.v);
    const st = Math.min(4, Math.floor(shown.v / 25));
    if (st !== stage) {
      stage = st; draw(st); line.textContent = lines[Math.max(0, Math.min(3, st - 1))];
      if (st) gsap.fromTo(canvas, { scale: 0.94, rotate: -6 }, { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(3)' });
    }
  };
  render();
  gsap.fromTo(canvas, { scale: 0.6, rotate: -30 }, { scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.6)' });
  root.style.clipPath = 'circle(150% at 50% 50%)';
  return {
    progress(p) { gsap.to(shown, { v: Math.min(p, 90), duration: 0.35, ease: 'power1.out', onUpdate: render, overwrite: true }); },
    finish() {
      return new Promise((resolve) => {
        gsap.timeline({ onComplete: () => root.remove() })
          .to(shown, { v: 100, duration: 1.4, ease: 'power1.inOut', onUpdate: render })
          .to([count, line], { y: -30, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, '+=0.15')
          .to(canvas, { scale: 0, rotate: 180, duration: 0.5, ease: 'back.in(2)' }, '<')
          .add(resolve, '-=0.1')
          .to(root, { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: 'power3.inOut' }, '-=0.05');
      });
    },
  };
}

/* ---------------- header hides on scroll down ---------------- */
export function initHeader() {
  const h = $('.header');
  let last = 0;
  gsap.ticker.add(() => {
    const y = scroll.y;
    h.classList.toggle('is-scrolled', y > 40);
    if (Math.abs(y - last) > 6) { h.classList.toggle('is-hidden', y > last && y > 400); last = y; }
  });
}
