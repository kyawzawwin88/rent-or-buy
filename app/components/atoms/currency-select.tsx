import { FieldLabel } from "./field-label";
import {
  isMajorCurrency,
  MAJOR_CURRENCIES,
  type CurrencyCode,
} from "../../lib/currencies";

export function CurrencySelect({
  id,
  value,
  onChange,
}: Readonly<{
  id: string;
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
}>) {
  return (
    <div className="grid gap-1">
      <FieldLabel htmlFor={id}>Currency</FieldLabel>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (isMajorCurrency(next)) {
            onChange(next);
          }
        }}
        className="min-h-11 w-full rounded-field border border-line bg-canvas px-3 text-base focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-ink"
      >
        {MAJOR_CURRENCIES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.code}, {entry.name}
          </option>
        ))}
      </select>
      <span className="text-sm text-ink">
        Same numbers, in the currency you pick. No exchange rate.
      </span>
    </div>
  );
}
