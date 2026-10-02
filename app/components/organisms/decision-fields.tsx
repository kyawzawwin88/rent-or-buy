import { CurrencySelect } from "../atoms/currency-select";
import { MoneyField } from "../molecules/money-field";
import { DEFAULT_CURRENCY, type CurrencyCode } from "../../lib/currencies";

export type DecisionFieldModel = {
  id: string;
  label: string;
  suffix: string;
  value: string;
  invalid: boolean;
  invalidLabel: string;
};

export function DecisionFields({
  fields,
  sampleNote,
  onChange,
  currency = DEFAULT_CURRENCY,
  onCurrencyChange,
}: Readonly<{
  fields: DecisionFieldModel[];
  sampleNote: string;
  onChange: (id: string, value: string) => void;
  currency?: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
}>) {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <CurrencySelect id="currency" value={currency} onChange={onCurrencyChange} />
        </div>
        {fields.map((field) => (
          <MoneyField
            key={field.id}
            id={field.id}
            label={field.label}
            suffix={field.suffix}
            value={field.value}
            invalid={field.invalid}
            invalidLabel={field.invalidLabel}
            onChange={(value) => onChange(field.id, value)}
          />
        ))}
      </div>
      <p className="mt-5 max-w-[36ch] text-sm leading-snug text-mute">
        {sampleNote}
      </p>
    </form>
  );
}
