"use client";

import type { CSSProperties } from "react";
import { timeline } from "@/content/profile";
import { projects } from "@/content/work";
import { cn } from "@/lib/utils";
import { InView } from "./in-view";
import { useOpenProject } from "./viewer";

const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const titleOf = (id: string) =>
  projects.find((project) => project.id === id)?.title ?? id;
const periodOf = (id: string) =>
  projects.find((project) => project.id === id)?.period ?? "";

function Track({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-7">
      <div className="absolute inset-0 grid grid-cols-12" aria-hidden="true">
        {months.map((_, i) => (
          <span key={i} className="border-l border-foreground/10" />
        ))}
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 w-px bg-foreground/40"
        style={{ left: `${(timeline.now / 12) * 100}%` }}
      />
      {children}
    </div>
  );
}

/** The year as a Gantt chart: which projects ran when, and how many at once. */
export function Timeline() {
  const open = useOpenProject();
  const row =
    "grid items-center gap-x-6 gap-y-1 border-t py-2 md:grid-cols-[16rem_1fr]";
  const name =
    "flex items-baseline justify-between gap-3 text-left transition-colors hover:text-foreground md:block";

  return (
    <InView>
      <div className="hidden gap-x-6 pb-2 text-xs text-muted-foreground md:grid md:grid-cols-[16rem_1fr]">
        <span>{timeline.year}</span>
        <div className="grid grid-cols-12" aria-hidden="true">
          {months.map((month, i) => (
            <span
              key={i}
              className={cn(
                "pl-1.5",
                i + 1 === timeline.now && "font-medium text-foreground",
              )}
            >
              {month}
            </span>
          ))}
        </div>
      </div>

      <ol>
        {timeline.rows.map((item, i) => {
          const end = item.end ?? timeline.now;
          const style = {
            left: `${((item.start - 1) / 12) * 100}%`,
            width: `${((end - item.start + 1) / 12) * 100}%`,
            "--n": i,
            "--step": "90ms",
          } as CSSProperties;
          return (
            <li key={item.id} className={row}>
              <button type="button" onClick={() => open(item.id)} className={name}>
                <span>{titleOf(item.id)}</span>
                <span className="shrink-0 text-xs text-muted-foreground md:block">
                  {periodOf(item.id)}
                </span>
              </button>
              <Track>
                <span
                  className={cn(
                    "iv-grow absolute top-1/2 h-2 -translate-y-1/2 rounded-full",
                    item.personal ? "bg-foreground/35" : "bg-foreground",
                    item.end === null && "rounded-r-none",
                  )}
                  style={style}
                />
                {item.end === null && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-foreground ring-4 ring-foreground/15"
                    style={{ left: `${(timeline.now / 12) * 100}%` }}
                  />
                )}
              </Track>
            </li>
          );
        })}

        {timeline.undated.map((id, i) => (
          <li key={id} className={row}>
            <button type="button" onClick={() => open(id)} className={name}>
              <span>{titleOf(id)}</span>
              <span className="shrink-0 text-xs text-muted-foreground md:block">
                {periodOf(id)}
              </span>
            </button>
            <Track>
              <span
                className="iv absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full border border-dashed border-foreground/40"
                style={
                  {
                    // The month is not known, so the bar spans the year so far.
                    width: `${(timeline.now / 12) * 100}%`,
                    "--n": timeline.rows.length + i,
                    "--step": "90ms",
                  } as CSSProperties
                }
              />
            </Track>
          </li>
        ))}
      </ol>

      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-full bg-foreground" /> Client and internal work
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-full bg-foreground/35" /> Personal project
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-full border border-dashed border-foreground/40" />
          Dated to the year only
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-px bg-foreground/60" /> Now
        </li>
      </ul>
    </InView>
  );
}
