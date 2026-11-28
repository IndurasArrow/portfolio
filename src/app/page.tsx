import {
  ArrowDownIcon,
  ArrowTopRightIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import type { CSSProperties, ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CountUp } from "@/components/count-up";
import { CoverageMatrix } from "@/components/coverage-matrix";
import { DomainExplorer } from "@/components/domain-explorer";
import { Education, Experience } from "@/components/experience";
import { StatGraphicView } from "@/components/figures";
import { HeroTitle } from "@/components/hero-title";
import {
  LatelyProvider,
  LatelyRail,
  LatelyStage,
  LatelyWord,
} from "@/components/lately";
import { LocalTime } from "@/components/local-time";
import { Pipeline } from "@/components/pipeline";
import { Timeline } from "@/components/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkGrid } from "@/components/work-grid";
import { domains, method, skills, timeline } from "@/content/profile";
import { about, hero, ledger, site } from "@/content/site";
import { cn } from "@/lib/utils";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * A page section in the original rhythm: a rule, a large light heading,
 * content. `shape` names the form the particle swarm takes beside the
 * heading on wide screens (see `src/lib/shapes.ts`).
 */
function Block({
  id,
  index,
  title,
  intro,
  shape,
  shapeLabel,
  children,
}: {
  id: string;
  index: string;
  title: string;
  intro?: string;
  shape?: string;
  shapeLabel?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex w-full flex-col items-center"
    >
      <div className="flex w-11/12 max-w-7xl py-2">
        <hr className="w-full bg-input" />
      </div>
      <div className="relative w-11/12 max-w-7xl flex-col pb-16 pt-12 md:pb-24">
        {shape && (
          <div
            aria-hidden="true"
            data-shape={shape}
            data-label={shapeLabel}
            className="pointer-events-none absolute right-0 top-2 hidden h-44 w-44 lg:block xl:right-36 xl:w-72"
          />
        )}
        <div className="reveal flex items-end justify-between gap-6">
          <h2
            id={`${id}-title`}
            className="min-w-0 text-5xl font-light tracking-tight"
          >
            {title}
          </h2>
          <span
            aria-hidden="true"
            className="outline-num shrink-0 text-6xl font-light leading-[0.8] tracking-tighter sm:text-7xl md:text-8xl"
          >
            {index}
          </span>
        </div>
        {intro && (
          <p className="reveal mt-5 max-w-2xl text-muted-foreground">{intro}</p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Marquee({
  items,
  reverse = false,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className: string;
}) {
  // The list is rendered twice so the loop has no seam.
  return (
    <div className="marquee-wrap">
      <div
        className="marquee"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className={`flex shrink-0 items-center ${className}`}
          >
            {items.map((item) => (
              <li key={item} className="flex items-center whitespace-nowrap">
                {item}
                <span aria-hidden="true" className="mx-[0.6em] opacity-40">
                  /
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const tools = [...new Set(domains.flatMap((domain) => domain.stack))];

  return (
    <main id="main" className="mt-20 flex w-full flex-col items-center">
      {/* ------------------------------------------------------------ Hero */}
      <LatelyProvider count={hero.rotating.length}>
        <section
          aria-labelledby="hero-title"
          className="flex min-h-[max(calc(100svh-5rem),30rem)] w-11/12 max-w-7xl flex-col pb-10 pt-2"
        >
          {/* Where the swarm gathers on arrival. It draws whatever "Lately"
              is naming below, and changes with it. The stage takes whatever
              room the text leaves, so the swarm is never behind the words. */}
          <div className="relative min-h-28 flex-1 sm:min-h-40">
            <LatelyStage
              items={hero.rotating}
              className="pointer-events-none absolute inset-y-0 left-1/2 aspect-square max-w-full -translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-0"
            />
          </div>
          <div
            className="fade-up mb-5 mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
            style={delay(500)}
          >
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-signal"
                />
                {hero.eyebrow}
              </span>
              <span aria-hidden="true" className="hidden opacity-40 sm:inline">
                /
              </span>
              <LocalTime
                zone={site.timezoneId}
                label={site.timezoneShort}
                place="Kanpur"
              />
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="tap gap-2">
                <a href="#work">
                  See the work
                  <ArrowDownIcon />
                </a>
              </Button>
              <Button asChild variant="outline" className="tap gap-2 bg-transparent">
                <a href={site.cv} download>
                  <DownloadIcon />
                  Download CV
                </a>
              </Button>
            </div>
          </div>
          <div className="hero-exit relative">
            <HeroTitle
              id="hero-title"
              lines={hero.headline}
              prefix={`${site.name},`}
            />
            <div
              className="fade-up mt-5 max-w-sm text-base text-muted-foreground lg:absolute lg:bottom-[calc(var(--hero)*0.17)] lg:left-[calc(var(--hero)*4.62)] lg:mt-0 lg:max-w-[21rem] lg:text-sm xl:max-w-[19rem]"
              style={delay(650)}
            >
              <p>{hero.body}</p>
              <p className="mt-3">
                Lately: <LatelyWord items={hero.rotating} />
              </p>
            </div>
          </div>
          {/* The same six items as a rail: how long the current one has
              left, and a way to pick one for the swarm to draw. */}
          <LatelyRail
            items={hero.rotating}
            className="fade-up mt-8"
            style={delay(800)}
          />
        </section>
      </LatelyProvider>

      {/* --------------------------------------------------------- Numbers */}
      <section
        aria-label="In numbers"
        className="flex w-full flex-col items-center"
      >
        <div className="flex w-11/12 max-w-7xl py-2">
          <hr className="w-full bg-input" />
        </div>
        {/* Each figure is drawn by the swarm in the space beside its caption.
            The figure is in the markup too: it is what a screen reader reads
            and what shows where the swarm cannot run. */}
        <dl className="w-11/12 max-w-7xl py-6 md:py-10">
          {ledger.map((metric, i) => {
            const figure = `${metric.value}${metric.unit ?? ""}`;
            return (
              <div
                key={metric.label}
                className="flex flex-col gap-y-4 py-10 md:py-16 lg:grid lg:min-h-[78svh] lg:grid-cols-12 lg:grid-rows-[1fr_auto_auto_1fr] lg:items-center lg:gap-x-12"
              >
                <dt
                  className={cn(
                    "reveal order-2 text-2xl font-light leading-snug tracking-tight md:text-3xl lg:order-none lg:col-span-4 lg:row-start-2",
                    i % 2 === 1 ? "lg:col-start-1" : "lg:col-start-9",
                  )}
                >
                  {metric.label}
                </dt>
                <dd
                  data-shape={`text:${figure}`}
                  data-label={metric.label}
                  className={cn(
                    "order-1 flex aspect-[2/1] w-full items-center justify-center lg:order-none lg:col-span-8 lg:row-span-full lg:row-start-1",
                    i % 2 === 1 ? "lg:col-start-5" : "lg:col-start-1",
                  )}
                >
                  <span className="stage-fallback text-7xl font-light tracking-tighter sm:text-8xl lg:text-[11rem]">
                    {figure}
                  </span>
                </dd>
                <dd
                  className={cn(
                    "reveal order-3 lg:order-none lg:col-span-4 lg:row-start-3",
                    i % 2 === 1 ? "lg:col-start-1" : "lg:col-start-9",
                  )}
                >
                  {metric.graphic && <StatGraphicView graphic={metric.graphic} />}
                  <p className="mt-4 max-w-[19rem] text-sm text-muted-foreground">
                    {metric.detail}
                  </p>
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      {/* ------------------------------------------------------------ Work */}
      <Block
        id="work"
        index="01"
        title="Work"
        shape="stack"
        shapeLabel="Work"
        intro="Client work, internal platforms, personal projects and the design studies I started with. Filter by domain; open any card for the full story."
      >
        <WorkGrid />
      </Block>

      {/* ---------------------------------------------------------- Domains */}
      <div className="w-full overflow-x-clip py-10 md:py-16" aria-hidden="true">
        <Marquee
          items={domains.map((domain) => domain.title)}
          className="text-7xl font-light tracking-tight text-foreground/50 md:text-9xl"
        />
      </div>

      <Block
        id="domains"
        index="02"
        title="Domains"
        intro="I work across several kinds of AI and the engineering around them. Pick one to see what I have built in it."
      >
        <DomainExplorer />

        <h3 className="reveal mt-24 text-3xl font-light tracking-tight">
          Coverage
        </h3>
        <p className="reveal mt-3 max-w-2xl text-muted-foreground">
          Every project against every domain. Most of them sit in more than
          one.
        </p>
        <div className="mt-8">
          <CoverageMatrix />
        </div>

        <h3 className="reveal mt-24 text-3xl font-light tracking-tight">
          The full stack
        </h3>
        <Tabs defaultValue={skills[0]?.group} className="reveal mt-6">
          <TabsList className="h-auto flex-wrap justify-start gap-1">
            {skills.map((skill) => (
              <TabsTrigger key={skill.group} value={skill.group} className="tap">
                {skill.group}
              </TabsTrigger>
            ))}
          </TabsList>
          {skills.map((skill) => (
            <TabsContent key={skill.group} value={skill.group} className="mt-5">
              <ul className="fade-up flex flex-wrap gap-2">
                {skill.items.map((item) => (
                  <li key={item}>
                    <Badge
                      variant="outline"
                      className="px-3 py-1.5 text-sm font-normal"
                    >
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </Block>

      {/* ---------------------------------------------------------- Method */}
      <Block
        id="method"
        index="03"
        title="Method"
        intro={method.intro}
        shape="pipeline"
        shapeLabel="Spec, plan, task loop, review, merge"
      >
        <div className="reveal">
          <Pipeline />
        </div>
        <dl className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-3">
          {method.facts.map((fact) => (
            <div
              key={fact.label}
              className="reveal flex flex-col-reverse justify-end gap-3"
            >
              <dt className="max-w-xs text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="text-6xl font-light tracking-tight md:text-7xl">
                <CountUp value={fact.value} />
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      {/* ----------------------------------------------------------- About */}
      <Block
        id="about"
        index="04"
        title="About"
        shape="strands"
        shapeLabel={`${timeline.year} workstreams`}
      >
        <p className="max-w-4xl text-2xl font-light leading-snug tracking-tight md:text-4xl md:leading-[1.2]">
          {about.split(" ").map((word, i) => (
            <span key={i} className="word">
              {word}{" "}
            </span>
          ))}
        </p>

        <h3 className="reveal mt-24 text-3xl font-light tracking-tight">
          {timeline.year}, in parallel
        </h3>
        <p className="reveal mt-3 max-w-2xl text-muted-foreground">
          {timeline.rows.length} workstreams with month-level dates, and{" "}
          {timeline.undated.length} more dated to the year. Select one to open
          it.
        </p>
        <div className="mt-8">
          <Timeline />
        </div>

        <div className="mt-20 grid gap-x-10 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h3 className="reveal text-3xl font-light tracking-tight">
              Experience
            </h3>
            <Experience />
          </div>

          <div className="lg:col-span-4">
            <h3 className="reveal text-3xl font-light tracking-tight">
              Education
            </h3>
            <Education />
          </div>
        </div>
      </Block>

      {/* --------------------------------------------------------- Contact */}
      <div className="w-full overflow-x-clip pb-4 pt-10" aria-hidden="true">
        <Marquee
          items={tools}
          reverse
          className="text-2xl font-light text-foreground/50 md:text-3xl"
        />
      </div>

      <Block
        id="contact"
        index="05"
        title="Contact"
        shape="globe"
        shapeLabel="Kanpur, 26.45°N 80.33°E"
      >
        <p className="reveal text-muted-foreground">Email</p>
        <a
          href={`mailto:${site.email}`}
          className="reveal group mt-2 inline-block max-w-full py-1 text-[clamp(1.1rem,5.6vw,5rem)] font-light leading-tight tracking-tight"
        >
          <span className="bg-gradient-to-r from-foreground to-foreground bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px]">
            {site.email}
          </span>
        </a>

        <div className="reveal mt-8 flex flex-wrap gap-3">
          <CopyEmail email={site.email} />
          <Button asChild variant="outline" className="tap gap-2 bg-transparent">
            <a href={site.linkedin} target="_blank" rel="noreferrer me">
              LinkedIn
              <ArrowTopRightIcon />
            </a>
          </Button>
          <Button asChild variant="outline" className="tap gap-2 bg-transparent">
            <a href={site.cv} download>
              <DownloadIcon />
              Download CV
            </a>
          </Button>
        </div>

        <dl className="reveal mt-16 grid gap-x-10 gap-y-6 border-t pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">Role</dt>
            <dd className="mt-1">
              {site.role}, {site.employer}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Based in</dt>
            <dd className="mt-1">{site.location}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Time zone</dt>
            <dd className="mt-1">{site.timezone}</dd>
          </div>
        </dl>
      </Block>

      <footer className="flex w-11/12 max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t py-6 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <a href="#top" className="py-2 transition-colors hover:text-foreground">
          Back to top
        </a>
      </footer>
    </main>
  );
}
