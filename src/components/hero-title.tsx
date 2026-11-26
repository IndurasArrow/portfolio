"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * The headline. Each line slides up on load; on a device with a mouse the
 * letters thicken as the pointer comes near, using Inter's weight axis.
 */
export function HeroTitle({
  id,
  lines,
  prefix,
}: {
  id: string;
  lines: string[];
  /** Read out before the headline, not shown. */
  prefix: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = [...el.querySelectorAll<HTMLElement>("[data-letter]")];
    const reach = 300;
    let frame = 0;
    let x = -9999;
    let y = -9999;

    const paint = () => {
      frame = 0;
      // Read every position first, then write, so the browser lays out once.
      const weights = letters.map((letter) => {
        const box = letter.getBoundingClientRect();
        const distance = Math.hypot(
          x - (box.left + box.width / 2),
          y - (box.top + box.height / 2),
        );
        const near = Math.max(0, 1 - distance / reach);
        return Math.round(400 + 380 * near * near);
      });
      letters.forEach((letter, i) => {
        letter.style.fontWeight = String(weights[i]);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      schedule();
    };
    const onLeave = () => {
      x = -9999;
      y = -9999;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <h1
      ref={ref}
      id={id}
      className="text-clamp font-normal leading-[100%] tracking-[-0.02em]"
    >
      <span className="sr-only">
        {prefix} {lines.join(" ")}
      </span>
      {lines.map((line, i) => (
        <span key={line} className="hero-line" aria-hidden="true">
          <span style={{ "--d": `${i * 120}ms` } as CSSProperties}>
            {line.split(" ").map((word, w) => (
              <span key={w}>
                {w > 0 && " "}
                <span className="whitespace-nowrap">
                  {[...word].map((letter, l) => (
                    <span
                      key={l}
                      data-letter
                      className="transition-[font-weight] duration-200 ease-out"
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        </span>
      ))}
    </h1>
  );
}
