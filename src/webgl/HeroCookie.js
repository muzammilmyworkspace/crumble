import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { cookieCanvas, FLAVORS, rng } from '../art/cookie.js';

/**
 * A real 3D chocolate-chip cookie made of six wedges (so it can break apart),
 * with 3D chocolate chunks, a crumb cloud and warm studio light.
 * state.break 0 → 1 pulls the wedges apart; state.spin / tilt / zoom are driven by scroll + mouse.
 */
const R = 1.6, H = 0.34, WEDGES = 6;

/* smooth value noise on the plane (same everywhere so wedge seams line up) */
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const bumps = (x, z) => (vnoise(x * 2.2, z * 2.2) - 0.5) * 0.12 + (vnoise(x * 5.5 + 9, z * 5.5) - 0.5) * 0.05;

/** radius profile (r, y) of the cookie cross-section: flat base, rounded rim, domed top */
function profile() {
  const pts = [];
  pts.push(new THREE.Vector2(0.001, -H * 0.5));
  for (let i = 0; i <= 6; i++) pts.push(new THREE.Vector2(R * (i / 6) * 0.94, -H * 0.5));
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI;
    pts.push(new THREE.Vector2(R * 0.94 + Math.cos(a) * H * 0.34, Math.sin(a) * H * 0.5));
  }
  for (let i = 6; i >= 0; i--) pts.push(new THREE.Vector2(R * 0.94 * (i / 6), H * 0.5 + (1 - (i / 6) ** 2) * 0.08));
  return pts;
}

function applySurface(geo) {
  const pos = geo.attributes.position, uv = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const r = Math.hypot(x, z);
    // irregular outline + top bumps
    const ang = Math.atan2(z, x);
    const edge = 1 + (vnoise(Math.cos(ang) * 1.3 + 3, Math.sin(ang) * 1.3) - 0.5) * 0.09;
    const top = y > 0 ? bumps(x, z) * Math.min(1, (R - r) * 2 + 0.3) : 0;
    pos.setXYZ(i, x * edge, y + top, z * edge);
    uv.push((x / R) * 0.5 + 0.5, 0.5 - (z / R) * 0.5);
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}

export class HeroCookie {
  state = { break: 0, spin: 0, tilt: 0.95, zoom: 1, y: 0, mx: 0, my: 0, fade: 1 };

  constructor(canvas) { this.canvas = canvas; }

  init() {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = (this.scene = new THREE.Scene());
    scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;
    const key = new THREE.DirectionalLight('#fff2dc', 2.6); key.position.set(-3, 6, 5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6;
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
    const rim = new THREE.DirectionalLight('#ff8fb4', 2.2); rim.position.set(4, 1, -4);
    scene.add(key, rim, new THREE.HemisphereLight('#fff4f0', '#ff9ec0', 0.7));

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 0, 9);

    // textures painted by the same cookie painter as the rest of the site
    const src = cookieCanvas(1024, { ...FLAVORS.chocolateChip, chunks: null, seed: 11, shadow: false });
    const topCanvas = document.createElement('canvas'); topCanvas.width = topCanvas.height = 1024;
    const tctx = topCanvas.getContext('2d');
    tctx.fillStyle = '#b8793f'; tctx.fillRect(0, 0, 1024, 1024);
    tctx.drawImage(src, -1024 * 0.1, -1024 * 0.1, 1024 * 1.2, 1024 * 1.2);
    const map = new THREE.CanvasTexture(topCanvas);
    map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
    const doughMat = new THREE.MeshStandardMaterial({ map, roughness: 0.82, metalness: 0, bumpMap: map, bumpScale: 1.6 });
    const crumbMat = new THREE.MeshStandardMaterial({ color: '#e0b27a', roughness: 0.95, side: THREE.DoubleSide });
    const chocMat = new THREE.MeshStandardMaterial({ color: '#3a1d10', roughness: 0.32, metalness: 0.05 });

    this.cookie = new THREE.Group();
    this.wedges = [];
    const prof = profile();
    const rand = rng(5);
    const shapePts = prof.map((p) => new THREE.Vector2(p.x, p.y));
    for (let w = 0; w < WEDGES; w++) {
      const phi0 = (w / WEDGES) * Math.PI * 2, phiL = (Math.PI * 2) / WEDGES;
      const g = new THREE.Group();
      const shell = applySurface(new THREE.LatheGeometry(prof, 40, phi0, phiL));
      const m = new THREE.Mesh(shell, doughMat); m.castShadow = m.receiveShadow = true; g.add(m);
      // cut faces (inside crumb) at both ends of the wedge
      [phi0, phi0 + phiL].forEach((phi) => {
        const fg = new THREE.ShapeGeometry(new THREE.Shape(shapePts));
        fg.rotateY(phi - Math.PI / 2);
        const face = new THREE.Mesh(applySurface(fg), crumbMat);
        g.add(face);
      });
      // chocolate chunks on top of this wedge
      for (let i = 0; i < 5; i++) {
        const a = phi0 + (0.15 + rand() * 0.7) * phiL, d = R * (0.2 + rand() * 0.65);
        const x = Math.sin(a) * d, z = Math.cos(a) * d;
        const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.075 + rand() * 0.06, 1), chocMat);
        chunk.scale.set(1, 0.55 + rand() * 0.3, 1);
        chunk.position.set(x, H * 0.5 + bumps(x, z) + 0.035, z);
        chunk.rotation.set(rand() * 3, rand() * 3, rand() * 3);
        chunk.castShadow = true;
        g.add(chunk);
      }
      const mid = phi0 + phiL / 2;
      g.userData = { dir: new THREE.Vector3(Math.sin(mid), 0, Math.cos(mid)), spinAxis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(), speed: 0.6 + rand() * 0.8 };
      this.cookie.add(g);
      this.wedges.push(g);
    }
    scene.add(this.cookie);

    // soft shadow catcher
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.16 }));
    catcher.rotation.x = -Math.PI / 2; catcher.position.y = -1.9; catcher.receiveShadow = true;
    scene.add(catcher);
    this.catcher = catcher;

    // crumb cloud (instanced)
    const N = 160;
    this.crumbs = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.045, 0), new THREE.MeshStandardMaterial({ color: '#c88a4e', roughness: 0.9 }), N);
    this.crumbData = Array.from({ length: N }, () => ({
      a: rand() * Math.PI * 2, d: R * (0.9 + rand() * 1.6), y: (rand() - 0.5) * 2.4, s: 0.5 + rand() * 1.4,
      sp: 0.1 + rand() * 0.4, rot: new THREE.Euler(rand() * 3, rand() * 3, rand() * 3), burst: 1 + rand() * 3,
    }));
    scene.add(this.crumbs);
    this.tmp = new THREE.Object3D();

    this.resize();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.canvas);
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting)); this.io.observe(this.canvas);
    this.visible = true;
    this.clock = new THREE.Clock();
    gsap.ticker.add(this.tick);
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // keep the cookie a similar size on portrait screens
    this.camera.position.z = w / h < 1 ? 13 : 9;
    this.camera.updateProjectionMatrix();
  }

  tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.visible) return;
    const s = this.state, t = this.clock.elapsedTime;
    const c = this.cookie;
    // idle float + scroll spin + mouse tilt (eased)
    this.mx = (this.mx || 0) + (s.mx - (this.mx || 0)) * 0.06;
    this.my = (this.my || 0) + (s.my - (this.my || 0)) * 0.06;
    c.rotation.set(s.tilt + this.my * 0.25, s.spin + t * 0.15 + this.mx * 0.4, Math.sin(t * 0.7) * 0.04);
    c.position.set(0.9 * (1 - s.break * 0.6), s.y + Math.sin(t * 1.2) * 0.06, 0);
    c.scale.setScalar(s.zoom);
    const b = s.break;
    this.wedges.forEach((w) => {
      const u = w.userData;
      w.position.copy(u.dir).multiplyScalar(b * 1.5 * u.speed);
      w.position.y = b * (u.speed - 0.9) * 0.9;
      w.quaternion.setFromAxisAngle(u.spinAxis, b * 1.1 * u.speed);
    });
    this.catcher.material.opacity = 0.16 * (1 - b);
    // crumbs orbit, then burst with the break
    this.crumbData.forEach((d, i) => {
      const a = d.a + t * d.sp * 0.3;
      const dist = d.d * (1 + b * d.burst);
      this.tmp.position.set(Math.cos(a) * dist + c.position.x, d.y * (1 + b * 1.5) + Math.sin(t * d.sp + i) * 0.08, Math.sin(a) * dist);
      this.tmp.rotation.set(d.rot.x + t * d.sp, d.rot.y + t, d.rot.z);
      this.tmp.scale.setScalar(d.s * s.zoom);
      this.tmp.updateMatrix();
      this.crumbs.setMatrixAt(i, this.tmp.matrix);
    });
    this.crumbs.instanceMatrix.needsUpdate = true;
    this.canvas.style.opacity = s.fade;
    this.renderer.render(this.scene, this.camera);
  };

  destroy() {
    gsap.ticker.remove(this.tick);
    this.ro?.disconnect(); this.io?.disconnect();
    this.renderer.dispose();
  }
}
