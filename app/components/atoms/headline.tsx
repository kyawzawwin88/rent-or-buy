export function Headline({ children }: Readonly<{ children: string }>) {
  return (
    <h1 className="max-w-[12em] text-[clamp(2.25rem,5vw,3.5rem)] font-normal leading-tight tracking-[-0.02em]">
      {children}
    </h1>
  );
}
