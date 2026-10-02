import { FieldLabel } from "../atoms/field-label";
import { NumberInput } from "../atoms/number-input";

export function MoneyField({
  id,
  label,
  suffix,
  value,
  invalid,
  invalidLabel,
  onChange,
}: Readonly<{
  id: string;
  label: string;
  suffix: string;
  value: string;
  invalid: boolean;
  invalidLabel: string;
  onChange: (value: string) => void;
}>) {
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <NumberInput
        id={id}
        value={value}
        invalid={invalid}
        describedBy={invalid ? errorId : undefined}
        onChange={onChange}
      />
      <span className="text-sm text-mute">{suffix}</span>
      {invalid ? (
        <p id={errorId} className="text-sm text-ink">
          Check the {invalidLabel}.
        </p>
      ) : null}
    </div>
  );
}
