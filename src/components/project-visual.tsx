import type { CSSProperties, ReactNode } from "react";
import type { VisualKey } from "@/content/work";

/**
 * Line-art animations, one per engineering project, drawn in the page's own
 * foreground colour so they follow the theme. Each is a small diagram of what
 * the project does rather than decoration.
 */

// Strokes keep one hairline weight however large the card draws the diagram.
const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;

const solid = { fill: "currentColor", stroke: "none" } as const;

const delay = (seconds: number): CSSProperties => ({
  animationDelay: `${seconds}s`,
});

const label = {
  ...solid,
  fontSize: 8.5,
  letterSpacing: 1.6,
  opacity: 0.55,
} as const;

/* Expanding-radius dispatch: rings grow from the order until a rider is found. */
function Dispatch() {
  const riders: [number, number][] = [
    [88, 58], [250, 122], [112, 136], [198, 142], [56, 104], [274, 70], [136, 34],
  ];
  return (
    <g {...line}>
      <circle cx="160" cy="90" r="26" opacity=".14" />
      <circle cx="160" cy="90" r="52" opacity=".1" />
      {[0, 1.3, 2.6].map((d) => (
        <circle key={d} cx="160" cy="90" r="80" className="v-ring" style={delay(d)} />
      ))}
      {riders.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" {...solid} opacity=".45" />
      ))}
      <path d="M160 90L230 50" strokeDasharray="3 6" className="v-dash" />
      <circle cx="230" cy="50" r="7" />
      <circle cx="230" cy="50" r="2.5" {...solid} />
      <circle cx="160" cy="90" r="4.5" {...solid} />
    </g>
  );
}

function Database({ x, faded }: { x: number; faded?: boolean }) {
  return (
    <g opacity={faded ? 0.4 : 1}>
      <ellipse cx={x} cy="56" rx="30" ry="9" />
      <path d={`M${x - 30} 56v68a30 9 0 0 0 60 0V56`} />
      <path
        d={`M${x - 30} 79a30 9 0 0 0 60 0M${x - 30} 102a30 9 0 0 0 60 0`}
        opacity=".5"
      />
    </g>
  );
}

/* Cut-over: records stream from the old store to the new one, then verify. */
function Cutover() {
  return (
    <g {...line}>
      <Database x={76} faded />
      <Database x={244} />
      <path d="M118 90h76" strokeDasharray="2 7" className="v-dash" />
      <path d="M190 84l7 6-7 6" />
      {[0, 0.5, 1].map((d, i) => (
        <rect
          key={d}
          x={128 + i * 20}
          y="68"
          width="8"
          height="8"
          rx="2"
          {...solid}
          className="v-blink"
          style={delay(d)}
        />
      ))}
      <circle cx="284" cy="42" r="10" fill="none" />
      <path d="M279 42l4 4 7-8" />
    </g>
  );
}

/* Speech in one language, out in another, with the measured delay between. */
function Speech() {
  const bars = [14, 30, 54, 24, 68, 40, 58, 20, 36, 12];
  return (
    <g>
      {bars.map((h, i) => (
        <rect
          key={`in-${i}`}
          x={40 + i * 9}
          y={84 - h / 2}
          width="3"
          height={h}
          rx="1.5"
          {...solid}
          opacity=".38"
          className="v-bar"
          style={delay(i * 0.09)}
        />
      ))}
      {bars.map((h, i) => (
        <rect
          key={`out-${i}`}
          x={196 + i * 9}
          y={84 - h / 2}
          width="3"
          height={h}
          rx="1.5"
          {...solid}
          className="v-bar"
          style={delay(0.45 + i * 0.09)}
        />
      ))}
      <g {...line}>
        <path d="M142 84h36" strokeDasharray="2 5" className="v-dash" />
        <path d="M174 78l7 6-7 6" />
      </g>
      <text x="143" y="70" {...label} letterSpacing={0.6} opacity={0.8}>
        0.85 s
      </text>
      <text x="40" y="146" {...label}>
        HINDI
      </text>
      <text x="196" y="146" {...label}>
        ENGLISH
      </text>
    </g>
  );
}

/* Retrieval: sources are chunked, the relevant chunks feed a cited answer. */
function Rag() {
  const chunks = [48, 72, 96, 120, 144];
  const picked = [72, 120];
  return (
    <g {...line}>
      <rect x="34" y="44" width="44" height="60" rx="4" opacity=".35" />
      <rect x="44" y="56" width="44" height="60" rx="4" opacity=".6" />
      <rect x="54" y="68" width="44" height="60" rx="4" />
      <path d="M63 82h26M63 92h26M63 102h16" opacity=".6" />
      {chunks.map((y) => (
        <path key={`a-${y}`} d={`M104 98L144 ${y}`} opacity=".22" />
      ))}
      {chunks.map((y, i) =>
        picked.includes(y) ? (
          <rect key={y} x="144" y={y - 5} width="10" height="10" rx="2.5" {...solid} className="v-pop" style={delay(i * 0.4)} />
        ) : (
          <rect key={y} x="144" y={y - 5} width="10" height="10" rx="2.5" opacity=".45" />
        ),
      )}
      {picked.map((y) => (
        <path key={`b-${y}`} d={`M158 ${y}L200 96`} strokeDasharray="3 5" className="v-dash" />
      ))}
      <rect x="200" y="58" width="88" height="76" rx="7" />
      <path d="M212 76h50M212 90h62M212 104h40" opacity=".65" />
      <circle cx="270" cy="76" r="4.5" />
      <circle cx="262" cy="104" r="4.5" />
      <path d="M212 120h28" opacity=".3" />
    </g>
  );
}

function Person({ x, helmet }: { x: number; helmet?: boolean }) {
  return (
    <g opacity=".55">
      <circle cx={x} cy="72" r="9" />
      {helmet && <path d={`M${x - 11} 70a11 11 0 0 1 22 0`} />}
      <path d={`M${x} 81v32M${x - 15} 96h30M${x} 113l-11 24M${x} 113l11 24`} />
    </g>
  );
}

/* Detection: people in a camera frame, boxed and labelled, under a scan line. */
function Vision() {
  return (
    <g {...line}>
      <path d="M22 38V22h16M298 38V22h-16M22 142v16h16M298 142v16h-16" opacity=".5" />
      <Person x={104} helmet />
      <Person x={212} />
      <rect x="76" y="50" width="56" height="96" rx="3" />
      <rect x="184" y="50" width="56" height="96" rx="3" strokeDasharray="4 4" className="v-dash" />
      <rect x="76" y="38" width="36" height="8" rx="2" {...solid} />
      <rect x="184" y="38" width="48" height="8" rx="2" {...solid} className="v-blink" />
      <path d="M22 0h276" className="v-scan" opacity=".7" />
      <circle cx="284" cy="34" r="3" {...solid} className="v-blink" />
    </g>
  );
}

/* A document checked field by field against rules; one discrepancy flagged. */
function Document() {
  const rows = [48, 76, 104, 132];
  return (
    <g {...line}>
      <path d="M46 26h60l20 20v108H46z" />
      <path d="M106 26v20h20" />
      <path d="M58 62h46M58 76h56M58 90h38M58 104h52M58 118h30M58 132h44" opacity=".55" />
      {rows.map((y, i) => (
        <g key={y}>
          <path d={`M132 ${y + 14 - i * 2}L186 ${y}`} strokeDasharray="2 6" className="v-dash" opacity=".4" />
          <rect x="190" y={y - 8} width="16" height="16" rx="4" />
          <path d={`M216 ${y}h${i === 2 ? 44 : 64 - i * 6}`} opacity={i === 2 ? 1 : 0.5} />
          {i === 2 ? (
            <path d={`M194 ${y - 4}l8 8M202 ${y - 4}l-8 8`} className="v-blink" />
          ) : (
            <path d={`M194 ${y}l3 3 6-7`} />
          )}
        </g>
      ))}
      <text x="216" y="118" {...label} opacity={0.9}>
        ART. 14
      </text>
    </g>
  );
}

function AppNode({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 22} y={y - 17} width="44" height="34" rx="8" fill="hsl(var(--background))" />
      <path d={`M${x - 11} ${y - 5}h22M${x - 11} ${y + 4}h13`} opacity=".6" />
    </g>
  );
}

/* Three apps kept in step by signed messages, with a digest in the middle. */
function Sync() {
  return (
    <g {...line}>
      <path d="M90 50h140" strokeDasharray="3 6" className="v-dash" />
      <path d="M90 50l70 86" strokeDasharray="3 6" className="v-dash" />
      <path d="M230 50l-70 86" strokeDasharray="3 6" className="v-dash" />
      <AppNode x={90} y={50} />
      <AppNode x={230} y={50} />
      <AppNode x={160} y={136} />
      <circle cx="160" cy="82" r="13" opacity=".35" />
      <circle cx="160" cy="82" r="3.5" {...solid} className="v-pop" />
      <path d="M152 44l5 5 9-10" />
    </g>
  );
}

/* Embedding space: a query and its nearest neighbours, then a ranked list. */
function Vectors() {
  const dots: [number, number][] = [
    [38, 40], [62, 118], [50, 78], [84, 54], [96, 142], [110, 96], [128, 36],
    [140, 128], [172, 60], [186, 110], [204, 148], [208, 34], [224, 84],
    [74, 96], [154, 152], [30, 144], [118, 66], [196, 70], [228, 130], [92, 24],
  ];
  const query: [number, number] = [150, 92];
  const near: [number, number][] = [[110, 96], [172, 60], [186, 110], [140, 128]];
  return (
    <g {...line}>
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" {...solid} opacity=".3" />
      ))}
      {near.map(([x, y]) => (
        <g key={`n-${x}`}>
          <path d={`M${query[0]} ${query[1]}L${x} ${y}`} opacity=".6" />
          <circle cx={x} cy={y} r="3.2" {...solid} />
        </g>
      ))}
      <circle cx={query[0]} cy={query[1]} r="30" className="v-ring" />
      <circle cx={query[0]} cy={query[1]} r="5" {...solid} />
      {[46, 34, 24, 14].map((w, i) => (
        <rect
          key={w}
          x="252"
          y={56 + i * 20}
          width={w}
          height="7"
          rx="3.5"
          {...solid}
          opacity={1 - i * 0.22}
        />
      ))}
    </g>
  );
}

/* Two agents, one board, one legal move at a time. */
function Chess() {
  const cell = 16;
  const ox = 58;
  const oy = 26;
  const squares: ReactNode[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        squares.push(
          <rect key={`${r}-${c}`} x={ox + c * cell} y={oy + r * cell} width={cell} height={cell} {...solid} opacity=".1" />,
        );
      }
    }
  }
  const at = (c: number, r: number) => [ox + c * cell + cell / 2, oy + r * cell + cell / 2] as const;
  const [fx, fy] = at(4, 6);
  const [tx, ty] = at(4, 4);
  const [bx, by] = at(3, 1);
  const [kx, ky] = at(6, 7);
  return (
    <g {...line}>
      {squares}
      <rect x={ox} y={oy} width={cell * 8} height={cell * 8} rx="3" />
      <circle cx={bx} cy={by} r="5" />
      <circle cx={kx} cy={ky} r="5" {...solid} />
      <circle cx={fx} cy={fy} r="5" {...solid} opacity=".3" />
      <path d={`M${fx} ${fy - 7}V${ty + 8}`} strokeDasharray="2 4" className="v-dash" />
      <circle cx={tx} cy={ty} r="5" {...solid} className="v-pop" />
      <g opacity=".9">
        <text x="210" y="62" {...label} letterSpacing={0.8}>1. e4</text>
        <text x="252" y="62" {...label} letterSpacing={0.8} opacity={0.35}>…</text>
        <path d="M210 76h62M210 90h44M210 104h54" opacity=".3" />
        <rect x="210" y="118" width="62" height="16" rx="4" opacity=".6" />
        <text x="217" y="129.5" {...label} letterSpacing={0.8} opacity={0.8}>LEGAL ✓</text>
      </g>
    </g>
  );
}

/* Many small builds. */
function Grid() {
  const cells: ReactNode[] = [];
  const glyphs = [1, 4, 8, 11, 15];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      const i = r * 6 + c;
      const x = 47 + c * 39;
      const y = 33 + r * 40;
      cells.push(
        <g key={i}>
          <rect x={x} y={y} width="30" height="30" rx="7" opacity=".45" />
          {glyphs.includes(i) ? (
            <rect x={x + 9} y={y + 9} width="12" height="12" rx="3" {...solid} className="v-blink" style={delay((i % 5) * 0.45)} />
          ) : (
            <path d={`M${x + 9} ${y + 12}h12M${x + 9} ${y + 19}h7`} opacity=".4" />
          )}
        </g>,
      );
    }
  }
  return <g {...line}>{cells}</g>;
}

const visuals: Record<VisualKey, () => ReactNode> = {
  dispatch: Dispatch,
  cutover: Cutover,
  speech: Speech,
  rag: Rag,
  vision: Vision,
  document: Document,
  sync: Sync,
  vectors: Vectors,
  chess: Chess,
  grid: Grid,
};

export function ProjectVisual({ name }: { name: VisualKey }) {
  const Visual = visuals[name];
  return (
    <div className="visual absolute inset-0 p-[7%] text-foreground" aria-hidden="true">
      <svg viewBox="0 0 320 180" className="h-full w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <Visual />
      </svg>
    </div>
  );
}
