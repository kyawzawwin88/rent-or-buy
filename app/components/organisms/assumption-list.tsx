export function AssumptionList({ items }: Readonly<{ items: string[] }>) {
  return (
    <section className="border-t border-line pt-8" aria-labelledby="assumptions-title">
      <h2 id="assumptions-title" className="text-2xl font-normal">
        What the numbers include
      </h2>
      <ul className="mt-5 grid max-w-[68ch] list-disc gap-4 pl-5 text-base leading-snug">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
