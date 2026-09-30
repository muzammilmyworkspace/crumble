import { gsap, ScrollTrigger, $, $$, scrubbed, isMobile, finePointer } from '../core.js';
import { cookieCanvas, FLAVORS, rng } from '../art/cookie.js';

const put = (host, size, opts) => {
  const c = cookieCanvas(size, opts);
  const el = c.cloneNode(); el.getContext('2d').drawImage(c, 0, 0);
  host.appendChild(el);
  return el;
};
const reveal = (els, trigger, vars = {}) => gsap.fromTo(els, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08, ease: 'expo.out', ...vars, scrollTrigger: { trigger, start: 'top 80%', once: true } });

/* ================= weekly menu ================= */
export function initMenu() {
  const root = $('.menu');
  $$('.flavor', root).forEach((card, i) => {
    const k = card.dataset.flavor;
    const el = put($('.flavor-cookie', card), 420, { ...FLAVORS[k], seed: 100 + i });
    // cookies spin gently with the scroll
    gsap.fromTo(el, { rotate: -40 - i * 10 }, { rotate: 40 + i * 10, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });
  reveal($$('.menu-head > *', root), root);
  reveal($$('.flavor', root), $('.menu-grid', root), { stagger: 0.1 });
  $$('.scribble').forEach((s) => gsap.fromTo(s, { '--draw': 0 }, { '--draw': 1, duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: s, start: 'top 85%', once: true } }));

  // tilt cards toward the mouse
  if (finePointer()) $$('.flavor', root).forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to($('.flavor-cookie', card), { x: x * 30, y: y * 30, duration: 0.6, ease: 'power3.out' });
    });
    card.addEventListener('mouseleave', () => gsap.to($('.flavor-cookie', card), { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }));
  });
}

/* ================= 3D pink box opens ================= */
export function initBox() {
  const root = $('.boxreveal');
  const host = $('.b3-cookies', root);
  const cks = ['chocolateChip', 'pinkSugar', 'smores', 'strawberry'].map((k, i) => put(host, 300, { ...FLAVORS[k], seed: 140 + i, shadow: false }));
  const box = $('.box3d', root), lid = $('.b3-lid', root), title = $('.boxreveal-title', root);
  gsap.set(cks, { z: -40, autoAlpha: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(title, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.15, ease: 'power2.out' }, 0)
    .fromTo(box, { rotateX: 70, rotateZ: -40, y: '30vh', scale: 0.7 }, { rotateX: 52, rotateZ: -14, y: '8vh', scale: 1, duration: 0.35, ease: 'power2.out' }, 0)
    .fromTo(lid, { rotateX: 0 }, { rotateX: -118, duration: 0.3, ease: 'power2.inOut' }, 0.35)
    .to(cks, { z: 0, autoAlpha: 1, duration: 0.2, stagger: 0.04, ease: 'back.out(2)' }, 0.5)
    .to(box, { rotateX: 30, rotateZ: 0, duration: 0.3, ease: 'power1.inOut' }, 0.62)
    .to(cks, { z: 40, duration: 0.2, stagger: 0.03 }, 0.8)
    .set({}, {}, 1);
  scrubbed(root, tl, { scrub: 0.8 });
}

/* ================= today: counters + marquee ================= */
export function initToday() {
  const root = $('.today');
  const track = $('.reviews-track', root);
  track.innerHTML += track.innerHTML; // seamless loop
  $$('.stat b', root).forEach((b) => {
    const to = +b.dataset.to, suf = b.dataset.suffix || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => (b.textContent = Math.round(o.v).toLocaleString('en-US') + suf) }) });
  });
  reveal($$('.stat', root), $('.stats', root), { stagger: 0.12 });
}

/* ================= find: cookies rain with parallax ================= */
export function initFind() {
  const root = $('.find');
  const host = $('.find-cookies', root);
  const r = rng(77);
  const keys = Object.keys(FLAVORS).filter((k) => k !== 'raw');
  const n = isMobile() ? 6 : 10;
  for (let i = 0; i < n; i++) {
    const size = 120 + r() * 200;
    const el = put(host, 360, { ...FLAVORS[keys[i % keys.length]], seed: 200 + i });
    Object.assign(el.style, { width: `${size}px`, height: `${size}px`, left: `${40 + r() * 60}%`, top: `${r() * 90}%` });
    const depth = 0.3 + r();
    gsap.fromTo(el, { y: 200 * depth, rotate: -90 * depth }, { y: -300 * depth, rotate: 120 * depth, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  reveal($$('.find-inner > *', root), root);
}

/* ================= footer: "crumbl" made of crumbs ================= */
export function initFooter() {
  const root = $('.footer');
  if (!finePointer() || isMobile()) return;
  const canvas = $('.footer-crumbs', root), logo = $('.footer-logo', root);
  const ctx = canvas.getContext('2d');
  root.classList.add('has-fx');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let P = [], W = 0, H = 0;
  const mouse = { x: -1e4, y: -1e4, t: 0 };
  const build = () => {
    const rc = canvas.getBoundingClientRect(), rl = logo.getBoundingClientRect();
    W = canvas.width = Math.round(rc.width * dpr); H = canvas.height = Math.round(rc.height * dpr);
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d'), cs = getComputedStyle(logo);
    o.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * dpr}px ${cs.fontFamily}`;
    o.textAlign = 'center'; o.textBaseline = 'alphabetic'; o.fillStyle = '#000';
    o.fillText(logo.textContent, (rl.left + rl.width / 2 - rc.left) * dpr, (rl.top - rc.top + rl.height * 0.8) * dpr);
    const data = o.getImageData(0, 0, W, H).data, step = Math.round(7 * dpr), r = rng(5);
    const cols = ['#d49a5c', '#c88a4e', '#e2b27a', '#a86a35', '#ffb9cd', '#3b1f12'];
    P = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 128) P.push({ ox: x, oy: y, x, y, vx: 0, vy: 0, s: (2.2 + r() * 2.8) * dpr, c: cols[Math.floor(r() * cols.length)], a: r() * 6, f: 0.82 + r() * 0.1 });
    }
  };
  const R = 130 * dpr;
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    const active = performance.now() - mouse.t < 120;
    for (const p of P) {
      if (active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = ((R - d) / R) * 3.2; p.vx += (dx / d) * f; p.vy += (dy / d) * f - 0.6; }
      }
      p.vx = (p.vx + (p.ox - p.x) * 0.05) * p.f;
      p.vy = (p.vy + (p.oy - p.y) * 0.05) * p.f;
      p.x += p.vx; p.y += p.vy;
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
    }
  };
  addEventListener('mousemove', (e) => { const rc = canvas.getBoundingClientRect(); mouse.x = (e.clientX - rc.left) * dpr; mouse.y = (e.clientY - rc.top) * dpr; mouse.t = performance.now(); }, { passive: true });
  document.fonts.ready.then(build);
  addEventListener('resize', () => setTimeout(build, 200));
  new IntersectionObserver(([e]) => (e.isIntersecting ? gsap.ticker.add(tick) : gsap.ticker.remove(tick))).observe(canvas);
}
