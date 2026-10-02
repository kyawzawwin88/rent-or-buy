import { DEFAULT_CURRENCY, type CurrencyCode } from "../../lib/currencies";
import { formatPayment, formatWholeDollars } from "../../lib/money";

export function MoneyFigure({
  value,
  cents = false,
  tone = "ink",
  currency = DEFAULT_CURRENCY,
}: Readonly<{
  value: number;
  cents?: boolean;
  tone?: "ink" | "own" | "rent" | "price";
  currency?: CurrencyCode;
}>) {
  const toneClass = tone === "price" ? "text-rausch" : "text-ink";
  return (
    <span className={`font-sans tabular-nums ${toneClass}`}>
      {cents ? formatPayment(value, currency) : formatWholeDollars(value, currency)}
    </span>
  );
}
