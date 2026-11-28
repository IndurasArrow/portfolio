"use client";

import { useSyncExternalStore } from "react";

/**
 * The time where I am, to the minute: a visitor deciding when to write can
 * see whether it is the middle of my night. Rendered as a placeholder on the
 * server (the build has no "now") and filled in once the page is running.
 */
const tick = (listener: () => void) => {
  const timer = window.setInterval(listener, 15000);
  return () => window.clearInterval(timer);
};

export function LocalTime({
  zone,
  label,
  place,
}: {
  /** IANA name, such as "Asia/Kolkata". */
  zone: string;
  /** Short name shown after the time, such as "IST". */
  label: string;
  place: string;
}) {
  const time = useSyncExternalStore(
    tick,
    () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: zone,
      }).format(new Date()),
    () => "--:--",
  );
  return (
    <span className="whitespace-nowrap tabular-nums">
      <span className="sr-only">Local time in {place}: </span>
      {time} {label}
    </span>
  );
}
