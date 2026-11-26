"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a figure up from zero the first time it scrolls into view.
 * The server renders the final value, so the number is correct without
 * JavaScript and for anyone who prefers reduced motion.
 * Accepts values such as "438", "1,090", "140k+", "0.85" or "287/287".
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^([\d.,]+)(.*)$/);
    if (!el || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const [, digits = "", suffix = ""] = match;
    const target = Number(digits.replace(/,/g, ""));
    const decimals = digits.includes(".") ? (digits.split(".")[1]?.length ?? 0) : 0;
    const grouped = digits.includes(",");
    const format = (n: number) =>
      n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: grouped,
      }) + suffix;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setText(t < 1 ? format(target * eased) : value);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
