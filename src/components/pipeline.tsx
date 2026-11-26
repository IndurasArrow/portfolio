import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { method, type Stage } from "@/content/profile";

function Node({
  stage,
  order,
  link,
}: {
  stage: Stage;
  /** Zero-based position in the whole flow. */
  order: number;
  link?: "short" | "long";
}) {
  const mine = stage.actor === "me";
  return (
    <li
      className="pipe-node flex min-h-[7.5rem] flex-col rounded-xl border bg-card p-4 min-[1152px]:h-[13.5rem]"
      data-link={link}
      style={{ "--i": order } as CSSProperties}
    >
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{String(order + 1).padStart(2, "0")}</span>
        <span className="pipe-light" aria-hidden="true" />
      </div>
      <h3 className="mt-3 font-medium leading-snug">{stage.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{stage.text}</p>
      <div className="mt-auto pt-3">
        <Badge variant={mine ? "default" : "outline"} className="font-normal">
          {mine ? "Me" : "Sub-agent"}
        </Badge>
      </div>
    </li>
  );
}

/**
 * The delivery workflow: two written steps, a per-task loop of one coding and
 * two review sub-agents, then branch review and the pull request. A light
 * travels through the steps in order.
 */
export function Pipeline() {
  const { before, loop, after } = method;
  const loopStart = before.length;
  const afterStart = loopStart + loop.length;

  return (
    <ol className="pipe" aria-label="Sub-agent-driven development, step by step">
      {before.map((stage, i) => (
        <Node
          key={stage.id}
          stage={stage}
          order={i}
          link={i === 0 ? undefined : "short"}
        />
      ))}

      <li className="pipe-loop">
        <span className="pipe-loop-tag" data-pos="top">
          {method.loopLabel}
        </span>
        <ol className="pipe-row">
          {loop.map((stage, i) => (
            <Node
              key={stage.id}
              stage={stage}
              order={loopStart + i}
              link={i === 0 ? "long" : "short"}
            />
          ))}
        </ol>
        <span className="pipe-loop-tag" data-pos="bottom">
          {method.loopNote}
        </span>
      </li>

      {after.map((stage, i) => (
        <Node
          key={stage.id}
          stage={stage}
          order={afterStart + i}
          link={i === 0 ? "long" : "short"}
        />
      ))}
    </ol>
  );
}
