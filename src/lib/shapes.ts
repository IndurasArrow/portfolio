import { timeline } from "@/content/profile";

/**
 * The forms the particle swarm takes. Each is a cloud of `FORM_POINTS` points
 * in a box of about -1 to 1 on every axis ("wide" forms keep to -0.5 to 0.5
 * in height), so the engine can scale any of them to a stage on the page.
 *
 * Every form is built the same way: a list of weighted parts (a line, a
 * ring, a shell), and each point is dropped on one of them at random.
 *
 * A form always has the same number of points, however many particles the
 * swarm has: the engine shares each point between several particles. That
 * keeps a form quick to build (a few milliseconds) and small to keep.
 */
export const FORM_POINTS = 40000;

export type Shape = {
  /** x, y, z and a spare, per point: the layout the GPU buffers use. */
  points: Float32Array;
  /** Turns slowly. Flat forms sway instead, so they are never seen edge-on. */
  spin: boolean;
  /** Fits a 2:1 box instead of a square one. */
  wide: boolean;
  /** How far the points drift from their place at rest. */
  noise: number;
};

type V = [number, number, number];
type Rand = () => number;
type Sampler = (r: Rand) => V;
type Part = [weight: number, sample: Sampler];

const TAU = Math.PI * 2;

function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const jitter = (p: V, r: Rand, amount: number): V => [
  p[0] + (r() - 0.5) * amount,
  p[1] + (r() - 0.5) * amount,
  p[2] + (r() - 0.5) * amount,
];

const unit = (r: Rand): V => {
  const z = r() * 2 - 1;
  const a = r() * TAU;
  const s = Math.sqrt(1 - z * z);
  return [Math.cos(a) * s, Math.sin(a) * s, z];
};

const length = (a: V, b: V) =>
  Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

const line =
  (a: V, b: V, fuzz = 0.012): Sampler =>
  (r) => {
    const t = r();
    return jitter(
      [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ],
      r,
      fuzz,
    );
  };

/** A circle (or an arc of one) in the XY plane. */
const ring =
  (c: V, radius: number, fuzz = 0.012, from = 0, to = TAU): Sampler =>
  (r) => {
    const a = from + r() * (to - from);
    return jitter(
      [c[0] + Math.cos(a) * radius, c[1] + Math.sin(a) * radius, c[2]],
      r,
      fuzz,
    );
  };

/** The surface of a small sphere: how a node is drawn. */
const shell =
  (c: V, radius: number): Sampler =>
  (r) => {
    const d = unit(r);
    return [c[0] + d[0] * radius, c[1] + d[1] * radius, c[2] + d[2] * radius];
  };

/** The four sides of a rectangle in the XY plane, as parts. */
const frame = (
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  weight: number,
  fuzz = 0.012,
): Part[] => {
  const corners: V[] = [
    [cx - hw, cy - hh, 0],
    [cx + hw, cy - hh, 0],
    [cx + hw, cy + hh, 0],
    [cx - hw, cy + hh, 0],
  ];
  const perimeter = 4 * (hw + hh);
  return corners.map((corner, i) => {
    const next = corners[(i + 1) % 4] as V;
    return [
      (weight * length(corner, next)) / perimeter,
      line(corner, next, fuzz),
    ];
  });
};

const fill =
  (cx: number, cy: number, hw: number, hh: number, depth = 0.02): Sampler =>
  (r) => [
    cx + (r() * 2 - 1) * hw,
    cy + (r() * 2 - 1) * hh,
    (r() - 0.5) * depth,
  ];

function build(parts: Part[], seed: number): Float32Array {
  const r = mulberry32(seed);
  // Running totals of the weights, so a part is found by bisection.
  const upTo = new Float64Array(parts.length);
  let total = 0;
  parts.forEach(([weight], i) => {
    total += weight;
    upTo[i] = total;
  });
  const out = new Float32Array(FORM_POINTS * 4);
  for (let i = 0; i < FORM_POINTS; i++) {
    const pick = r() * total;
    let low = 0;
    let high = parts.length - 1;
    while (low < high) {
      const middle = (low + high) >> 1;
      if ((upTo[middle] as number) < pick) low = middle + 1;
      else high = middle;
    }
    out.set((parts[low] as Part)[1](r), i * 4);
  }
  return out;
}

/** Tips the whole form towards the viewer, so a spin shows its top. */
function tilt(points: Float32Array, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  for (let i = 0; i < points.length; i += 4) {
    const y = points[i + 1] as number;
    const z = points[i + 2] as number;
    points[i + 1] = y * c - z * s;
    points[i + 2] = y * s + z * c;
  }
  return points;
}

/* ------------------------------------------------------------------ Forms */

/** The fallback for a name with no form: loose and restless. */
function cloud(): Part[] {
  return [
    [
      1,
      (r) => {
        // Most points on a thick outer shell, the rest filling the inside.
        const d = unit(r);
        const radius = r() < 0.68 ? 0.78 + r() * 0.14 : 0.15 + r() * 0.63;
        return [d[0] * radius, d[1] * radius, d[2] * radius];
      },
    ],
  ];
}

/** Work. A stack of sheets, one on another. */
function stack(): Part[] {
  const parts: Part[] = [];
  for (let i = 0; i < 5; i++) {
    const y = -0.52 + i * 0.26;
    const flat =
      (inner: Sampler): Sampler =>
      (r) => {
        const p = inner(r);
        return [p[0], y + p[2], p[1]];
      };
    for (const [weight, side] of frame(0, 0, 0.78, 0.52, 2)) {
      parts.push([weight, flat(side)]);
    }
    parts.push([0.9, flat(fill(0, 0, 0.78, 0.52))]);
  }
  return parts;
}

/** Agentic AI. One orchestrator, six agents, and the calls between them. */
function agentic(): Part[] {
  const hub: V = [0, 0, 0];
  const agents: V[] = [
    [0.8, 0.25, 0.1],
    [-0.7, 0.45, -0.3],
    [0.2, -0.8, 0.35],
    [-0.45, -0.5, -0.6],
    [0.35, 0.7, -0.55],
    [-0.15, 0.2, 0.85],
  ];
  const parts: Part[] = [[3.2, shell(hub, 0.2)]];
  for (const agent of agents) {
    parts.push([1.3, shell(agent, 0.1)], [0.8, line(hub, agent)]);
  }
  for (const [a, b] of [
    [0, 4],
    [1, 3],
    [2, 5],
  ] as const) {
    parts.push([0.45, line(agents[a] as V, agents[b] as V)]);
  }
  return parts;
}

/** LLMs and RAG. Embedding vectors out of one origin. */
function vectors(): Part[] {
  const r = mulberry32(11);
  const parts: Part[] = [[2, shell([0, 0, 0], 0.07)]];
  const rays = 44;
  for (let i = 0; i < rays; i++) {
    // Evenly spread directions (a Fibonacci sphere), uneven lengths.
    const y = 1 - (2 * (i + 0.5)) / rays;
    const s = Math.sqrt(1 - y * y);
    const a = i * 2.399963;
    const reach = 0.4 + r() * 0.55;
    const tip: V = [Math.cos(a) * s * reach, y * reach, Math.sin(a) * s * reach];
    parts.push([reach, line([0, 0, 0], tip, 0.008)], [0.4, shell(tip, 0.028)]);
  }
  return parts;
}

/** Speech AI. A waveform. */
function waveform(): Part[] {
  const bars = 46;
  const parts: Part[] = [];
  for (let i = 0; i < bars; i++) {
    const x = -0.96 + (i * 1.92) / (bars - 1);
    const window = 1 - Math.pow((i - (bars - 1) / 2) / (bars * 0.62), 2);
    const height =
      0.03 +
      0.45 *
        Math.abs(Math.sin(i * 0.55)) *
        (0.3 + 0.7 * Math.abs(Math.sin(i * 0.17 + 0.6))) *
        window;
    parts.push([
      height + 0.02,
      (r) => [
        x + (r() - 0.5) * 0.014,
        (r() * 2 - 1) * height,
        (r() - 0.5) * 0.03,
      ],
    ]);
  }
  return parts;
}

/** Vision AI. A detection box around an object. */
function detection(): Part[] {
  const h = 0.74;
  const leg = 0.3;
  const parts: Part[] = [
    [7, shell([0, 0, 0], 0.3)],
    [2, ring([0, 0, 0], 0.46)],
  ];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const corner: V = [sx * h, sy * h, sz * h];
        parts.push(
          [1, line(corner, [sx * (h - leg), sy * h, sz * h])],
          [1, line(corner, [sx * h, sy * (h - leg), sz * h])],
          [1, line(corner, [sx * h, sy * h, sz * (h - leg)])],
        );
      }
    }
  }
  return parts;
}

/** Generative image. Noise on the left settling into pixels on the right. */
function diffusion(): Part[] {
  const cells = 17;
  return [
    [
      1,
      (r) => {
        const x = r() * 2 - 1;
        const y = r() * 2 - 1;
        const t = Math.min(1, Math.max(0, (x + 0.55) / 1.1));
        const settled = t * t * (3 - 2 * t);
        const snap = (v: number) => Math.round(v * cells) / cells;
        const loose = 1 - settled;
        return [
          (x + (snap(x) - x) * settled) * 0.86,
          (y + (snap(y) - y) * settled) * 0.86,
          (r() - 0.5) * 0.8 * loose * loose,
        ];
      },
    ],
  ];
}

/** Platforms and cloud. A lattice of services. */
function lattice(): Part[] {
  const at = [-0.66, -0.22, 0.22, 0.66];
  const pick = (r: Rand) => at[Math.floor(r() * at.length)] as number;
  return [
    [5, (r) => jitter([pick(r), pick(r), pick(r)], r, 0.05)],
    [
      4,
      (r) => {
        const along = (r() * 2 - 1) * 0.66;
        const a = pick(r);
        const b = pick(r);
        const axis = Math.floor(r() * 3);
        const p: V =
          axis === 0 ? [along, a, b] : axis === 1 ? [a, along, b] : [a, b, along];
        return jitter(p, r, 0.008);
      },
    ],
  ];
}

/** Embedded Linux. A system-on-chip, pins out. */
function chip(): Part[] {
  const parts: Part[] = [
    ...frame(0, 0, 0.5, 0.5, 4.5),
    ...frame(0, 0, 0.4, 0.4, 2),
    [3, fill(0, 0, 0.2, 0.2, 0.05)],
    [0.5, shell([-0.4, 0.4, 0], 0.03)],
  ];
  for (let i = 0; i < 6; i++) {
    const at = -0.375 + i * 0.15;
    parts.push(
      [0.45, line([at, 0.5, 0], [at, 0.82, 0])],
      [0.45, line([at, -0.5, 0], [at, -0.82, 0])],
      [0.45, line([0.5, at, 0], [0.82, at, 0])],
      [0.45, line([-0.5, at, 0], [-0.82, at, 0])],
    );
  }
  return parts;
}

/** Product design. A phone screen as a wireframe. */
function wireframe(): Part[] {
  const hw = 0.46;
  const hh = 0.92;
  const radius = 0.12;
  const quarter = Math.PI / 2;
  const arc = quarter * radius;
  const corners: [number, number, number][] = [
    [hw - radius, hh - radius, 0],
    [-hw + radius, hh - radius, quarter],
    [-hw + radius, -hh + radius, quarter * 2],
    [hw - radius, -hh + radius, quarter * 3],
  ];
  return [
    [hw * 2, line([-hw + radius, hh, 0], [hw - radius, hh, 0])],
    [hw * 2, line([-hw + radius, -hh, 0], [hw - radius, -hh, 0])],
    [hh * 2, line([-hw, -hh + radius, 0], [-hw, hh - radius, 0])],
    [hh * 2, line([hw, -hh + radius, 0], [hw, hh - radius, 0])],
    ...corners.map(
      ([x, y, from]): Part => [
        arc,
        ring([x, y, 0], radius, 0.012, from, from + quarter),
      ],
    ),
    [0.2, line([-0.09, 0.82, 0], [0.09, 0.82, 0])],
    [0.5, ring([-0.26, 0.58, 0], 0.085)],
    [0.35, line([-0.1, 0.62, 0], [0.3, 0.62, 0])],
    [0.25, line([-0.1, 0.54, 0], [0.18, 0.54, 0])],
    ...frame(0, 0.13, 0.34, 0.24, 1.6),
    ...frame(-0.18, -0.36, 0.16, 0.16, 0.9),
    ...frame(0.18, -0.36, 0.16, 0.16, 0.9),
    [0.8, fill(0, -0.72, 0.24, 0.05)],
  ];
}

/**
 * Method. The pipeline as it is run: spec and plan, the three-step loop
 * repeated for every task, then branch review and the pull request.
 */
function pipeline(): Part[] {
  const radius = 0.36;
  const parts: Part[] = [
    [5, ring([0, 0, 0], radius, 0.03)],
    [1.6, line([-1, 0, 0], [-radius, 0, 0])],
    [1.6, line([radius, 0, 0], [1, 0, 0])],
  ];
  const stops: V[] = [
    [-0.97, 0, 0],
    [-0.66, 0, 0],
    [0.66, 0, 0],
    [0.97, 0, 0],
  ];
  for (const turn of [0.25, 0.25 + 1 / 3, 0.25 + 2 / 3]) {
    stops.push([
      Math.cos(turn * TAU) * radius,
      Math.sin(turn * TAU) * radius,
      0,
    ]);
  }
  for (const stop of stops) parts.push([1.1, shell(stop, 0.05)]);
  return parts;
}

/** About. The year's workstreams, each from its first month to its last. */
function strands(): Part[] {
  const x = (month: number) => -0.95 + ((month - 1) / 11) * 1.9;
  const parts: Part[] = [
    [0.5, line([x(timeline.now), -0.78, 0], [x(timeline.now), 0.78, 0], 0.006)],
  ];
  timeline.rows.forEach((row, i) => {
    const y = 0.62 - i * (1.24 / (timeline.rows.length - 1));
    const from = x(row.start);
    const to = x(row.end ?? timeline.now) + (row.end === row.start ? 0.09 : 0);
    const depth = (at: number) => Math.sin(at * 3 + i * 1.3) * 0.14;
    parts.push(
      [
        to - from + 0.12,
        (r) => {
          const at = from + r() * (to - from);
          return jitter([at, y, depth(at)], r, 0.014);
        },
      ],
      [0.16, shell([from, y, depth(from)], 0.035)],
    );
    if (row.end !== null) parts.push([0.16, shell([to, y, depth(to)], 0.035)]);
  });
  return parts;
}

/** Contact. A globe, with Kanpur marked on it. */
function globe(): Part[] {
  const radius = 0.86;
  const rad = Math.PI / 180;
  const at = (lat: number, lon: number): V => [
    radius * Math.cos(lat * rad) * Math.cos(lon * rad),
    radius * Math.sin(lat * rad),
    radius * Math.cos(lat * rad) * Math.sin(lon * rad),
  ];
  const parts: Part[] = [];
  for (let lat = -75; lat <= 75; lat += 15) {
    parts.push([
      Math.cos(lat * rad),
      (r) => jitter(at(lat, r() * 360), r, 0.008),
    ]);
  }
  for (let lon = 0; lon < 360; lon += 30) {
    parts.push([0.42, (r) => jitter(at(r() * 160 - 80, lon), r, 0.008)]);
  }
  const kanpur = at(26.45, 80.33);
  parts.push([0.5, shell(kanpur, 0.035)], [0.35, shell(kanpur, 0.1)]);
  return parts;
}

/**
 * Cloud cut-overs. Two databases and the stream between them: the old one
 * on the left, the new one on the right.
 */
function cutover(): Part[] {
  const radius = 0.24;
  const half = 0.3;
  const parts: Part[] = [];
  for (const cx of [-0.62, 0.62]) {
    for (const y of [-half, 0, half]) {
      parts.push([
        1.5,
        (r) => {
          const a = r() * TAU;
          return jitter(
            [cx + Math.cos(a) * radius, y, Math.sin(a) * radius],
            r,
            0.012,
          );
        },
      ]);
    }
    parts.push([
      1.6,
      (r) => {
        const a = r() * TAU;
        return [
          cx + Math.cos(a) * radius,
          (r() * 2 - 1) * half,
          Math.sin(a) * radius,
        ];
      },
    ]);
  }
  // The stream: four dashes and an arrowhead.
  for (let i = 0; i < 4; i++) {
    const from = -0.3 + i * 0.15;
    parts.push([0.32, line([from, 0, 0], [from + 0.09, 0, 0])]);
  }
  parts.push(
    [0.25, line([0.3, 0, 0], [0.22, 0.07, 0])],
    [0.25, line([0.3, 0, 0], [0.22, -0.07, 0])],
  );
  return parts;
}

const forms: Record<
  string,
  { parts: () => Part[]; spin: boolean; wide?: boolean; noise: number; tilt?: number }
> = {
  cloud: { parts: cloud, spin: true, noise: 0.2 },
  stack: { parts: stack, spin: true, noise: 0.012, tilt: 0.42 },
  agentic: { parts: agentic, spin: true, noise: 0.018 },
  llm: { parts: vectors, spin: true, noise: 0.014 },
  speech: { parts: waveform, spin: false, wide: true, noise: 0.012 },
  vision: { parts: detection, spin: true, noise: 0.014 },
  image: { parts: diffusion, spin: false, noise: 0.014 },
  platforms: { parts: lattice, spin: true, noise: 0.012, tilt: 0.3 },
  embedded: { parts: chip, spin: false, noise: 0.01 },
  design: { parts: wireframe, spin: false, noise: 0.01 },
  cutover: { parts: cutover, spin: false, wide: true, noise: 0.012, tilt: 0.38 },
  pipeline: { parts: pipeline, spin: false, wide: true, noise: 0.012 },
  strands: { parts: strands, spin: false, noise: 0.012 },
  globe: { parts: globe, spin: true, noise: 0.008, tilt: 0.3 },
};

/** Every named form, so the engine can build them ahead of need. */
export const formNames = Object.keys(forms);

export function makeShape(name: string): Shape {
  const form = forms[name] ?? (forms.cloud as (typeof forms)[string]);
  const points = build(form.parts(), 7);
  if (form.tilt) tilt(points, form.tilt);
  return {
    points,
    spin: form.spin,
    wide: form.wide ?? false,
    noise: form.noise,
  };
}

/**
 * A short piece of text (the headline figures) as a point cloud: the text is
 * drawn to a canvas in the page's own typeface and the points are dropped on
 * its inked pixels.
 */
export function makeText(text: string, font: string): Shape {
  const width = 1200;
  const height = 600;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const points = new Float32Array(FORM_POINTS * 4);
  if (!ctx) return { points, spin: false, wide: true, noise: 0.01 };

  let size = 420;
  ctx.font = `300 ${size}px ${font}`;
  size *= Math.min(1, (width - 80) / ctx.measureText(text).width);
  ctx.font = `300 ${size}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, width / 2, height / 2);

  // Collect the inked pixels and the box they sit in.
  const data = ctx.getImageData(0, 0, width, height).data;
  const inked: number[] = [];
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if ((data[(y * width + x) * 4 + 3] as number) > 128) {
        inked.push(x, y);
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (inked.length === 0) return { points, spin: false, wide: true, noise: 0.01 };

  const scale = Math.min(1.9 / (right - left || 1), 0.9 / (bottom - top || 1));
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const r = mulberry32(text.length * 131 + 5);
  for (let i = 0; i < FORM_POINTS; i++) {
    const at = Math.floor(r() * (inked.length / 2)) * 2;
    points[i * 4] = ((inked[at] as number) + r() * 2 - cx) * scale;
    points[i * 4 + 1] = -((inked[at + 1] as number) + r() * 2 - cy) * scale;
    points[i * 4 + 2] = (r() - 0.5) * 0.06;
  }
  return { points, spin: false, wide: true, noise: 0.01 };
}
