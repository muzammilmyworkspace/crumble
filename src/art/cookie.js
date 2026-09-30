/* ==========================================================
   Procedural cookie painter (canvas 2D).
   Every cookie on the site — hero texture, menu, oven, box —
   is painted here, so they all share one look.
   ========================================================== */

export const rng = (seed = 1) => {
  let s = (seed * 9301 + 49297) % 233280 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

/* tiny value-noise for irregular edges and surface */
function noise1(r) {
  const n = 12, v = Array.from({ length: n }, () => r() * 2 - 1);
  return (t) => {
    const x = (((t % 1) + 1) % 1) * n, i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return v[i % n] * (1 - u) + v[(i + 1) % n] * u;
  };
}

const mix = (a, b, t) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return '#' + ((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0');
};

export const FLAVORS = {
  chocolateChip: { dough: '#d49a5c', edge: '#9a5a2a', chunks: '#3b1f12', chunkCount: 17, name: 'Milk Chocolate Chip' },
  pinkSugar: { dough: '#f2d3a0', edge: '#d9ac6c', chunks: null, frosting: '#ffb3c8', frostTop: '#ffd6e2', name: 'Pink Sugar' },
  smores: { dough: '#5a3322', edge: '#3a1e12', chunks: '#24120a', chunkCount: 10, frosting: '#fbf3e6', frostTop: '#ffffff', crumbs: '#c98b4f', drizzle: '#2a140b', name: "Midnight S'mores" },
  snickerdoodle: { dough: '#e8c38c', edge: '#c08a4a', chunks: null, frosting: '#fff6ea', frostTop: '#ffffff', dust: '#b56a2e', name: 'Snickerdoodle Cupcake' },
  blueberry: { dough: '#e6c796', edge: '#c49660', chunks: '#4b4a9c', chunkCount: 12, glaze: '#fff4dc', crumbs: '#d8a866', name: 'Blueberry Muffin' },
  strawberry: { dough: '#f4e2c4', edge: '#d9b784', chunks: null, frosting: '#ffffff', frostTop: '#fff8f8', berries: '#e0314b', name: "Strawberries 'n' Cream" },
  peanutButter: { dough: '#d9a35e', edge: '#a8692c', chunks: '#e9b44c', chunkCount: 16, frosting: '#e8b77a', frostTop: '#f3cf9c', name: 'PB Milkshake' },
  raw: { dough: '#e9c89a', edge: '#e0b983', chunks: '#3b1f12', chunkCount: 12, raw: true, name: 'Dough' },
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} S   canvas size (square)
 * @param {object} o   flavor + { seed, bake (0 raw → 1 baked), outline, shadow, bite }
 */
export function paintCookie(ctx, S, o = {}) {
  const f = { ...FLAVORS.chocolateChip, ...o };
  const r = rng(f.seed || 7);
  const bake = f.bake ?? 1;
  const cx = S / 2, cy = S / 2;
  const R = S * 0.42 * (0.72 + 0.28 * bake); // dough spreads as it bakes
  const edgeN = noise1(r), edgeN2 = noise1(r);
  const rad = (a) => R * (1 + 0.035 * edgeN(a / (Math.PI * 2)) + 0.018 * edgeN2((a / (Math.PI * 2)) * 3));

  const outline = () => {
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2, rr = rad(a);
      i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  };

  ctx.save();
  // soft contact shadow
  if (f.shadow !== false) {
    ctx.save();
    ctx.translate(S * 0.02, S * 0.035);
    outline();
    ctx.fillStyle = 'rgba(60,20,10,.28)';
    ctx.filter = `blur(${S * 0.022}px)`;
    ctx.fill();
    ctx.restore();
  }

  // bite taken out of the cookie
  if (f.bite) {
    ctx.save();
    outline(); ctx.clip();
  }

  // body
  outline();
  const doughCol = f.raw ? f.dough : mix(FLAVORS.raw.dough, f.dough, Math.min(1, bake * 1.1));
  const edgeCol = f.raw ? f.edge : mix(FLAVORS.raw.edge, f.edge, bake);
  const g = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R * 1.02);
  g.addColorStop(0, mix(doughCol, '#fff8e8', 0.18));
  g.addColorStop(0.55 - 0.2 * (1 - bake), doughCol);
  g.addColorStop(0.88, edgeCol);
  g.addColorStop(1, mix(f.edge, '#2a1206', 0.35 * bake));
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  outline(); ctx.clip();

  // surface texture: soft bumps (lit top-left) and shallow dimples
  ctx.filter = `blur(${S * 0.006}px)`;
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.95;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, s = S * (0.015 + r() * 0.035);
    const cg = ctx.createRadialGradient(x - s * 0.35, y - s * 0.35, 0, x, y, s);
    cg.addColorStop(0, `rgba(255,236,200,${0.22 + 0.15 * (1 - bake)})`);
    cg.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    const dg = ctx.createRadialGradient(x + s * 0.45, y + s * 0.45, 0, x + s * 0.45, y + s * 0.45, s * 0.7);
    dg.addColorStop(0, `rgba(95,45,12,${0.16 * bake})`);
    dg.addColorStop(1, 'rgba(95,45,12,0)');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.arc(x + s * 0.45, y + s * 0.45, s * 0.7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.filter = 'none';
  for (let i = 0; i < 700; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R;
    ctx.fillStyle = r() > 0.5 ? `rgba(255,245,220,${0.25 * r()})` : `rgba(80,35,10,${0.25 * r() * bake})`;
    ctx.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, S * 0.004, S * 0.004);
  }

  // baked cracks
  if (bake > 0.35 && !f.raw) {
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      let a = r() * Math.PI * 2, d = R * (0.25 + r() * 0.5);
      let x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      ctx.beginPath(); ctx.moveTo(x, y);
      const len = 4 + Math.floor(r() * 4);
      for (let k = 0; k < len; k++) { a += (r() - 0.5) * 1.1; x += Math.cos(a) * S * 0.03; y += Math.sin(a) * S * 0.03; ctx.lineTo(x, y); }
      ctx.strokeStyle = `rgba(70,30,8,${0.45 * (bake - 0.35)})`; ctx.lineWidth = S * 0.007; ctx.stroke();
      ctx.strokeStyle = `rgba(255,235,200,${0.35 * (bake - 0.35)})`; ctx.lineWidth = S * 0.003; ctx.translate(-S * 0.004, -S * 0.004); ctx.stroke(); ctx.translate(S * 0.004, S * 0.004);
    }
  }

  // chocolate / berry chunks
  if (f.chunks) {
    for (let i = 0; i < f.chunkCount; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.82;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, s = S * (0.034 + r() * 0.042);
      const melt = 0.35 + 0.65 * bake;
      const k = 6 + Math.floor(r() * 3);
      const pts = [];
      for (let j = 0; j < k; j++) {
        const aa = (j / k) * Math.PI * 2 + r() * 0.5, rr = s * (0.62 + r() * 0.5);
        pts.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr * (0.78 + 0.22 * melt)]);
      }
      const blob = () => {
        ctx.beginPath();
        for (let j = 0; j < k; j++) {
          const p0 = pts[j], p1 = pts[(j + 1) % k], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
          j ? ctx.quadraticCurveTo(p0[0], p0[1], mx, my) : ctx.moveTo(mx, my);
        }
        const p0 = pts[0], p1 = pts[1];
        ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
        ctx.closePath();
      };
      // soft melt halo into the dough
      ctx.save(); ctx.filter = `blur(${S * 0.006 * melt}px)`; ctx.translate(S * 0.004, S * 0.007);
      blob(); ctx.fillStyle = `rgba(40,15,5,${0.35 * melt})`; ctx.fill(); ctx.restore();
      blob();
      const cg = ctx.createLinearGradient(x - s, y - s, x + s, y + s);
      cg.addColorStop(0, mix(f.chunks, '#ffffff', 0.2));
      cg.addColorStop(0.45, f.chunks);
      cg.addColorStop(1, mix(f.chunks, '#000000', 0.4));
      ctx.fillStyle = cg; ctx.fill();
      ctx.save(); ctx.filter = `blur(${S * 0.002}px)`;
      ctx.fillStyle = `rgba(255,255,255,${0.28 + 0.25 * melt})`;
      ctx.beginPath(); ctx.ellipse(x - s * 0.22, y - s * 0.28, s * 0.26, s * 0.1, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();

  // toppings
  if (f.glaze) {
    ctx.save(); outline(); ctx.clip();
    ctx.strokeStyle = f.glaze; ctx.lineCap = 'round'; ctx.globalAlpha = 0.85;
    for (let i = 0; i < 9; i++) {
      ctx.lineWidth = S * (0.01 + r() * 0.012);
      const y0 = cy - R + (i / 9) * 2 * R + r() * 10;
      ctx.beginPath(); ctx.moveTo(cx - R, y0);
      ctx.bezierCurveTo(cx - R * 0.4, y0 - R * 0.18, cx + R * 0.2, y0 + R * 0.2, cx + R, y0 + (r() - 0.5) * R * 0.2);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (f.frosting) {
    // swoop of frosting, slightly off-centre, with gloss
    const fr = R * 0.78;
    const fN = noise1(r);
    const swoop = (ox = 0, oy = 0, k = 1) => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2, rr = fr * k * (1 + 0.035 * Math.sin(a * 4 + 1.3) + 0.025 * fN(a / 6.28));
        const px = cx + ox + Math.cos(a) * rr, py = cy + oy + Math.sin(a) * rr * 0.97;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
    };
    ctx.save(); ctx.filter = `blur(${S * 0.01}px)`; swoop(S * 0.006, S * 0.014); ctx.fillStyle = 'rgba(70,25,20,.35)'; ctx.fill(); ctx.restore();
    swoop();
    const fg = ctx.createRadialGradient(cx - fr * 0.3, cy - fr * 0.35, fr * 0.05, cx, cy, fr);
    fg.addColorStop(0, f.frostTop || '#fff'); fg.addColorStop(0.7, f.frosting); fg.addColorStop(1, mix(f.frosting, '#6b2a3a', 0.18));
    ctx.fillStyle = fg; ctx.fill();
    // swirl ridges from the spatula
    ctx.save(); swoop(); ctx.clip();
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.22 - k * 0.04})`; ctx.lineWidth = S * 0.01;
      ctx.beginPath(); ctx.arc(cx + fr * 0.08, cy + fr * 0.04, fr * (0.25 + k * 0.17), Math.PI * (0.9 + k * 0.1), Math.PI * (1.9 + k * 0.1)); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,30,40,.08)';
      ctx.beginPath(); ctx.arc(cx + fr * 0.08, cy + fr * 0.08, fr * (0.3 + k * 0.17), Math.PI * (0.9 + k * 0.1), Math.PI * (1.9 + k * 0.1)); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = S * 0.012; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, fr * 0.55, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,40,60,.12)'; ctx.lineWidth = S * 0.008;
    ctx.beginPath(); ctx.arc(cx + fr * 0.05, cy + fr * 0.05, fr * 0.72, Math.PI * 0.1, Math.PI * 0.8); ctx.stroke();
    if (f.dust) for (let i = 0; i < 400; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * fr; ctx.fillStyle = `rgba(150,80,30,${0.5 * r()})`; ctx.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, S * 0.005, S * 0.005); }
  }
  if (f.crumbs) for (let i = 0; i < 40; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * R * 0.75, s = S * (0.008 + r() * 0.018);
    ctx.fillStyle = mix(f.crumbs, '#000000', r() * 0.3); ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, s * 0.7, r() * 3, 0, 6.28); ctx.fill();
  }
  if (f.drizzle) {
    ctx.strokeStyle = f.drizzle; ctx.lineWidth = S * 0.01; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const y0 = cy - R * 0.55 + i * R * 0.27;
      ctx.beginPath(); ctx.moveTo(cx - R * 0.75, y0);
      ctx.bezierCurveTo(cx - R * 0.3, y0 - R * 0.22, cx + R * 0.05, y0 + R * 0.25, cx + R * 0.75, y0 - R * 0.05 + (r() - 0.5) * R * 0.1);
      ctx.stroke();
    }
  }
  if (f.berries) for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 6.28 + 0.4, d = R * 0.42, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, s = S * 0.07;
    const bg = ctx.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s);
    bg.addColorStop(0, '#ff8a9a'); bg.addColorStop(0.6, f.berries); bg.addColorStop(1, '#8a1426');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.8, a, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#fff6c8'; for (let k = 0; k < 6; k++) ctx.fillRect(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.8, S * 0.004, S * 0.006);
  }

  if (f.bite) {
    ctx.restore();
    // cut bite(s) with destination-out
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const bites = Array.isArray(f.bite) ? f.bite : [f.bite];
    bites.forEach((b) => {
      const a = b.angle ?? -0.6, bx = cx + Math.cos(a) * R * 1.02, by = cy + Math.sin(a) * R * 1.02, br = R * (b.size ?? 0.34);
      ctx.beginPath();
      for (let i = 0; i < 7; i++) { const aa = a + Math.PI + (i - 3) * 0.32; ctx.moveTo(bx, by); ctx.arc(bx + Math.cos(aa) * br * 0.45, by + Math.sin(aa) * br * 0.45, br * 0.62, 0, 6.28); }
      ctx.fill();
    });
    ctx.restore();
  }

  if (f.outline) {
    outline();
    ctx.lineWidth = f.outline; ctx.strokeStyle = '#111'; ctx.stroke();
  }
  ctx.restore();
}

/** returns a canvas with one painted cookie (cached per key) */
const cache = new Map();
export function cookieCanvas(size, opts = {}) {
  const key = JSON.stringify([size, opts]);
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  paintCookie(c.getContext('2d'), size, opts);
  cache.set(key, c);
  return c;
}

export const cookieURL = (size, opts) => cookieCanvas(size, opts).toDataURL('image/webp', 0.9);
