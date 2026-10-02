import type { YearColumn } from "../../lib/compare";
import { DEFAULT_CURRENCY, type CurrencyCode } from "../../lib/currencies";
import { MoneyFigure } from "../atoms/money-figure";

const ROWS = [
  { key: "rentCash", label: "Cumulative rent", tone: "rent" },
  { key: "ownCash", label: "Cumulative owning cost", tone: "own" },
  { key: "equity", label: "Equity", tone: "own" },
  {
    key: "downPaymentFutureValue",
    label: "Down payment future value",
    tone: "ink",
  },
] as const;

export function YearComparison({
  columns,
  hiddenMessage,
  busy = false,
  currency = DEFAULT_CURRENCY,
}: Readonly<{
  columns: YearColumn[] | null;
  hiddenMessage: string | null;
  busy?: boolean;
  currency?: CurrencyCode;
}>) {
  if (!columns) {
    return (
      <p
        id="year-table"
        tabIndex={-1}
        aria-busy={busy || undefined}
        className="max-w-full rounded-card border border-line p-6 text-2xl leading-snug"
      >
        {hiddenMessage}
      </p>
    );
  }

  return (
    <div id="year-table" tabIndex={-1} aria-busy={busy || undefined} className="max-w-full overflow-x-auto rounded-card border border-line p-5 sm:p-6">
      <h2 className="text-2xl font-normal leading-none">
        Years 5, 10, and 20
      </h2>
      <div className="mt-5 grid gap-8 sm:hidden">
        {columns.map((column) => (
          <article key={column.year} className="border-t border-line pt-3">
            <h3 className="text-2xl">Year {column.year}</h3>
            <dl className="mt-3 grid gap-2">
              {ROWS.map((row) => (
                <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,max-content)] items-baseline gap-3">
                  <dt>{row.label}</dt>
                  <dd className="min-w-0 break-words text-right">
                    <MoneyFigure value={column[row.key]} tone={row.tone} currency={currency} />
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <table className="mt-5 hidden w-full table-fixed border-t border-line text-left sm:table">
        <caption className="sr-only">
          Cumulative rent, cumulative owning cost, equity, and down payment future value at years 5, 10, and 20
        </caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="py-3 pr-4 font-normal">
              <span className="sr-only">Measure</span>
            </th>
            {columns.map((column) => (
              <th
                key={column.year}
                scope="col"
                className="px-3 py-3 text-right text-2xl font-normal"
              >
                Year {column.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key} className="border-b border-line">
              <th scope="row" className="break-words py-3 pr-4 text-left font-normal">
                {row.label}
              </th>
              {columns.map((column) => (
                <td key={column.year} className="min-w-0 break-words px-3 py-3 text-right text-lg">
                  <MoneyFigure value={column[row.key]} tone={row.tone} currency={currency} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
