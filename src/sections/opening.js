import { gsap, $, $$, scrubbed, isMobile } from '../core.js';
import { cookieURL, FLAVORS } from '../art/cookie.js';
import { car, store } from '../art/illustrations.js';

/* ================= HERO: 3D cookie that breaks apart ================= */
export async function initHero() {
  const root = $('.hero');
  const canvas = $('.hero-3d', root);
  let cookie = null;
  try {
    const { HeroCookie } = await import('../webgl/HeroCookie.js');
    cookie = new HeroCookie(canvas);
    cookie.init();
  } catch (e) {
    console.warn('3D cookie unavailable', e);
    document.documentElement.classList.add('no-webgl');
    $('.hero-fallback', root).src = cookieURL(700, { ...FLAVORS.chocolateChip, seed: 11 });
  }

  // split the title words for the entrance
  $$('.hero-title .line', root).forEach((l) => { l.innerHTML = `<span>${l.innerHTML}</span>`; });
  gsap.set($$('.hero-title .line > span', root), { yPercent: 110 });
  gsap.set([$('.hero-sub', root), $('.hero .eyebrow'), $('.hero-scroll', root)], { autoAlpha: 0, y: 20 });
  if (cookie) Object.assign(cookie.state, { zoom: 0.2, spin: -3 });

  const S = cookie?.state || {};
  addEventListener('mousemove', (e) => { S.mx = e.clientX / innerWidth - 0.5; S.my = e.clientY / innerHeight - 0.5; }, { passive: true });

  const play = () => {
    const tl = gsap.timeline();
    if (cookie) tl.to(S, { zoom: isMobile() ? 0.9 : 1, spin: 0, duration: 1.8, ease: 'expo.out' }, 0);
    tl.to($$('.hero-title .line > span', root), { yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, 0.2)
      .to([$('.hero .eyebrow'), $('.hero-sub', root), $('.hero-scroll', root)], { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.5);
  };

  // scroll: cookie turns to face us, then breaks into pieces and crumbs
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to($('.hero-copy', root), { y: -120, autoAlpha: 0, duration: 0.35 }, 0.05)
    .to($('.hero-scroll', root), { autoAlpha: 0, duration: 0.1 }, 0);
  if (cookie) {
    tl.fromTo(S, { tilt: 0.95, spin: 0, y: 0 }, { tilt: 0.25, spin: Math.PI * 0.6, y: 0.1, duration: 0.45, ease: 'power1.inOut', immediateRender: false }, 0)
      .fromTo(S, { break: 0 }, { break: 1, duration: 0.45, ease: 'power2.in', immediateRender: false }, 0.45)
      .fromTo(S, { zoom: isMobile() ? 0.9 : 1 }, { zoom: 1.1, duration: 0.45, immediateRender: false }, 0.45)
      .fromTo(S, { fade: 1 }, { fade: 0, duration: 0.1, immediateRender: false }, 0.84);
  }
  scrubbed(root, tl);
  return play;
}

/* ================= STORY: the pink convertible drives through the years ================= */
export function initStory() {
  const root = $('.story');
  $('.story-car', root).innerHTML = car();
  $('[data-art="store"]', root).innerHTML = store();
  const track = $('.story-track', root), carEl = $('.story-car', root), dash = $('.road-dash', root);
  const wheels = $$('.car-wheel', root);
  const cards = $$('.milestone', root);

  // car idles (engine shake) all the time
  gsap.to($('.ill-car', root), { y: -3, duration: 0.18, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.set(wheels, { transformOrigin: '50% 50%' });
  gsap.to($('.car-cookie', root), { rotate: 8, transformOrigin: '50% 100%', duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  const head = $('.story-head', root);
  gsap.fromTo(head, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root, start: 'top 70%', toggleActions: 'play none none reverse' } });
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(track, { x: () => -innerWidth * 0.45 }, { x: () => -(track.scrollWidth - innerWidth * 0.55), duration: 1 }, 0.02)
    .fromTo(dash, { x: 0 }, { x: () => -innerWidth * 2.4, duration: 1 }, 0.04)
    .fromTo(wheels, { rotate: 0 }, { rotate: 360 * 14, duration: 1 }, 0.04)
    .fromTo(carEl, { x: () => -innerWidth * 0.3 }, { x: 0, duration: 0.08, ease: 'power2.out' }, 0)
    .to(carEl, { x: innerWidth * 0.08, duration: 0.8 }, 0.18)
    .to(carEl, { x: innerWidth * 1.1, duration: 0.14, ease: 'power2.in' }, 0.92)
    .to(head, { autoAlpha: 0, y: -30, duration: 0.05 }, 0.95)
    .set({}, {}, 1.06);

  // cards flip up as they reach the car
  const cardTick = () => {
    const vw = innerWidth;
    cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      const k = gsap.utils.clamp(0, 1, (vw * 0.95 - r.left) / (vw * 0.3));
      c.style.setProperty('opacity', (0.15 + 0.85 * k).toFixed(3));
      c.style.translate = `0 ${((1 - k) * 60).toFixed(1)}px`;
    });
  };
  tl.eventCallback('onUpdate', cardTick);
  scrubbed(root, tl, { scrub: 0.6 });
  cardTick();
}
