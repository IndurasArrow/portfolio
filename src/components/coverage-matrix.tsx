"use client";

import type { CSSProperties } from "react";
import { domains } from "@/content/profile";
import { projects } from "@/content/work";
import { InView } from "./in-view";
import { useOpenProject } from "./viewer";

/** Every project against every domain: one dot where they meet. */
export function CoverageMatrix() {
  const open = useOpenProject();

  return (
    <InView>
      <table className="w-full table-fixed border-collapse text-sm">
        <caption className="sr-only">
          Which domains each project falls in
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-[42%] pb-3 text-left align-bottom font-normal text-muted-foreground">
              Project
            </th>
            {domains.map((domain) => (
              <th key={domain.id} scope="col" className="h-36 pb-3 align-bottom font-normal">
                <span className="mx-auto block rotate-180 whitespace-nowrap text-muted-foreground [writing-mode:vertical-rl]">
                  {domain.title}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((project, r) => (
            <tr
              key={project.id}
              className="group border-t transition-colors hover:bg-foreground/[0.04]"
            >
              <th scope="row" className="py-0 pr-3 text-left font-normal">
                <button
                  type="button"
                  onClick={() => open(project.id)}
                  className="tap block w-full cursor-pointer py-2.5 text-left leading-snug text-muted-foreground transition-colors group-hover:text-foreground"
                >
                  {project.title}
                </button>
              </th>
              {domains.map((domain) => {
                const on = project.domains.includes(domain.id);
                return (
                  <td key={domain.id} className="text-center">
                    <span className="sr-only">{on ? "Yes" : "No"}</span>
                    <span
                      aria-hidden="true"
                      className={
                        on
                          ? "iv mx-auto block h-2.5 w-2.5 rounded-full bg-foreground transition-transform group-hover:scale-150"
                          : "mx-auto block h-1 w-1 rounded-full bg-foreground/15"
                      }
                      style={{ "--n": r, "--step": "50ms" } as CSSProperties}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t">
            <th scope="row" className="py-3 text-left font-normal text-muted-foreground">
              Projects
            </th>
            {domains.map((domain) => (
              <td key={domain.id} className="py-3 text-center text-lg font-light">
                {projects.filter((p) => p.domains.includes(domain.id)).length}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </InView>
  );
}
