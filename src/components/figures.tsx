import type { CSSProperties } from "react";
import type { StatGraphic } from "@/content/site";
import type { Figure } from "@/content/work";
import { InView } from "./in-view";

const n = (index: number, step?: string) =>
  ({ "--n": index, ...(step ? { "--step": step } : {}) }) as CSSProperties;

/* ---------------------------------------------------------------- Pieces */

/**
 * A grid of dots, drawn row by row. `lit` dots are solid, the rest faint, so
 * the same grid shows either a count (all lit) or a share (a few lit).
 */
function DotGrid({
  cells,
  columns,
  lit = cells,
}: {
  cells: number;
  columns: number;
  lit?: number;
}) {
  const rows = Math.ceil(cells / columns);
  const share = lit < cells;
  return (
    <svg
      viewBox={`0 0 ${columns * 10} ${rows * 10}`}
      className="h-auto w-full text-foreground"
      aria-hidden="true"
    >
      {Array.from({ length: rows }, (_, r) => (
        <g key={r} className="iv" style={n(r, "45ms")}>
          {Array.from({ length: Math.min(columns, cells - r * columns) }, (_, c) => {
            const on = r * columns + c < lit;
            return (
              <circle
                key={c}
                cx={c * 10 + 5}
                cy={r * 10 + 5}
                r={share && on ? 3.6 : 2.5}
                fill="currentColor"
                opacity={on ? 1 : 0.16}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}

const percent = (part: number, whole: number) => {
  const value = (part / whole) * 100;
  return value < 10 ? value.toFixed(1) : String(Math.round(value));
};

/* -------------------------------------------------- Headline-figure tiles */

/** The small graphic under each headline number on the home page. */
export function StatGraphicView({ graphic }: { graphic: StatGraphic }) {
  return (
    <InView className="max-w-[17rem]">
      {graphic.kind === "dots" && (
        <DotGrid cells={graphic.count} columns={graphic.columns} />
      )}

      {graphic.kind === "share" && (
        <DotGrid
          cells={graphic.cells}
          columns={graphic.columns}
          lit={Math.round((graphic.part / graphic.whole) * graphic.cells)}
        />
      )}

      {graphic.kind === "steps" && (
        <div>
          <ol className="flex">
            {graphic.steps.map((step, i) => (
              <li key={step} className="iv relative flex-1 pr-3" style={n(i, "160ms")}>
                {i < graphic.steps.length - 1 && (
                  <span className="absolute left-7 right-0 top-[0.6875rem] h-px bg-foreground/30" />
                )}
                <span className="flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full border border-foreground/60 text-[0.6875rem]">
                  {i + 1}
                </span>
                <span className="mt-2 block text-xs leading-snug">{step}</span>
              </li>
            ))}
          </ol>
          <p className="iv mt-3 flex items-center gap-2 text-xs text-muted-foreground" style={n(4, "160ms")}>
            <span aria-hidden="true">↺</span>
            {graphic.note}
          </p>
        </div>
      )}

      {graphic.kind === "bars" && (
        <div className="space-y-3 text-xs">
          <div>
            <div className="mb-1.5 flex justify-between">
              <span className="text-muted-foreground">{graphic.before.label}</span>
              <span>
                {graphic.before.low}–{graphic.before.high} {graphic.unit}
              </span>
            </div>
            <div className="relative h-2">
              <span
                className="iv-grow absolute inset-y-0 left-0 rounded-r bg-foreground/15"
                style={{ width: `${(graphic.before.high / graphic.max) * 100}%` }}
              />
              <span
                className="iv-grow absolute inset-y-0 left-0 rounded-r bg-foreground/40"
                style={{ width: `${(graphic.before.low / graphic.max) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between">
              <span className="text-muted-foreground">{graphic.after.label}</span>
              <span>
                {graphic.after.value} {graphic.unit}
              </span>
            </div>
            <div className="relative h-2">
              <span
                className="iv-grow absolute inset-y-0 left-0 rounded-r bg-foreground"
                style={{
                  width: `${(graphic.after.value / graphic.max) * 100}%`,
                  ...n(4),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </InView>
  );
}

/* ------------------------------------------------------- Viewer figures */

/** A diagram inside a case study. */
export function FigureView({ figure }: { figure: Figure }) {
  return (
    <InView>
      <figure className="mt-10 rounded-xl border p-5 md:p-6">
        <figcaption className="mb-5 font-medium">{figure.title}</figcaption>
        <FigureBody figure={figure} />
        {figure.note && (
          <p className="mt-5 text-sm text-muted-foreground">{figure.note}</p>
        )}
      </figure>
    </InView>
  );
}

function FigureBody({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case "flow":
      return (
        <ol className="grid gap-5 sm:auto-cols-fr sm:grid-flow-col sm:gap-0">
          {figure.steps.map((step, i) => (
            <li
              key={step.title}
              className="iv relative flex gap-3 sm:block sm:pr-5"
              style={n(i, "140ms")}
            >
              {i < figure.steps.length - 1 && (
                <span className="absolute left-9 right-0 top-3.5 hidden h-px bg-foreground/30 sm:block" />
              )}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-foreground/60 text-xs">
                {i + 1}
              </span>
              <span className="sm:mt-3 sm:block">
                <span className="block font-medium leading-snug">{step.title}</span>
                {step.text && (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {step.text}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      );

    case "growth": {
      const max = Math.max(...figure.rows.map((row) => row.to));
      return (
        <div className="space-y-6">
          {figure.rows.map((row, i) => (
            <div key={row.label}>
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="text-lg font-medium tabular-nums">
                  {row.from} <span className="text-muted-foreground">→</span>{" "}
                  {row.toLabel ?? row.to}
                </span>
              </div>
              <div className="space-y-1.5">
                <div
                  className="iv-grow h-2 rounded-r bg-foreground/30"
                  style={{ width: `${(row.from / max) * 100}%`, ...n(i * 2) }}
                />
                <div
                  className="iv-grow h-2 rounded-r bg-foreground"
                  style={{ width: `${(row.to / max) * 100}%`, ...n(i * 2 + 1) }}
                />
              </div>
            </div>
          ))}
          <p className="flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-r bg-foreground/30" /> Before
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-r bg-foreground" /> After
            </span>
          </p>
        </div>
      );
    }

    case "share": {
      const cells = 200;
      return (
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <div>
            <p className="text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
              <span className="mr-2 text-xl text-muted-foreground">about</span>
              {percent(figure.part, figure.whole)}%
            </p>
            <p className="mt-3 flex items-center gap-2.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-foreground" />
              {figure.partLabel}
            </p>
            <p className="mt-1 flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-foreground/20" />
              {figure.wholeLabel}
            </p>
          </div>
          <DotGrid
            cells={cells}
            columns={20}
            lit={Math.round((figure.part / figure.whole) * cells)}
          />
        </div>
      );
    }

    case "matrix": {
      const size = 5;
      const pitch = 6;
      return (
        <div>
          <svg
            viewBox={`0 0 ${figure.cols * pitch} ${figure.rows * pitch}`}
            className="h-auto w-full text-foreground"
            aria-hidden="true"
          >
            {Array.from({ length: figure.cols }, (_, c) => (
              <g key={c} className="iv" style={n(c, "7ms")}>
                {Array.from({ length: figure.rows }, (_, r) => (
                  <rect
                    key={r}
                    x={c * pitch}
                    y={r * pitch}
                    width={size}
                    height={size}
                    rx="1"
                    fill="currentColor"
                    opacity={0.55}
                  />
                ))}
              </g>
            ))}
          </svg>
          <p className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>↕ {figure.rowLabel}</span>
            <span>{figure.colLabel} ↔</span>
          </p>
        </div>
      );
    }

    case "dots":
      return <DotGrid cells={figure.count} columns={figure.columns} />;

    case "tiles":
      return (
        <ul className="grid grid-cols-5 gap-2">
          {Array.from({ length: figure.count }, (_, i) => {
            const name = figure.named[i];
            return (
              <li
                key={i}
                className={
                  name
                    ? "iv flex aspect-[3/2] items-center justify-center rounded-md border border-foreground/50 bg-foreground/5 text-xs sm:text-sm"
                    : "iv aspect-[3/2] rounded-md border border-dashed border-foreground/20"
                }
                style={n(i, "35ms")}
              >
                {name}
              </li>
            );
          })}
        </ul>
      );

    case "facts":
      return (
        <dl className="flex flex-wrap gap-x-12 gap-y-6">
          {figure.items.map((item, i) => (
            <div key={item.unit} className="iv flex flex-col-reverse gap-1" style={n(i, "140ms")}>
              <dt className="text-sm text-muted-foreground">{item.unit}</dt>
              <dd className="text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}
