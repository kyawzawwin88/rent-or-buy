export function NumberInput({
  id,
  value,
  invalid,
  describedBy,
  onChange,
}: Readonly<{
  id: string;
  value: string;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}>) {
  return (
    <input
      id={id}
      name={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
      className={`min-h-11 w-full rounded-field border bg-canvas px-3 text-base tabular-nums focus:outline focus:outline-2 focus:outline-offset-[3px] focus:outline-ink ${
        invalid ? "border-2 border-ink" : "border border-line"
      }`}
    />
  );
}
