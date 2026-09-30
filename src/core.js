import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const $ = (s, p = document) => p.querySelector(s);
export const $$ = (s, p = document) => [...p.querySelectorAll(s)];
export const isMobile = () => window.innerWidth <= 767;
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export let lenis = null;
export const scroll = { y: 0, v: 0 };

export function initSmooth() {
  lenis = new Lenis({ lerp: isMobile() ? 1 : 0.09, smoothWheel: true });
  lenis.on('scroll', (e) => { scroll.y = e.scroll; scroll.v = e.velocity; ScrollTrigger.update(); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { duration: 1.6 }); }
  }));
  return lenis;
}

/** scroll-scrubbed timeline over a tall section (its sticky child does the pinning) */
export function scrubbed(trigger, tl, { scrub = 0.7 } = {}) {
  return ScrollTrigger.create({ trigger, start: 'top top', end: 'bottom bottom', scrub, animation: tl, invalidateOnRefresh: true });
}

export { gsap, ScrollTrigger };
