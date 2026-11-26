"use client";

import {
  ArrowTopRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { domains } from "@/content/profile";
import { projects, type Latency, type Project } from "@/content/work";
import { FigureView } from "./figures";
import { ProjectVisual } from "./project-visual";

const ViewerContext = createContext<(id: string) => void>(() => {});

/** Opens a project in the full-screen viewer. */
export const useOpenProject = () => useContext(ViewerContext);

const domainTitle = (id: string) =>
  domains.find((domain) => domain.id === id)?.title ?? id;

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((next: string) => {
    opener.current = document.activeElement as HTMLElement | null;
    setId(next);
  }, []);

  const close = useCallback(() => {
    setId(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  const step = useCallback((by: number) => {
    setId((current) => {
      const index = projects.findIndex((project) => project.id === current);
      if (index < 0) return current;
      const next = projects[(index + by + projects.length) % projects.length];
      return next?.id ?? current;
    });
  }, []);

  const isOpen = id !== null;

  useEffect(() => {
    if (!isOpen) return;
    const main = document.getElementById("main");
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    // Following a navbar link while the viewer is open closes it.
    const onHash = () => close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
  }, [isOpen, close, step]);

  const project = projects.find((item) => item.id === id);

  return (
    <ViewerContext.Provider value={open}>
      {children}
      {project && (
        <Viewer project={project} onClose={close} onStep={step} />
      )}
    </ViewerContext.Provider>
  );
}

function Viewer({
  project,
  onClose,
  onStep,
}: {
  project: Project;
  onClose: () => void;
  onStep: (by: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const index = projects.findIndex((item) => item.id === project.id);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
      className="viewer fixed left-0 top-0 z-40 h-full w-full bg-background"
    >
      <div className="mt-20 flex h-[calc(100dvh-5rem)] w-full flex-col">
        <div className="mx-auto mb-2 flex w-full max-w-3xl flex-wrap items-end justify-between gap-x-4 gap-y-3 px-4 pt-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(projects.length).padStart(2, "0")}
              <span className="mx-2">·</span>
              {project.domains.map(domainTitle).join(", ")}
            </p>
            <h4 id="viewer-title" className="text-2xl font-bold">
              {project.title}
            </h4>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous project"
              onClick={() => onStep(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next project"
              onClick={() => onStep(1)}
            >
              <ChevronRightIcon />
            </Button>
            <Button ref={closeRef} variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {project.embed ? (
          <div className="relative mt-2 flex-1">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <UpdateIcon className="h-6 w-6 animate-spin" />
              <span className="text-sm font-light text-muted-foreground">Loading</span>
            </div>
            <iframe
              key={project.id}
              title={`${project.title}, design case study`}
              src={project.embed}
              className="absolute inset-0 h-full w-full bg-background"
            />
          </div>
        ) : (
          <div key={project.id} className="flex-1 overflow-y-auto">
            <Detail project={project} />
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ project }: { project: Project }) {
  return (
    <article className="fade-up mx-auto w-full max-w-3xl px-4 pb-24 pt-4">
      {project.visual && (
        <Card className="rounded-2xl p-1 shadow-none">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <ProjectVisual name={project.visual} />
          </div>
        </Card>
      )}

      <p className="mt-6 text-sm text-muted-foreground">{project.period}</p>
      {project.lead && (
        <p className="mt-2 text-xl font-light leading-relaxed md:text-2xl md:leading-relaxed">
          {project.lead}
        </p>
      )}

      {project.metrics && (
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col-reverse justify-end gap-2">
              <dt className="text-sm text-muted-foreground">{metric.label}</dt>
              <dd className="text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
                {metric.value}
                {metric.unit && (
                  <span className="ml-1.5 text-xl text-muted-foreground">
                    {metric.unit}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {project.latency && <LatencyBars latency={project.latency} />}

      {project.figures?.map((figure) => (
        <FigureView key={figure.title} figure={figure} />
      ))}

      {project.points && (
        <dl className="mt-10 border-t">
          {project.points.map((point) => (
            <div
              key={point.tag}
              className="grid gap-x-6 gap-y-1 border-b py-4 sm:grid-cols-[7.5rem_1fr]"
            >
              <dt className="text-sm text-muted-foreground">{point.tag}</dt>
              <dd className="leading-relaxed">{point.text}</dd>
            </div>
          ))}
        </dl>
      )}

      {project.stack && (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Stack">
          {project.stack.map((item) => (
            <li key={item}>
              <Badge variant="outline" className="px-3 py-1 text-sm font-normal">
                {item}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      {project.link && (
        <Button asChild variant="outline" className="mt-8 gap-2">
          <a href={project.link.href} target="_blank" rel="noreferrer">
            {project.link.label}
            <ArrowTopRightIcon />
          </a>
        </Button>
      )}
    </article>
  );
}

/** Before and after on one axis, in seconds. */
function LatencyBars({ latency }: { latency: Latency }) {
  const { before, after, max } = latency;
  const at = (value: number) => `${(value / max) * 100}%`;
  const summary =
    `${latency.title}. Before: ${before.low} to ${before.high} seconds. ` +
    `After: median ${after.median} seconds, 90th percentile ${after.p90} seconds.`;

  return (
    <figure className="mt-10 rounded-xl border p-5 md:p-6">
      <figcaption className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="font-medium">{latency.title}</span>
        <span className="text-sm text-muted-foreground">Seconds, lower is better</span>
      </figcaption>
      <div role="img" aria-label={summary} className="space-y-5">
        <div>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Before</span>
            <span className="text-lg font-medium tabular-nums">
              {before.low}–{before.high} s
            </span>
          </div>
          <div className="relative h-3">
            <span
              className="absolute inset-y-0 left-0 rounded-r bg-foreground/15"
              style={{ width: at(before.high) }}
            />
            <span
              className="absolute inset-y-0 left-0 rounded-r bg-foreground/35"
              style={{ width: at(before.low) }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{before.note}</p>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">After</span>
            <span className="text-lg font-medium tabular-nums">
              {after.median} s
            </span>
          </div>
          <div className="relative h-3">
            <span
              className="absolute inset-y-0 left-0 rounded-r bg-foreground"
              style={{ width: at(after.median) }}
            />
            <span
              className="absolute -inset-y-1 w-px bg-foreground"
              style={{ left: at(after.p90) }}
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 pl-2 text-xs text-muted-foreground"
              style={{ left: at(after.p90) }}
            >
              p90 {after.p90} s
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{after.note}</p>
        </div>
      </div>
    </figure>
  );
}
