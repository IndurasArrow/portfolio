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
import { flushSync } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { domains } from "@/content/profile";
import { projects, type Latency, type Project } from "@/content/work";
import { cn } from "@/lib/utils";
import { FigureView } from "./figures";
import { GlowCard } from "./glow-card";
import { ProjectVisual } from "./project-visual";
import { Tablet } from "./tablet";

const ViewerContext = createContext<(id: string) => void>(() => {});

/** Opens a project in the full-screen viewer. */
export const useOpenProject = () => useContext(ViewerContext);

const domainTitle = (id: string) =>
  domains.find((domain) => domain.id === id)?.title ?? id;

/** A project's visual on its card in the work grid, if it is on screen. */
function cardVisual(id: string | null) {
  if (!id) return null;
  const card = document.querySelector<HTMLElement>(
    `[data-project-visual="${id}"]`,
  );
  if (!card) return null;
  const rect = card.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight ? card : null;
}

/**
 * Opens or closes the viewer as a view transition, where the browser has
 * them: the project's visual on its card and the visual in the viewer are
 * treated as one element, so it grows out of the card and shrinks back into
 * it. Elsewhere, and with reduced motion, the change is simply made.
 */
function transition(id: string | null, opening: boolean, change: () => void) {
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    change();
    return;
  }
  // Only one element may carry the name at a time: the card before opening
  // and after closing, the viewer's own visual (in CSS) while it is open.
  const card = cardVisual(id);
  if (card && opening) card.style.viewTransitionName = "project-visual";
  const running = document.startViewTransition(() => {
    flushSync(change);
    if (card) card.style.viewTransitionName = opening ? "" : "project-visual";
  });
  running.finished.finally(() => {
    if (card) card.style.viewTransitionName = "";
  });
}

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((next: string) => {
    opener.current = document.activeElement as HTMLElement | null;
    transition(next, true, () => setId(next));
  }, []);

  const close = useCallback(() => {
    transition(id, false, () => setId(null));
    opener.current?.focus({ preventScroll: true });
  }, [id]);

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
    // Tells the particle swarm it is covered, so it stops drawing.
    document.documentElement.dataset.viewer = "open";

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
      delete document.documentElement.dataset.viewer;
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
      data-lenis-prevent
      className="viewer fixed left-0 top-0 z-40 h-full w-full bg-background"
    >
      <div className="mt-20 flex h-[calc(100dvh-5rem)] w-full flex-col">
        <div
          className={cn(
            "mx-auto mb-2 flex w-full flex-wrap items-end justify-between gap-x-4 gap-y-3 px-4 pt-3",
            // A design study is laid out wider than a written case study.
            project.embed ? "max-w-7xl" : "max-w-3xl",
          )}
        >
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(projects.length).padStart(2, "0")}
              <span className="mx-2">·</span>
              {project.domains.map(domainTitle).join(", ")}
            </p>
            <h2 id="viewer-title" className="text-2xl font-bold">
              {project.title}
            </h2>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="tap"
              aria-label="Previous project"
              onClick={() => onStep(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="tap"
              aria-label="Next project"
              onClick={() => onStep(1)}
            >
              <ChevronRightIcon />
            </Button>
            <Button
              ref={closeRef}
              variant="outline"
              className="tap"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>

        {/* The scrolling area can be focused, so it scrolls from the keyboard. */}
        {project.embed ? (
          <div
            key={project.id}
            tabIndex={0}
            role="region"
            aria-label={`${project.title}: design study`}
            className="flex-1 overflow-y-auto lg:overflow-hidden"
          >
            <Study project={project} embed={project.embed} />
          </div>
        ) : (
          <div
            key={project.id}
            tabIndex={0}
            role="region"
            aria-label={`${project.title}: case study`}
            className="flex-1 overflow-y-auto"
          >
            <Detail project={project} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A design study: what it is on the left (the cover on a tablet, the brief,
 * what the document shows), and the document itself to read on the right.
 */
function Study({ project, embed }: { project: Project; embed: string }) {
  const study = project.study;
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-6 pt-2 lg:h-full lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-8">
      <div className="fade-up lg:overflow-y-auto lg:pb-2 lg:pr-2">
        <GlowCard tilt={2.5} className="p-1">
          <div className="viewer-visual visual relative aspect-video w-full overflow-hidden rounded-lg">
            {project.image && <Tablet image={project.image} />}
          </div>
        </GlowCard>

        {study && (
          <>
            <p className="mt-6 text-2xl font-light leading-snug tracking-tight">
              {study.tagline}
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {study.brief}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Focus">
              {study.focus.map((item) => (
                <li key={item}>
                  <Badge variant="outline" className="px-2.5 py-1 font-normal">
                    {item}
                  </Badge>
                </li>
              ))}
            </ul>

            {study.screens && (
              <>
                <h3 className="mt-8 text-sm text-muted-foreground">
                  In the document, in order
                </h3>
                <ol className="mt-2 border-t">
                  {study.screens.map((screen, i) => (
                    <li key={screen} className="flex gap-4 border-b py-2.5">
                      <span className="w-4 shrink-0 text-sm tabular-nums leading-6 text-muted-foreground">
                        {i + 1}
                      </span>
                      <span>{screen}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-5">
              <div>
                <dt className="text-sm text-muted-foreground">Kind</dt>
                <dd className="mt-1">Product-design study</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">From</dt>
                <dd className="mt-1">B.Des, UX and UI</dd>
              </div>
            </dl>

            <Button asChild variant="outline" className="tap mt-6 gap-2">
              <a href={study.link} target="_blank" rel="noreferrer">
                Open the document on its own
                <ArrowTopRightIcon />
              </a>
            </Button>
          </>
        )}
      </div>

      <div className="relative min-h-[78svh] overflow-hidden rounded-2xl border bg-card lg:min-h-0">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <UpdateIcon className="h-6 w-6 animate-spin" />
          <span className="text-sm font-light text-muted-foreground">
            Loading the document
          </span>
        </div>
        <iframe
          key={project.id}
          title={`${project.title}, design study document`}
          src={embed}
          className="absolute inset-0 h-full w-full bg-background"
        />
      </div>
    </div>
  );
}

function Detail({ project }: { project: Project }) {
  return (
    <article className="fade-up mx-auto w-full max-w-3xl px-4 pb-24 pt-4">
      {project.visual && (
        <Card className="rounded-2xl p-1 shadow-none">
          <div className="viewer-visual relative aspect-video w-full overflow-hidden rounded-xl">
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
