import type { ReactNode } from "react";
import { Headline } from "../atoms/headline";

export function DecisionLayout({
  headline,
  lede,
  verdict,
  fields,
  table,
  assumptions,
}: Readonly<{
  headline: string;
  lede: string;
  verdict: ReactNode;
  fields: ReactNode;
  table: ReactNode;
  assumptions: ReactNode;
}>) {
  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <a
        href="#year-table"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-field focus:bg-canvas focus:px-3 focus:py-2"
      >
        Skip to the year table
      </a>
      <header className="max-w-3xl">
        <Headline>{headline}</Headline>
        <p className="mt-4 max-w-[42ch] text-lg leading-snug text-ink">
          {lede}
        </p>
        {verdict}
      </header>
      <div className="mt-12 grid min-w-0 grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-12">
        <section aria-label="Your figures" className="min-w-0">
          {fields}
        </section>
        <section aria-label="Year comparison" className="min-w-0">
          {table}
        </section>
      </div>
      <div className="mt-14 lg:mt-20">{assumptions}</div>
    </main>
  );
}
