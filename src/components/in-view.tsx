"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Marks its subtree once it scrolls into view, so the graphics inside can
 * draw themselves in (see the `iv` classes in globals.css). Without
 * JavaScript the attribute is never set and everything is simply visible.
 */
export function InView({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"false" | "true" | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("true");
          observer.disconnect();
        } else {
          setState((current) => current ?? "false");
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-inview={state} className={className}>
      {children}
    </div>
  );
}
