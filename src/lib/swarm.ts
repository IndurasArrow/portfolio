import { bloom } from "three/addons/tsl/display/BloomNode.js";
import {
  Fn,
  abs,
  atan,
  clamp,
  cos,
  dot,
  exp,
  float,
  instanceIndex,
  instancedArray,
  length,
  max,
  mix,
  normalize,
  pass,
  sin,
  smoothstep,
  step,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import {
  AdditiveBlending,
  Color,
  Matrix4,
  type Node,
  NormalBlending,
  Object3D,
  PerspectiveCamera,
  RenderPipeline,
  SRGBColorSpace,
  Scene,
  Sprite,
  SpriteNodeMaterial,
  Vector3,
  Vector4,
  WebGPURenderer,
} from "three/webgpu";
import {
  FORM_POINTS,
  formNames,
  makeShape,
  makeText,
  type Shape,
} from "./shapes";

/**
 * The particle swarm behind the page.
 *
 * Every particle is simulated on the GPU: a compute pass moves each one
 * towards its place in the current form on a damped spring, so particles
 * carry momentum, overshoot a little and settle. It runs on WebGPU where the
 * browser has it and on WebGL 2 otherwise (three.js picks; the same code
 * drives both).
 *
 * A flight is paced to be followed by eye: particles gather speed, travel
 * and settle in under a second, and anything moving fast is drawn as a short
 * streak along its path (as a camera would blur it), so it reads as one
 * continuous motion instead of a dot jumping from frame to frame.
 *
 * Any element on the page with a `data-shape` attribute is a stage: the
 * swarm goes to whichever stage the visitor is scrolling towards, sizes
 * itself to it, and takes the form the attribute names. Changing the
 * attribute changes the form, which is how the hero and the domain list
 * drive it.
 *
 * On a dark page the frame goes through a bloom pass, so particles in
 * motion (which are lit in the signal colour, brighter than white) glow.
 *
 * The engine watches its own frame time and gives up quality in steps if a
 * device cannot hold the frame rate: resolution first, then bloom, then
 * particles.
 */
export type Swarm = { destroy: () => void };

export type Readout = {
  count: number;
  label: string;
  backend: "WebGPU" | "WebGL 2";
};

export type SwarmOptions = {
  /** For visitors who prefer reduced motion: forms change, nothing flies. */
  reducedMotion: boolean;
  /** Font stack for the figures drawn as particles. */
  font: string;
  /** Skip WebGPU even where it is available. For testing the fallback. */
  forceWebGL?: boolean;
  onReadout: (readout: Readout) => void;
};

/** How stiffly a particle is pulled to its place; higher settles sooner. */
const STIFFNESS = 9.5;
/** After a change of form the pull builds up over this long, so particles ease away. */
const LAUNCH_SECONDS = 0.34;
/** Just under critical damping: a slight overshoot, no ringing. */
const DAMPING = 0.82;
const RIPPLE_SECONDS = 1.3;
const CAMERA_Z = 10;
const FOV = 35;
/** A frame slower than this, sustained, costs a quality step. */
const SLOW_FRAME = 1 / 45;

/** Reads a theme token written as "H S% L%" into a colour. */
function token(name: string, into: Color) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const [h = 0, s = 0, l = 0] = raw
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseFloat(part));
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  into.setRGB(channel(0), channel(8), channel(4), SRGBColorSpace);
}

export async function createSwarm(
  canvas: HTMLCanvasElement,
  { reducedMotion, font, forceWebGL = false, onReadout }: SwarmOptions,
): Promise<Swarm> {
  const renderer = new WebGPURenderer({
    canvas,
    alpha: true,
    antialias: false,
    forceWebGL,
    powerPreference: "high-performance",
  });
  await renderer.init();
  renderer.setClearColor(0x000000, 0);

  // Also true while the visitor has paused animations (see `src/lib/motion.ts`).
  let still = reducedMotion;

  const webgpu =
    (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend === true;
  const small = window.innerWidth < 768;
  const count = webgpu ? (small ? 40000 : 120000) : small ? 24000 : 60000;

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAMERA_Z;
  const halfHeight = Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;

  /* -------------------------------------------------------------- Buffers */

  // Four floats per particle in each, which is the layout the GPU wants.
  const stateData = new Float32Array(count * 4); // position (in the form's own space), heat
  const seedData = new Float32Array(count * 4); // four random numbers, fixed
  const targetData = new Float32Array(count * 4); // place in the current form
  for (let i = 0; i < count * 4; i++) seedData[i] = Math.random();
  // Particles start scattered wide, so the first form assembles on arrival.
  for (let i = 0; i < count; i++) {
    stateData[i * 4] = (Math.random() - 0.5) * 9;
    stateData[i * 4 + 1] = (Math.random() - 0.5) * 9;
    stateData[i * 4 + 2] = (Math.random() - 0.5) * 9;
  }

  const state = instancedArray(stateData, "vec4");
  const velocity = instancedArray(count, "vec4");
  const seeds = instancedArray(seedData, "vec4");
  const targets = instancedArray(targetData, "vec4");

  /* ------------------------------------------------------------- Uniforms */

  const uDt = uniform(0);
  const uTime = uniform(0);
  const uStiffness = uniform(STIFFNESS);
  const uSnap = uniform(still ? 1 : 0);
  /** How far the form has turned about its upright axis. */
  const uTurn = uniform(0);
  const uNoise = uniform(0);
  const uTurb = uniform(0);
  const uScale = uniform(1);
  const uSize = uniform(0.01);
  const uOpacity = uniform(0);
  const uGlow = uniform(1);
  const uModel = uniform(new Matrix4());
  const uModelInverse = uniform(new Matrix4());
  /** Applied to every particle for one frame when the swarm changes stage. */
  const uRebase = uniform(new Vector4(0, 0, 0, 1));
  const uPointer = uniform(new Vector3());
  const uRipple = uniform(new Vector3(0, 0, -1));
  const uColor = uniform(new Color(1, 1, 1));
  const uSignal = uniform(new Color(1, 0.6, 0.2));

  /* ----------------------------------------------------------- Simulation */

  const flow = (p: Node<"vec3">, t: Node<"float">) =>
    vec3(
      sin(p.y.mul(2.1).add(t)).add(sin(p.z.mul(1.7).add(t.mul(1.3)))),
      sin(p.z.mul(2.3).add(t.mul(1.1))).add(sin(p.x.mul(1.9).add(t.mul(0.7)))),
      sin(p.x.mul(2.2).add(t.mul(0.9))).add(sin(p.y.mul(1.6).add(t.mul(1.2)))),
    ).mul(0.5);

  const simulate = Fn(() => {
    const own = state.element(instanceIndex);
    const moving = velocity.element(instanceIndex);
    const seed = seeds.element(instanceIndex);
    const goal = targets.element(instanceIndex);

    // On a change of stage the swarm's frame of reference jumps to the new
    // stage; this restates each particle in it, so nothing moves on screen.
    const position = own.xyz.mul(uRebase.w).add(uRebase.xyz).toVar();
    const speed = moving.xyz.mul(uRebase.w).toVar();

    // Where this particle belongs: its place in the form (shared with a few
    // others, so nudged apart), drifting slowly so the form stays alive.
    // The form's own turning is applied here, to the places and not to the
    // swarm as a whole, so particles still in flight are not swung with it.
    const c = cos(uTurn);
    const s = sin(uTurn);
    const home = vec3(
      goal.x.mul(c).add(goal.z.mul(s)),
      goal.y,
      goal.z.mul(c).sub(goal.x.mul(s)),
    )
      .add(seed.yzw.sub(0.5).mul(0.012))
      .toVar();
    home.addAssign(
      flow(home.mul(1.6).add(seed.yzw.mul(6)), uTime.mul(0.35)).mul(
        uNoise.add(uTurb.mul(seed.y.mul(0.7).add(0.3))),
      ),
    );

    // On screen, the pointer parts the particles around it and a click sends
    // one ring outwards through them, towards the viewer.
    const world = uModel.mul(vec4(home, 1));
    const away = world.xy.sub(uPointer.xy);
    const push = uPointer.z.mul(exp(dot(away, away).div(-0.3)));
    const out = world.xy.sub(uRipple.xy);
    const age = uRipple.z;
    const reach = length(out).sub(age.mul(5.5));
    const ring = step(0, age)
      .mul(max(0, float(1).sub(age.div(RIPPLE_SECONDS))))
      .mul(exp(reach.mul(reach).div(-0.1)));
    const displaced = vec4(
      world.xy
        .add(normalize(away.add(0.0001)).mul(push).mul(0.42))
        .add(normalize(out.add(0.0001)).mul(ring).mul(0.34)),
      world.z.add(ring.mul(0.5)),
      1,
    );
    const destination = uModelInverse.mul(displaced).xyz;

    // A damped spring to it. Each particle is a little stiffer or slacker
    // than the next, so a form fills in rather than snapping as one sheet.
    const omega = uStiffness.mul(seed.x.mul(0.44).add(0.78));
    const pull = destination
      .sub(position)
      .mul(omega.mul(omega))
      .sub(speed.mul(omega.mul(2 * DAMPING)));
    speed.addAssign(pull.mul(uDt));
    position.addAssign(speed.mul(uDt));

    // With reduced motion there is no flight: particles are simply there.
    position.assign(mix(position, destination, uSnap));
    speed.mulAssign(float(1).sub(uSnap));

    // Heat: how fast it is going across the screen, smoothed. Hot particles
    // are drawn in the signal colour. The slow turn of a form does not count.
    const hot = clamp(
      length(speed)
        .mul(uScale)
        .sub(0.7)
        .mul(0.18)
        .add(ring.mul(1.5))
        .add(push.mul(1.2)),
      0,
      1,
    );
    own.assign(vec4(position, mix(own.w, hot, 0.22)));
    moving.assign(vec4(speed, 0));
  })().compute(count);

  /* ------------------------------------------------------------ Rendering */

  const material = new SpriteNodeMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  {
    const own = state.toAttribute();
    const seed = seeds.toAttribute();
    const world = uModel.mul(vec4(own.xyz, 1));

    // Depth across the form, 0 at the back and 1 at the front. Near
    // particles are larger and brighter; those off the focal plane spread
    // and fade, as they would through a lens.
    const depth = clamp(world.z.div(uScale).mul(0.5).add(0.5), 0, 1).toVarying();
    const blur = abs(depth.sub(0.6));
    // A few particles are always lit, moving or not.
    const heat = clamp(own.w.add(step(0.955, seed.y)), 0, 1).toVarying();
    const alpha = seed.z
      .mul(0.7)
      .add(0.3)
      .mul(mix(0.28, 1.15, depth))
      .div(blur.mul(blur).mul(9).add(1))
      .toVarying();

    // Motion blur: a particle is stretched along its path by as far as it
    // travels in one frame, and thinned out to keep the same light.
    const drift = uModel.mul(vec4(velocity.toAttribute().xyz, 0)).xy;
    const stretch = clamp(length(drift).mul(uDt).div(uSize), 0, 9).toVarying();
    const size = uSize
      .mul(seed.w.mul(0.9).add(0.55))
      .mul(mix(0.65, 1.3, depth))
      .mul(blur.mul(2.4).add(1));

    material.positionNode = world.xyz;
    material.scaleNode = vec2(size.mul(stretch.add(1)), size);
    // (The small constant keeps the angle defined for a particle at rest.)
    material.rotationNode = atan(drift.y, drift.x.add(0.00001));

    // In focus: a crisp disc. Out of focus: a soft one.
    const soft = float(0.12).mul(float(1).sub(clamp(blur.mul(2), 0, 1)));
    const disc = float(1).sub(smoothstep(soft, 0.5, length(uv().sub(0.5))));
    material.colorNode = mix(uColor, uSignal.mul(uGlow), heat);
    material.opacityNode = disc
      .mul(alpha)
      .mul(uOpacity)
      .div(stretch.mul(0.9).add(1));
  }

  const sprite = new Sprite(material);
  sprite.count = count;
  sprite.frustumCulled = false;
  const scene = new Scene();
  scene.add(sprite);

  // The dark page: the frame is drawn off screen, bloomed, and laid over the
  // page as light. Alpha follows brightness, so dark pixels show the page.
  const pipeline = new RenderPipeline(renderer);
  const lit = pass(scene, camera).getTextureNode();
  const overPage = (rgb: Node<"vec3">) =>
    vec4(rgb, clamp(max(rgb.r, max(rgb.g, rgb.b)), 0, 1).pow(0.4545));
  const plainOutput = overPage(lit.rgb);
  const bloomOutput = overPage(lit.rgb.add(bloom(lit, 0.7, 0.4, 1).rgb));

  /* -------------------------------------------------------------- Quality */

  // Steps down, never back up: 0 full, 1 lower resolution, 2 no bloom,
  // 3 half the particles, 4 a quarter and device pixels 1:1.
  let tier = 0;
  let dark = true;
  let bloomOn = false;
  let baseOpacity = 1;
  const drawn = () => Math.round(count * (tier >= 4 ? 0.25 : tier >= 3 ? 0.5 : 1));
  const pixelRatio = () =>
    Math.min(window.devicePixelRatio || 1, tier >= 4 ? 1 : tier >= 1 ? 1.25 : 2);

  let width = 1;
  let height = 1;
  const resize = () => {
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  let label = "";
  const report = () =>
    onReadout({ count: drawn(), label, backend: webgpu ? "WebGPU" : "WebGL 2" });

  /** Applies the theme, the motion setting and the current quality tier. */
  const apply = () => {
    dark = document.documentElement.classList.contains("dark");
    still = reducedMotion || document.documentElement.dataset.motion === "off";
    uSnap.value = still ? 1 : 0;
    token("--foreground", uColor.value);
    token("--signal", uSignal.value);
    // Light adds up on a dark page; on a light one the particles are ink.
    material.blending = dark ? AdditiveBlending : NormalBlending;
    material.needsUpdate = true;
    // Bloom is for the dark page, on screens big enough to show it.
    bloomOn = dark && !small && tier < 2;
    pipeline.outputNode = bloomOn ? bloomOutput : plainOutput;
    pipeline.needsUpdate = true;
    // Lit particles go above white so only they cross the bloom threshold.
    uGlow.value = bloomOn ? 3.4 : dark ? 1.5 : 1;
    // More particles, each fainter: the forms keep the same overall weight.
    baseOpacity = (dark ? 0.66 : 1.9) * Math.sqrt(16000 / drawn());
    sprite.count = drawn();
    resize();
    report();
  };
  apply();
  const themeWatch = new MutationObserver(apply);
  themeWatch.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-motion"],
  });
  const sizeWatch = new ResizeObserver(resize);
  sizeWatch.observe(canvas);

  /** A point on the page, as a position on the plane the forms sit on. */
  const toWorld = (clientX: number, clientY: number): [number, number] => {
    const perPixel = (2 * halfHeight) / height;
    return [
      (clientX - width / 2) * perPixel,
      -(clientY - height / 2) * perPixel,
    ];
  };

  /* ---------------------------------------------------------------- Forms */

  const cache = new Map<string, Shape>();
  const shapeFor = (name: string) => {
    let shape = cache.get(name);
    if (!shape) {
      shape = name.startsWith("text:")
        ? makeText(name.slice(5), font)
        : makeShape(name);
      cache.set(name, shape);
    }
    return shape;
  };

  // Build every form ahead of need, one per idle moment, so the first visit
  // to a stage never waits on it.
  const pending = [
    ...new Set([
      ...[...document.querySelectorAll<HTMLElement>("[data-shape]")].map(
        (stage) => stage.dataset.shape ?? "",
      ),
      ...formNames,
    ]),
  ].filter(Boolean);
  let idle = 0;
  const idly =
    window.requestIdleCallback ??
    ((run: () => void) => window.setTimeout(run, 60));
  const cancelIdly = window.cancelIdleCallback ?? window.clearTimeout;
  const warm = () => {
    const name = pending.shift();
    if (name === undefined) return;
    shapeFor(name);
    idle = idly(warm);
  };
  idle = idly(warm);

  // The swarm's place, size and turn on the page.
  const rig = new Object3D();
  const offset = new Vector3();
  let current = "";
  let shape: Shape | null = null;
  let morphedAt = -Infinity;

  /**
   * Changes form, and place when `place` is given. Particles keep their
   * position and momentum: only where they are headed changes, so each one
   * flies straight from where it is to its new place.
   */
  const morph = (
    name: string,
    place: { x: number; y: number; scale: number } | null,
  ) => {
    const next = shapeFor(name);
    if (place && shape) {
      const ratio = rig.scale.x / place.scale;
      offset
        .set(rig.position.x - place.x, rig.position.y - place.y, 0)
        .applyQuaternion(rig.quaternion.clone().invert())
        .divideScalar(place.scale);
      uRebase.value.set(offset.x, offset.y, offset.z, ratio);
    }
    if (place) {
      rig.position.set(place.x, place.y, 0);
      rig.scale.setScalar(place.scale);
    }
    // Each point of the form is shared between several particles.
    const points = next.points;
    for (let i = 0; i < count; i++) {
      const from = (i % FORM_POINTS) * 4;
      targetData[i * 4] = points[from] as number;
      targetData[i * 4 + 1] = points[from + 1] as number;
      targetData[i * 4 + 2] = points[from + 2] as number;
    }
    targets.value.needsUpdate = true;
    current = name;
    shape = next;
    morphedAt = performance.now();
  };

  /* -------------------------------------------------------------- Pointer */

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let pointerX = 0;
  let pointerY = 0;
  let pointerAt = -Infinity;
  let rippleAt = -Infinity;
  const onPointer = (event: PointerEvent) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerAt = performance.now();
  };
  const onPress = (event: PointerEvent) => {
    if (still) return;
    const [x, y] = toWorld(event.clientX, event.clientY);
    uRipple.value.x = x;
    uRipple.value.y = y;
    rippleAt = performance.now();
  };
  if (fine) window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPress, { passive: true });

  /* ---------------------------------------------------------------- Frame */

  let stages: HTMLElement[] = [];
  let active: HTMLElement | null = null;
  let placed = false;
  let frames = 0;
  let last = performance.now();
  const started = last;
  let lastScroll = window.scrollY;
  let turbulence = 0;
  let heading = 0;
  let spin = 0;
  let lean = 0;
  let turn = 0;
  let density = 1;
  let tilt = 0;
  let tiltCatchUp = 0;
  let frameTime = 1 / 60;
  let slowFor = 0;
  let steadySince = last;
  let destroyed = false;

  const frame = (now: number) => {
    if (destroyed) return;
    const elapsed = (now - last) / 1000;
    const dt = Math.min(1 / 30, elapsed);
    last = now;

    // Behind the full-screen project viewer nothing of the swarm shows.
    if (document.documentElement.dataset.viewer === "open") {
      steadySince = now;
      return;
    }

    // Watch the frame time and give up quality if it stays slow. Long gaps
    // (a background tab, a debugger) are not the device being slow; a frame
    // of a tenth of a second is.
    if (elapsed < 0.25) {
      frameTime += (elapsed - frameTime) * 0.08;
      slowFor = frameTime > SLOW_FRAME ? slowFor + elapsed : 0;
      if (slowFor > 1.2 && now - steadySince > 2500 && tier < 4) {
        tier += 1;
        slowFor = 0;
        steadySince = now;
        frameTime = 1 / 60;
        document.documentElement.dataset.sceneTier = String(tier);
        apply();
      }
    } else {
      steadySince = now;
    }

    // Scrolling stirs the swarm a little, and says which way the visitor is
    // heading.
    const scrolled = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    const stir = still ? 0 : Math.min(0.1, Math.abs(scrolled) * 0.0016);
    turbulence += (stir - turbulence) * (1 - Math.exp(-dt * 6));
    heading +=
      (Math.max(-1, Math.min(1, scrolled / 6)) - heading) *
      (1 - Math.exp(-dt * 8));

    // The list of stages changes rarely; look again about once a second.
    if (frames++ % 60 === 0) {
      stages = [...document.querySelectorAll<HTMLElement>("[data-shape]")];
    }

    // The stage nearest the line of attention wins. That line sits at the
    // middle of the screen and moves ahead of the scroll, so the swarm
    // leaves for the next stage as it comes into view, not once it is
    // already centred. The current stage gets a small head start so two
    // close stages do not trade places.
    const attention = height * (0.5 + 0.1 * heading);
    let best: HTMLElement | null = null;
    let bestRect: DOMRect | null = null;
    let bestDistance = Infinity;
    for (const stage of stages) {
      const rect = stage.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      const distance =
        Math.abs(rect.top + rect.height / 2 - attention) -
        (stage === active ? 40 : 0);
      if (distance < bestDistance) {
        best = stage;
        bestRect = rect;
        bestDistance = distance;
      }
    }
    if (!best || !bestRect) return;

    const name = best.dataset.shape ?? "cloud";
    const half = shapeFor(name).wide
      ? Math.min(bestRect.width / 2, bestRect.height)
      : Math.min(bestRect.width, bestRect.height) / 2;
    const centre = bestRect.top + bestRect.height / 2;
    const [x, y] = toWorld(bestRect.left + bestRect.width / 2, centre);
    const perPixel = (2 * halfHeight) / height;
    const scale = half * perPixel;

    // Forms tip back as they come up from below and forward as they leave
    // over the top, as if the page were the face of a drum.
    const nextTilt = still
      ? 0
      : Math.max(-1, Math.min(1, (centre - height / 2) / height)) * 0.6;

    if (best !== active || name !== current) {
      const moved = best !== active && placed;
      active = best;
      morph(name, moved || !placed ? { x, y, scale } : null);
      // The new stage sits at a different height, so its tilt differs.
      // Carry the difference and let it run out, so nothing snaps.
      if (moved) tiltCatchUp += tilt - nextTilt;
    }
    if ((best.dataset.label ?? "") !== label) {
      label = best.dataset.label ?? "";
      report();
    }
    tilt = nextTilt;
    tiltCatchUp *= Math.exp(-dt * 6);
    if (!shape) return;

    // Far off screen and settled, there is nothing to simulate or draw: the
    // last frame drawn was already empty.
    const away =
      bestRect.bottom < -height * 1.2 || bestRect.top > height * 2.2;
    if (away && now - morphedAt > 1500) return;

    // Locked to its stage, so a form scrolls with the page it belongs to.
    const follow = placed ? 1 - Math.exp(-dt * 20) : 1;
    rig.position.x += (x - rig.position.x) * follow;
    rig.position.y += (y - rig.position.y) * follow;
    rig.scale.setScalar(rig.scale.x + (scale - rig.scale.x) * follow);

    // A small stage packs the same particles tighter: draw them smaller and
    // fainter there.
    const packed = Math.min(1, Math.max(0.4, half / 280));
    density += (packed - density) * (placed ? 1 - Math.exp(-dt * 7) : 1);
    placed = true;
    const intro = Math.min(1, (now - started) / 900);
    uOpacity.value = baseOpacity * intro * (0.28 + 0.72 * density);
    uSize.value = perPixel * 2.1 * (0.45 + 0.55 * density);
    uScale.value = rig.scale.x || 1;

    const time = (now - started) / 1000;
    uTime.value = still ? 0 : time;
    uDt.value = dt;
    uTurb.value = turbulence;
    uNoise.value +=
      ((still ? 0 : shape.noise / density) - uNoise.value) *
      (1 - Math.exp(-dt * 2.5));
    // The pull builds up after each change of form, so particles ease away
    // instead of leaping. The first form gathers a little more slowly, and
    // everything tightens while the page is moving fast.
    const since = Math.min(1, (now - morphedAt) / (LAUNCH_SECONDS * 1000));
    const launch = 0.3 + 0.7 * since * since * (3 - 2 * since);
    uStiffness.value =
      STIFFNESS *
      launch *
      (0.6 + 0.4 * Math.min(1, time / 1.4)) *
      (1 + turbulence * 3);
    uRipple.value.z =
      now - rippleAt < RIPPLE_SECONDS * 1000 ? (now - rippleAt) / 1000 : -1;

    // Solid forms turn; flat ones come to face the viewer and sway.
    if (shape.spin && !still) {
      spin += dt * 0.22;
    } else {
      const rest = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
      spin += (rest - spin) * (1 - Math.exp(-dt * 6));
    }
    const sway = shape.spin || still ? 0 : Math.sin(time * 0.5) * 0.18;

    const live = fine && !still && now - pointerAt < 2500;
    const nx = (pointerX / width) * 2 - 1;
    const ny = -((pointerY / height) * 2 - 1);
    const ease = 1 - Math.exp(-dt * 4);
    turn += ((live ? nx * 0.22 : 0) - turn) * ease;
    lean += ((live ? -ny * 0.12 : 0) + (shape.spin ? 0.16 : 0) - lean) * ease;
    uTurn.value = spin + sway;
    rig.rotation.y = turn;
    rig.rotation.x = lean + tilt + tiltCatchUp;
    rig.updateMatrix();
    uModel.value.copy(rig.matrix);
    uModelInverse.value.copy(rig.matrix).invert();

    const [px, py] = toWorld(pointerX, pointerY);
    uPointer.value.x = px;
    uPointer.value.y = py;
    uPointer.value.z += ((live ? 1 : 0) - uPointer.value.z) * ease;

    renderer.compute(simulate);
    // The restatement for a change of stage applies to exactly one step.
    uRebase.value.set(0, 0, 0, 1);

    if (dark) pipeline.render();
    else renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);

  return {
    destroy() {
      destroyed = true;
      renderer.setAnimationLoop(null);
      cancelIdly(idle);
      themeWatch.disconnect();
      sizeWatch.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPress);
      delete document.documentElement.dataset.sceneTier;
      material.dispose();
      pipeline.dispose();
      renderer.dispose();
    },
  };
}
