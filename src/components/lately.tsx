"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * "Lately: …" in the hero. One item shows at a time, and three things follow
 * it together: the phrase in the text, the form the particle swarm takes
 * beside the headline, and the rail under the headline, which shows how long
 * the item has left and lets a visitor pick one themselves.
 *
 * The cycle runs by itself unless animations are paused or the visitor
 * prefers reduced motion. Picking an item by hand always works.
 */
export type LatelyItem = { label: string; shape: string };

type Lately = {
  index: number;
  shown: boolean;
  cycling: boolean;
  select: (index: number) => void;
};

const LatelyContext = createContext<Lately>({
  index: 0,
  shown: true,
  cycling: false,
  select: () => {},
});

/** How long each item stays, and how long the phrase takes to swap. */
const HOLD = 3600;
const SWAP = 350;

const reduce = "(prefers-reduced-motion: reduce)";
const watchReduce = (listener: () => void) => {
  const query = window.matchMedia(reduce);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

export function LatelyProvider({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const [state, setState] = useState({ index: 0, shown: true });
  const paused = useSyncExternalStore(
    motion.subscribe,
    motion.paused,
    motion.pausedOnServer,
  );
  const reduced = useSyncExternalStore(
    watchReduce,
    () => window.matchMedia(reduce).matches,
    () => false,
  );
  const cycling = !paused && !reduced;

  // One timer per item: starting it again whenever the item changes means a
  // hand-picked item gets its full time too.
  useEffect(() => {
    if (!cycling) return;
    let swap = 0;
    const hold = window.setTimeout(() => {
      setState((current) => ({ ...current, shown: false }));
      swap = window.setTimeout(() => {
        setState((current) => ({
          index: (current.index + 1) % count,
          shown: true,
        }));
      }, SWAP);
    }, HOLD);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(swap);
    };
  }, [cycling, count, state.index]);

  const select = useCallback(
    (index: number) => setState({ index, shown: true }),
    [],
  );
  const value = useMemo(
    () => ({ ...state, cycling, select }),
    [state, cycling, select],
  );

  return <LatelyContext.Provider value={value}>{children}</LatelyContext.Provider>;
}

/** The phrase, cross-fading to the next. */
export function LatelyWord({ items }: { items: readonly LatelyItem[] }) {
  const { index, shown } = useContext(LatelyContext);
  return (
    <span
      className="inline-block text-foreground transition-[opacity,transform] duration-300"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(6px)",
      }}
    >
      {items[index]?.label}
    </span>
  );
}

/**
 * The stage the swarm draws the current item on. Until the swarm is running
 * it holds a small seed, so the space reads as "something is starting here"
 * from the first paint instead of sitting empty.
 */
export function LatelyStage({
  items,
  className,
}: {
  items: readonly LatelyItem[];
  className?: string;
}) {
  const { index } = useContext(LatelyContext);
  const item = items[index];
  return (
    <div
      aria-hidden="true"
      data-shape={item?.shape}
      data-label={item ? `Lately: ${item.label}` : undefined}
      className={className}
    >
      <span className="swarm-seed">
        <span className="swarm-seed-dot" />
        <span className="swarm-seed-text">Starting the swarm</span>
      </span>
    </div>
  );
}

/**
 * The rail: one segment per item. The current one fills over the time the
 * item is held, and selecting any of them shows it (and has the swarm draw
 * it) straight away.
 */
export function LatelyRail({
  items,
  className,
  style,
}: {
  items: readonly LatelyItem[];
  className?: string;
  style?: CSSProperties;
}) {
  const { index, cycling, select } = useContext(LatelyContext);
  return (
    <div
      role="group"
      aria-label="Lately. Select one for the swarm to draw."
      className={cn("grid grid-cols-6 gap-1.5 sm:gap-3", className)}
      style={style}
    >
      {items.map((item, i) => {
        const current = i === index;
        return (
          <button
            key={item.label}
            type="button"
            aria-pressed={current}
            onClick={() => select(i)}
            className="group relative flex min-h-11 cursor-pointer flex-col pt-3 text-left"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-3 h-px bg-foreground/20 transition-colors group-hover:bg-foreground/45"
            />
            {current && (
              <span
                aria-hidden="true"
                key={`${index}-${cycling}`}
                className={cn(
                  "absolute inset-x-0 top-3 h-px origin-left bg-foreground",
                  cycling && "lately-run",
                )}
                style={{ animationDuration: `${HOLD + SWAP}ms` }}
              />
            )}
            <span
              className={cn(
                "mt-3 hidden text-sm leading-snug transition-colors md:block",
                current
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {item.label}
            </span>
            <span className="sr-only md:hidden">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
