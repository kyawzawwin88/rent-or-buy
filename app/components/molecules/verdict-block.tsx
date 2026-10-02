import { MoneyFigure } from "../atoms/money-figure";
import { DEFAULT_CURRENCY, type CurrencyCode } from "../../lib/currencies";

export function VerdictBlock({
  updating,
  message,
  payment,
  tone,
  currency = DEFAULT_CURRENCY,
}: Readonly<{
  updating: boolean;
  message: string;
  payment: number | null;
  tone: "ink" | "own" | "rent";
  currency?: CurrencyCode;
}>) {
  return (
    <div className="mt-8 border-t border-line pt-4" data-tone={tone}>
      <output className="block max-w-[36rem] text-[clamp(1.5rem,3vw,2rem)] leading-tight text-ink">
        {updating ? "Updating" : message}
      </output>
      {payment !== null ? (
        <p className="mt-3 text-2xl leading-none">
          <span className="text-base text-ink">Monthly mortgage payment </span>
          <MoneyFigure value={payment} cents tone="price" currency={currency} />
        </p>
      ) : null}
    </div>
  );
}
