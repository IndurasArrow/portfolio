"use client";

import type { ComponentProps, PointerEvent } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GlowCardProps = ComponentProps<"div"> & {
  /** Maximum tilt in degrees. 0 turns the tilt off. */
  tilt?: number;
};

/**
 * The site's Card with two pointer effects: a soft light and a lit border
 * that follow the cursor, and a slight tilt towards it.
 */
export function GlowCard({
  tilt = 2.5,
  className,
  children,
  ...props
}: GlowCardProps) {
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (tilt > 0 && event.pointerType === "mouse") {
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;
      el.style.setProperty("--ry", `${(px * tilt * 2).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-py * tilt * 2).toFixed(2)}deg`);
    }
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  }

  return (
    <Card
      className={cn("glow shadow-none", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...props}
    >
      {children}
    </Card>
  );
}
