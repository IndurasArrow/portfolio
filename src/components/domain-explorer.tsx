"use client";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { domains } from "@/content/profile";
import { projects } from "@/content/work";
import { cn } from "@/lib/utils";
import { GlowCard } from "./glow-card";
import { useOpenProject } from "./viewer";

/**
 * The domains as a list in the page's large light type. Pointing at or
 * selecting one fills the panel with what it covers, the projects in it and
 * the tools behind it, and has the particle swarm draw it above the panel.
 */
export function DomainExplorer() {
  const open = useOpenProject();
  const [active, setActive] = useState(domains[0]?.id);
  const index = Math.max(
    0,
    domains.findIndex((domain) => domain.id === active),
  );
  const domain = domains[index];
  if (!domain) return null;
  const related = projects.filter((project) =>
    project.domains.includes(domain.id),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div
        role="tablist"
        aria-label="Domains"
        aria-orientation="vertical"
        className="flex flex-col lg:col-span-7"
      >
        {domains.map((item, i) => {
          const selected = item.id === domain.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`domain-tab-${item.id}`}
              aria-selected={selected}
              aria-controls="domain-panel"
              tabIndex={selected ? 0 : -1}
              onMouseEnter={() => setActive(item.id)}
              onFocus={() => setActive(item.id)}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => {
                // Arrow keys move through the list, as a tab list should.
                const step =
                  event.key === "ArrowDown"
                    ? 1
                    : event.key === "ArrowUp"
                      ? -1
                      : event.key === "Home"
                        ? -i
                        : event.key === "End"
                          ? domains.length - 1 - i
                          : 0;
                if (step === 0) return;
                event.preventDefault();
                const next = domains[(i + step + domains.length) % domains.length];
                if (next) document.getElementById(`domain-tab-${next.id}`)?.focus();
              }}
              className={cn(
                "group flex cursor-pointer items-baseline gap-3 py-1.5 text-left text-3xl font-light tracking-tight transition-[color,transform] duration-300 ease-out sm:gap-4 sm:text-4xl md:text-5xl md:leading-[1.15]",
                selected
                  ? "text-foreground sm:translate-x-2"
                  : "text-foreground/50 hover:text-foreground/75",
              )}
            >
              <span className="w-6 shrink-0 text-sm tracking-normal text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="self-start lg:sticky lg:top-24 lg:col-span-5">
        {/* The swarm draws the selected domain here. */}
        <div
          aria-hidden="true"
          data-shape={domain.id}
          data-label={domain.title}
          className="pointer-events-none aspect-[2/1] w-full"
        />
        <GlowCard
          tilt={0}
          role="tabpanel"
          id="domain-panel"
          aria-labelledby={`domain-tab-${domain.id}`}
          className="mt-4 p-6 md:p-8"
        >
          <div key={domain.id} className="fade-up">
            <p className="text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(domains.length).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-2xl font-medium">{domain.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{domain.text}</p>

            <p className="mt-7 text-sm text-muted-foreground">Projects</p>
            {related.length > 0 ? (
              <ul className="mt-2 flex flex-col">
                {related.map((project) => (
                  <li key={project.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={() => open(project.id)}
                      className="group/item flex w-full cursor-pointer items-center justify-between gap-4 py-2.5 text-left transition-colors hover:text-foreground"
                    >
                      <span>{project.title}</span>
                      <ArrowRightIcon className="shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">In progress. Nothing shipped yet.</p>
            )}

            <p className="mt-7 text-sm text-muted-foreground">Tools</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {domain.stack.map((item) => (
                <li key={item}>
                  <Badge variant="outline" className="px-2.5 py-1 font-normal">
                    {item}
                  </Badge>
                </li>
              ))}
            </ul>

            {related.length > 0 && (
              <Button asChild variant="link" className="tap mt-4 h-auto px-0 py-2">
                <a href="#work">See them in the work grid</a>
              </Button>
            )}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
