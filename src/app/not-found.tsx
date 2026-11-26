import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-[100svh] w-11/12 max-w-7xl flex-col justify-end pb-16 pt-32"
    >
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-4 text-clamp font-normal leading-[100%] tracking-[-0.02em]">
        Not here
      </h1>
      <p className="mt-6 max-w-md text-muted-foreground">
        There is nothing at this address. Everything on this site lives on the
        home page.
      </p>
      <div className="mt-8">
        <Button asChild variant="outline">
          {/* A plain anchor: the home page is the only other route. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">Go to the home page</a>
        </Button>
      </div>
    </main>
  );
}
