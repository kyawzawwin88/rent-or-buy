export function FieldLabel({
  htmlFor,
  children,
}: Readonly<{
  htmlFor: string;
  children: string;
}>) {
  return (
    <label htmlFor={htmlFor} className="block text-sm leading-5">
      {children}
    </label>
  );
}
