"use client";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { domains, education, roles, timeline, type Role } from "@/content/profile";
import { projects } from "@/content/work";
import { cn } from "@/lib/utils";
import { GlowCard } from "./glow-card";
import { useOpenProject } from "./viewer";

/** The month the site was last updated, as "YYYY-MM": where "present" ends. */
const today = `${timeline.year}-${String(timeline.now).padStart(2, "0")}`;

/** Whole months from one "YYYY-MM" to another. */
function monthsBetween(from: string, to: string) {
  const [fromYear = 0, fromMonth = 0] = from.split("-").map(Number);
  const [toYear = 0, toMonth = 0] = to.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

function length(role: Role) {
  const months = monthsBetween(role.start, role.end ?? today);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${months} months`;
  return `${years} yr${rest ? ` ${rest} mo` : ""}`;
}

/**
 * Experience as a line through time: one card per role on a spine, the
 * current one marked live. A role that has projects on this page lists them
 * as workstreams, and each opens its case study.
 */
export function Experience() {
  const open = useOpenProject();

  return (
    <ol className="relative mt-6 space-y-4 before:absolute before:bottom-6 before:left-[0.3125rem] before:top-6 before:w-px before:bg-foreground/15">
      {roles.map((role) => {
        const streams = (role.projects ?? [])
          .map((id) => projects.find((project) => project.id === id))
          .filter((project) => project !== undefined);
        const covered = new Set(streams.flatMap((project) => project.domains));

        return (
          <li key={role.company} className="rise relative pl-7 sm:pl-9">
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 top-7 h-[0.6875rem] w-[0.6875rem] rounded-full border",
                role.current
                  ? "border-signal bg-signal shadow-[0_0_0_4px_hsl(var(--signal)/0.18)]"
                  : "border-foreground/40 bg-background",
              )}
            />
            <GlowCard tilt={0} className="p-5 md:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h4 className="text-xl font-medium md:text-2xl">{role.title}</h4>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  {role.current && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal"
                    />
                  )}
                  {role.period}
                </p>
              </div>
              <p className="mt-1 text-muted-foreground">
                {role.company}, {role.place}
                <span aria-hidden="true" className="mx-2 opacity-50">
                  /
                </span>
                {length(role)}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus">
                {role.focus.map((item) => (
                  <li key={item}>
                    <Badge variant="outline" className="px-2.5 py-1 font-normal">
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>

              <ul className="mt-5 space-y-2">
                {role.points.map((point) => (
                  <li key={point} className="leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>

              {streams.length > 0 && (
                <>
                  <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-6 sm:grid-cols-3">
                    <div className="flex flex-col-reverse justify-end gap-1">
                      <dt className="text-sm text-muted-foreground">
                        Workstreams, client and internal
                      </dt>
                      <dd className="text-4xl font-light tracking-tight md:text-5xl">
                        {streams.length}
                      </dd>
                    </div>
                    <div className="flex flex-col-reverse justify-end gap-1">
                      <dt className="text-sm text-muted-foreground">
                        Of {domains.length} domains worked in
                      </dt>
                      <dd className="text-4xl font-light tracking-tight md:text-5xl">
                        {covered.size}
                      </dd>
                    </div>
                    <div className="col-span-2 flex flex-col-reverse justify-end gap-1 sm:col-span-1">
                      <dt className="text-sm text-muted-foreground">In the role</dt>
                      <dd className="text-4xl font-light tracking-tight md:text-5xl">
                        {length(role)}
                      </dd>
                    </div>
                  </dl>

                  <h5 className="mt-7 text-sm text-muted-foreground">
                    Workstreams. Select one to open its case study.
                  </h5>
                  <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
                    {streams.map((project) => (
                      <li key={project.id} className="border-b">
                        <button
                          type="button"
                          onClick={() => open(project.id)}
                          className="group/item flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left"
                        >
                          <span className="min-w-0">
                            <span className="block">{project.title}</span>
                            <span className="block text-sm text-muted-foreground">
                              {project.highlight ?? project.period}
                            </span>
                          </span>
                          <ArrowRightIcon className="shrink-0 -translate-x-1 opacity-40 transition-[opacity,transform] duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </GlowCard>
          </li>
        );
      })}
    </ol>
  );
}

/** Education: one card each, with the figure that goes with it set large. */
export function Education() {
  return (
    <ul className="mt-6 space-y-4">
      {education.map((item) => (
        <li key={item.title} className="rise">
          <GlowCard tilt={0} className="p-5 md:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h4 className="text-xl font-medium">{item.title}</h4>
              {item.year && (
                <span className="text-sm text-muted-foreground">{item.year}</span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">{item.school}</p>
            <dl className="mt-6 flex flex-col-reverse gap-1 border-t pt-5">
              <dt className="text-sm text-muted-foreground">{item.figure.label}</dt>
              <dd className="text-4xl font-light tracking-tight md:text-5xl">
                {item.figure.value}
              </dd>
            </dl>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Focus">
              {item.focus.map((entry) => (
                <li key={entry}>
                  <Badge variant="outline" className="px-2.5 py-1 font-normal">
                    {entry}
                  </Badge>
                </li>
              ))}
            </ul>
          </GlowCard>
        </li>
      ))}
    </ul>
  );
}
