import './styles/main.css';
import { gsap, initSmooth, lenis, ScrollTrigger } from './core.js';
import { initCrumbs, initCursor, createLoader, initHeader } from './fx/ambient.js';
import { initHero, initStory } from './sections/opening.js';
import { initKitchen } from './sections/kitchen.js';
import { initMenu, initBox, initToday, initFind, initFooter } from './sections/finale.js';

history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

async function boot() {
  await document.fonts.ready;
  const loader = createLoader();
  gsap.ticker.lagSmoothing(500, 33);   // keep the loader smooth while heavy work runs
  initSmooth();
  lenis.stop();
  gsap.ticker.lagSmoothing(500, 33);
  initCursor(); initCrumbs(); initHeader();
  await frame(); loader.progress(12);

  const steps = [
    async () => (playHero = await initHero()),
    initStory, initKitchen, initMenu, initBox, initToday, initFind, initFooter,
  ];
  let playHero = () => {};
  for (let i = 0; i < steps.length; i++) {
    await steps[i]();
    loader.progress(12 + ((i + 1) / steps.length) * 78);
    await frame();
  }
  ScrollTrigger.refresh();
  await loader.finish();
  gsap.ticker.lagSmoothing(0);
  lenis.start();
  playHero();
}

boot();
