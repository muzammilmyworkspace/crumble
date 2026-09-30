import { gsap, $, $$, scrubbed } from '../core.js';
import * as ART from '../art/illustrations.js';
import { cookieCanvas, FLAVORS, rng } from '../art/cookie.js';

/**
 * Pinned kitchen, six stations side by side (each 100vw). Timeline = 60 units:
 * station i plays in [10i, 10i + 8], the camera pans to the next in [10i + 8, 10i + 10].
 */
export function initKitchen() {
  const root = $('.kitchen');
  const pin = $('.kitchen-pin', root);
  const world = $('.kitchen-world', root);

  // paint every illustration slot
  $$('[data-art]', root).forEach((el) => {
    const fn = ART[el.dataset.art];
    if (fn) el.insertAdjacentHTML('afterbegin', fn());
  });
  const chef = $('.chef', root);
  pin.appendChild(chef); // chef stays with the camera
  const armL = $('.arm-l', chef), armR = $('.arm-r', chef), head = $('.chef-head', chef), body = $('.ill-chef', chef);
  gsap.set(armL, { transformOrigin: '75% 0%' });
  gsap.set(armR, { transformOrigin: '25% 0%' });
  gsap.set(head, { transformOrigin: '50% 100%' });

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  const vw = () => innerWidth;
  const rect = (el) => { // position of el inside its station (px), unaffected by transforms
    let x = 0, y = 0, n = el;
    while (n && !n.classList.contains('station')) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };

  /* -------- camera pans between stations + chef walks -------- */
  for (let i = 0; i < 5; i++) {
    const at = 10 * i + 8;
    tl.fromTo(world, { x: () => -i * vw() }, { x: () => -(i + 1) * vw(), duration: 2, ease: 'power2.inOut', immediateRender: false }, at)
      .fromTo(body, { y: 0 }, { keyframes: { y: [0, -14, 0, -14, 0, -14, 0] }, duration: 2, immediateRender: false }, at)
      .fromTo([armL, armR], { rotate: 0 }, { keyframes: { rotate: [0, 14, -14, 14, -14, 0] }, duration: 2, immediateRender: false }, at);
  }

  /* -------- 01 gather: everything tumbles into the bowl -------- */
  const g = $('.st-gather', root), pour = $('.pour', g);
  const bowl = $('.p-bowl', g), flour = $('.p-flour', g), chipsBag = $('.p-chipbag', g), butter = $('.p-butter', g), egg = $('.p-egg', g), sugar = $('.p-sugar', g);
  const target = () => { const b = rect(bowl); return { x: b.x + b.w * 0.5, y: b.y + b.h * 0.22 }; };
  const r = rng(12);
  const spawn = (n, make) => Array.from({ length: n }, (_, i) => { const el = document.createElement('i'); make(el, i); pour.appendChild(el); return el; });
  const flourDots = spawn(36, (el) => { const s = 6 + r() * 10; Object.assign(el.style, { width: `${s}px`, height: `${s}px`, background: '#fffaf0', boxShadow: '0 0 0 1.5px rgba(20,20,20,.15)' }); });
  const chips = spawn(18, (el) => { el.innerHTML = ART.chip(); Object.assign(el.style, { width: '16px', height: '16px', borderRadius: '0' }); });
  const sugarDots = spawn(20, (el) => { const s = 4 + r() * 4; Object.assign(el.style, { width: `${s}px`, height: `${s}px`, background: '#fff', borderRadius: '2px', boxShadow: '0 0 0 1px rgba(20,20,20,.2)' }); });
  gsap.set([...flourDots, ...chips, ...sugarDots], { autoAlpha: 0 });

  /** parabolic flight driven by a proxy (works both ways while scrubbing) */
  const flight = (el, from, to, t, dur, { lift = 80, spin = 360, own = false, hide = true } = {}) => {
    const p = { v: 0 };
    tl.set(el, { autoAlpha: 1 }, t)
      .fromTo(p, { v: 0 }, { v: 1, duration: dur, immediateRender: false, onUpdate: () => {
        const f = from(), e = to(), k = p.v;
        let x = f.x + (e.x - f.x) * k, y = f.y + (e.y - f.y) * k - Math.sin(Math.PI * k) * lift;
        if (own) { const o = rect(el); x -= o.x; y -= o.y; }
        gsap.set(el, { x, y, rotate: spin * k });
      } }, t);
    if (hide) tl.set(el, { autoAlpha: 0 }, t + dur);
  };
  const arc = (els, from, t0, span) => els.forEach((el, i) => {
    const jit = (r() - 0.5) * 60, jy = (r() - 0.5) * 12, sp = 360 * (r() > 0.5 ? 1 : -1);
    flight(el, from, () => { const tg = target(); return { x: tg.x + jit, y: tg.y + jy }; }, t0 + (i / els.length) * span, 1.1, { lift: 70, spin: sp });
  });
  const top = (el, dx = 0.5) => () => { const b = rect(el); return { x: b.x + b.w * dx, y: b.y + b.h * 0.1 }; };

  tl.fromTo(flour, { rotate: 0 }, { rotate: 58, transformOrigin: '90% 100%', duration: 0.8, ease: 'power2.out', immediateRender: false }, 0.6)
    .to(flour, { rotate: 0, duration: 0.6, ease: 'power2.in' }, 2.6);
  arc(flourDots, top(flour, 0.9), 1.0, 1.8);
  // puff of flour when it lands
  const puff = document.createElement('i');
  Object.assign(puff.style, { width: '140px', height: '80px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,250,240,.95), rgba(255,250,240,0))' });
  pour.appendChild(puff);
  tl.fromTo(puff, { x: () => target().x - 70, y: () => target().y - 40, scale: 0.2, autoAlpha: 0 }, { scale: 1.6, autoAlpha: 1, duration: 0.8, ease: 'power2.out', immediateRender: false }, 2.0)
    .to(puff, { autoAlpha: 0, y: '-=40', duration: 1 }, 2.8);
  const at = (el) => () => { const o = rect(el); return { x: o.x, y: o.y }; };
  const into = (el, dy = 20) => () => { const tg = target(), o = rect(el); return { x: tg.x - o.w * 0.5, y: tg.y - dy }; };
  flight(butter, at(butter), into(butter), 2.4, 1.2, { lift: 140, spin: -90, own: true, hide: false });
  tl.to(butter, { autoAlpha: 0, scale: 0.6, duration: 0.25 }, 3.5);
  flight(egg, at(egg), into(egg, 30), 3.2, 1.1, { lift: 170, spin: -300, own: true, hide: false });
  tl.to(egg, { autoAlpha: 0, scale: 1.4, duration: 0.2 }, 4.25)
    .fromTo(sugar, { rotate: 0 }, { rotate: -62, transformOrigin: '10% 100%', duration: 0.7, ease: 'power2.out', immediateRender: false }, 3.8)
    .to(sugar, { rotate: 0, duration: 0.5 }, 5.4);
  arc(sugarDots, top(sugar, 0.1), 4.2, 1.2);
  tl.fromTo(chipsBag, { rotate: 0 }, { rotate: -70, transformOrigin: '10% 100%', duration: 0.7, ease: 'power2.out', immediateRender: false }, 5.2)
    .to(chipsBag, { rotate: 0, duration: 0.5 }, 7.2);
  arc(chips, top(chipsBag, 0.1), 5.6, 1.6);
  tl.fromTo($('.bowl-fill', g), { opacity: 0, scaleY: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scaleY: 1, duration: 5, immediateRender: false }, 1.8)
    .fromTo(bowl, { rotate: 0 }, { keyframes: { rotate: [0, -3, 3, -2, 2, 0] }, duration: 6, immediateRender: false }, 1.4)
    .fromTo(armL, { rotate: 0 }, { keyframes: { rotate: [0, 30, 0, 30, 0] }, duration: 6, immediateRender: false }, 1)
    .fromTo(head, { rotate: 0 }, { keyframes: { rotate: [0, 8, 8, 0] }, duration: 7, immediateRender: false }, 0.5);

  /* -------- 02 mix: beater spins with the scroll -------- */
  const m = $('.st-mix', root), beater = $('.mixer-beater', m), mixHead = $('.mixer-head', m), dough = $('.mixer-dough', m);
  gsap.set(mixHead, { transformOrigin: '82% 42%' });
  gsap.set($('.oven-dial', root), { transformOrigin: '50% 50%' });
  gsap.set(beater, { transformOrigin: '50% 50%' });
  const spin = { a: 0 };
  tl.fromTo(mixHead, { rotate: -22 }, { rotate: 0, duration: 1, ease: 'back.out(2)', immediateRender: false }, 10.3)
    .fromTo(spin, { a: 0 }, { a: Math.PI * 60, duration: 5.6, ease: 'power1.inOut', immediateRender: false,
      onUpdate: () => { gsap.set(beater, { scaleX: Math.cos(spin.a) }); } }, 11.2)
    .fromTo(dough, { attr: { ry: 9, rx: 54 }, fill: '#f6e6c8' }, { attr: { ry: 16, rx: 58 }, fill: '#d9a86a', duration: 5.6, immediateRender: false }, 11.2)
    .to(mixHead, { rotate: -22, duration: 0.8, ease: 'power2.inOut' }, 17)
    .fromTo(armR, { rotate: 0 }, { keyframes: { rotate: [0, -35, -35, 0] }, duration: 6.5, immediateRender: false }, 10.5);

  /* -------- 03 scoop: dough balls pop onto the tray -------- */
  const sc = $('.st-scoop', root), balls = $('.balls', sc);
  const ballEls = Array.from({ length: 5 }, (_, i) => {
    const c = cookieCanvas(240, { ...FLAVORS.raw, bake: 0, seed: 30 + i });
    const el = c.cloneNode(); el.getContext('2d').drawImage(c, 0, 0);
    el.style.left = `${4 + i * 19.5}%`;
    balls.appendChild(el);
    return el;
  });
  ballEls.forEach((el, i) => {
    const t = 20.6 + i * 1.3;
    tl.fromTo(el, { y: -160, scale: 0.2, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(2.2)', immediateRender: false }, t)
      .fromTo(armR, { rotate: 0 }, { keyframes: { rotate: [0, -48, 0] }, duration: 0.8, immediateRender: false }, t - 0.3);
  });

  /* -------- 04 bake: raw → golden through the oven window -------- */
  const bk = $('.st-bake', root), win = $('.oven-cookies', bk), glow = $('.oven-glow', bk), dial = $('.oven-dial', bk), timer = $('[data-timer]', bk), heat = $('.heat', bk);
  const baked = [];
  for (let i = 0; i < 3; i++) {
    const ck = document.createElement('div'); ck.className = 'ck';
    const raw = cookieCanvas(300, { ...FLAVORS.chocolateChip, bake: 0, seed: 50 + i, shadow: false });
    const done = cookieCanvas(300, { ...FLAVORS.chocolateChip, bake: 1, seed: 50 + i, shadow: false });
    const a = raw.cloneNode(); a.getContext('2d').drawImage(raw, 0, 0);
    const b = done.cloneNode(); b.getContext('2d').drawImage(done, 0, 0);
    ck.append(a, b); win.appendChild(ck); baked.push({ raw: a, done: b, ck });
  }
  for (let i = 0; i < 7; i++) { const w = document.createElement('i'); w.style.left = `${10 + i * 13}%`; heat.appendChild(w); }
  const clock = { t: 0 };
  tl.fromTo(dial, { rotate: 0 }, { rotate: 230, duration: 0.8, ease: 'back.out(2)', immediateRender: false }, 30.4)
    .fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 1.2, immediateRender: false }, 30.8)
    .fromTo(baked.map((b) => b.done), { opacity: 0 }, { opacity: 1, duration: 5, stagger: 0.2, immediateRender: false }, 31.2)
    .fromTo(baked.map((b) => b.ck), { scale: 0.78 }, { scale: 1, duration: 5, ease: 'power1.out', immediateRender: false }, 31.2)
    .fromTo(clock, { t: 0 }, { t: 660, duration: 5.4, immediateRender: false, onUpdate: () => {
      const s = Math.round(clock.t); timer.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    } }, 31)
    .fromTo($$('i', heat), { opacity: 0, scaleY: 0.4 }, { opacity: 0.9, scaleY: 1, duration: 1, stagger: 0.1, immediateRender: false }, 31.4)
    .to($$('i', heat), { opacity: 0, duration: 0.6 }, 37)
    .to(glow, { opacity: 0.25, duration: 0.8 }, 37)
    .fromTo($('.oven-steam', bk), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, immediateRender: false }, 36.8)
    .fromTo(timer, { scale: 1 }, { keyframes: { scale: [1, 1.25, 1] }, duration: 0.6, immediateRender: false }, 36.6)
    .fromTo(head, { rotate: 0 }, { keyframes: { rotate: [0, -10, -10, 0] }, duration: 6, immediateRender: false }, 30.5);

  /* -------- 05 frost: the pink swoop is piped in a spiral -------- */
  const fr = $('.st-frost', root), base = $('.frost-base', fr), topC = $('.frost-top', fr), bag = $('.p-piping', fr), fc = $('.frost-cookie', fr);
  base.getContext('2d').drawImage(cookieCanvas(600, { ...FLAVORS.pinkSugar, frosting: null, seed: 71 }), 0, 0);
  topC.getContext('2d').drawImage(cookieCanvas(600, { ...FLAVORS.pinkSugar, seed: 71 }), 0, 0);
  const swirl = { a: 0 };
  const setMask = () => {
    const m = `conic-gradient(from -90deg, #000 ${swirl.a.toFixed(1)}deg, transparent ${(swirl.a + 0.5).toFixed(1)}deg)`;
    topC.style.webkitMaskImage = m; topC.style.maskImage = m;
    const c = rect(fc), a = ((swirl.a - 90) * Math.PI) / 180, rr = c.w * (0.32 - (swirl.a / 360) * 0.2);
    const bx = c.x + c.w / 2 + Math.cos(a) * rr - bag.offsetWidth / 2, by = c.y + c.h / 2 + Math.sin(a) * rr - bag.offsetHeight;
    bag.style.transform = `translate(${(bx - bag.offsetLeft).toFixed(1)}px, ${(by - bag.offsetTop).toFixed(1)}px) rotate(${(Math.sin(a) * 12).toFixed(1)}deg)`;
  };
  tl.fromTo(swirl, { a: 0 }, { a: 360, duration: 6.4, ease: 'power1.inOut', immediateRender: false, onUpdate: setMask }, 40.8)
    .fromTo(fc, { rotate: 0 }, { rotate: -30, duration: 7, immediateRender: false }, 40.4)
    .fromTo(armR, { rotate: 0 }, { keyframes: { rotate: [0, -60, -50, -60, 0] }, duration: 7, immediateRender: false }, 40.4);
  setMask();

  /* -------- 06 box: four cookies drop in and the lid shuts -------- */
  const bx = $('.st-box', root), slots = $('.box-cookies', bx), lid = $('.box-lid', bx), boxEl = $('.p-box', bx);
  ['chocolateChip', 'pinkSugar', 'smores', 'strawberry'].forEach((k, i) => {
    const c = cookieCanvas(260, { ...FLAVORS[k], seed: 80 + i });
    const el = c.cloneNode(); el.getContext('2d').drawImage(c, 0, 0);
    slots.appendChild(el);
    tl.fromTo(el, { y: -320, rotate: -60, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 1, ease: 'bounce.out', immediateRender: false }, 50.6 + i * 1);
  });
  tl.fromTo(lid, { rotateX: -110, autoAlpha: 0 }, { rotateX: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.inOut', immediateRender: false }, 55)
    .fromTo(boxEl, { scale: 1 }, { keyframes: { scale: [1, 1.06, 0.98, 1] }, duration: 0.8, immediateRender: false }, 56.4)
    .fromTo(armL, { rotate: 0 }, { rotate: 80, duration: 0.6, ease: 'back.out(2)', immediateRender: false }, 57)
    .fromTo(armR, { rotate: 0 }, { rotate: -80, duration: 0.6, ease: 'back.out(2)', immediateRender: false }, 57)
    .set({}, {}, 60);

  /* -------- HUD -------- */
  const steps = $$('.steps li', root), bar = $('.progress i', root);
  const copies = $$('.st-copy', root);
  gsap.set(copies, { autoAlpha: 0, y: 40 });
  copies.forEach((c, i) => {
    tl.fromTo(c, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false }, 10 * i + (i ? 0.2 : 0))
      .to(c, { autoAlpha: 0, y: -30, duration: 0.6, ease: 'power2.in' }, 10 * i + 8.2);
  });
  tl.eventCallback('onUpdate', () => {
    const t = tl.time(), idx = Math.min(5, Math.floor((t + 1) / 10));
    steps.forEach((s, i) => s.classList.toggle('is-on', i === idx));
    bar.style.transform = `scaleX(${(t / 60).toFixed(4)})`;
  });

  scrubbed(root, tl, { scrub: 0.8 });

  // idle life: breathing chef, steaming oven, flour puff
  gsap.to($('.chef-body', chef), { scaleY: 1.015, transformOrigin: '50% 100%', duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  $$('.ill-steam path', root).forEach((p, i) => gsap.fromTo(p, { y: 10, opacity: 0 }, { y: -30, opacity: 0.9, duration: 1.8, repeat: -1, delay: i * 0.5, ease: 'sine.inOut', yoyo: true }));
  // idle life: blinking chef
  gsap.to($('.chef-eyes', chef), { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.1, repeat: -1, yoyo: true, repeatDelay: 2.6 });
}
