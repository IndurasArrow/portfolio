"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { domains } from "@/content/profile";
import { projects, type DomainId } from "@/content/work";
import { cn } from "@/lib/utils";
import { GlowCard } from "./glow-card";
import { ProjectVisual } from "./project-visual";
import { useOpenProject } from "./viewer";

type Filter = DomainId | "all";

const filters: { id: Filter; label: string; count: number }[] = [
  { id: "all", label: "All", count: projects.length },
  ...domains
    .map((domain) => ({
      id: domain.id as Filter,
      label: domain.title,
      count: projects.filter((p) => p.domains.includes(domain.id)).length,
    }))
    .filter((filter) => filter.count > 0),
];

const titleOf = (id: DomainId) =>
  domains.find((domain) => domain.id === id)?.title ?? id;

export function WorkGrid() {
  const open = useOpenProject();
  const [filter, setFilter] = useState<Filter>("all");
  const list =
    filter === "all"
      ? projects
      : projects.filter((project) => project.domains.includes(filter));

  return (
    <div>
      <div
        role="group"
        aria-label="Filter work by domain"
        className="flex flex-wrap gap-2"
      >
        {filters.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn("gap-1.5", filter !== item.id && "bg-transparent")}
          >
            {item.label}
            <span className="tabular-nums opacity-50">{item.count}</span>
          </Button>
        ))}
      </div>

      <ul key={filter} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-6">
        {list.map((project, i) => {
          // On "All" the grid is editorial: one wide card, six halves, then
          // thirds. A filtered view is the original two-column grid.
          const wide = filter === "all" && i === 0;
          const third = filter === "all" && i > 6;
          const label = project.domains[0];
          return (
            <li
              key={project.id}
              className={cn(
                "fade-up",
                wide
                  ? "sm:col-span-6"
                  : third
                    ? "sm:col-span-3 lg:col-span-2"
                    : "sm:col-span-3",
              )}
              style={{ "--d": `${Math.min(i, 8) * 55}ms` } as CSSProperties}
            >
              <GlowCard
                tilt={wide ? 1.2 : 2.5}
                className={cn(
                  "group h-full cursor-pointer p-2 md:p-6",
                  wide && "lg:grid lg:grid-cols-2 lg:items-center lg:gap-10",
                )}
              >
                <button
                  type="button"
                  onClick={() => open(project.id)}
                  className="absolute inset-0 z-10 rounded-xl"
                  aria-label={`Open ${project.title}`}
                />
                <Card className="rounded-2xl p-1 shadow-none">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt=""
                        fill
                        placeholder="blur"
                        sizes="(min-width: 1024px) 400px, (min-width: 640px) 46vw, 92vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      project.visual && (
                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                          <ProjectVisual name={project.visual} />
                        </div>
                      )
                    )}
                    {label && (
                      <span className="absolute left-3 top-3 rounded-md border bg-background/70 px-2 py-1 text-xs backdrop-blur">
                        {titleOf(label)}
                      </span>
                    )}
                    {project.highlight && !wide && (
                      <span className="absolute bottom-3 left-3 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background">
                        {project.highlight}
                      </span>
                    )}
                  </div>
                </Card>

                {wide ? (
                  <div className="px-1.5 pb-2 pt-4 md:px-0 md:pb-0 md:pt-6 lg:pt-0">
                    <p className="text-sm text-muted-foreground">{project.period}</p>
                    <h3 className="mt-2 text-3xl font-light tracking-tight md:text-4xl">
                      {project.title}
                    </h3>
                    <p className="mt-3 max-w-md text-muted-foreground">{project.lead}</p>
                    <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6">
                      {project.metrics?.slice(0, 4).map((metric) => (
                        <div
                          key={metric.label}
                          className="flex flex-col-reverse justify-end gap-1.5"
                        >
                          <dt className="text-sm text-muted-foreground">
                            {metric.label}
                          </dt>
                          <dd className="text-3xl font-light tracking-tight sm:text-4xl">
                            {metric.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : (
                  <>
                    <h3 className="ml-1.5 mt-3 text-xl font-medium">
                      {project.title}
                    </h3>
                    <p className="ml-1.5 mt-1 text-sm text-muted-foreground">
                      {project.summary}
                    </p>
                  </>
                )}
              </GlowCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
