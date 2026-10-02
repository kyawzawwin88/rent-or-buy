import { parseDraft, parseDraftValue } from "./draft";
import { sampleInputs, type RawInputs } from "./compare";

describe("draft parsing", () => {
  it("treats a blank or whitespace field as empty", () => {
    expect(parseDraftValue("")).toBeNull();
    expect(parseDraftValue("   ")).toBeNull();
  });

  it("parses a trimmed number", () => {
    expect(parseDraftValue(" 700 ")).toBe(700);
  });

  it("keeps a decimal rate and treats a percent sign or thousands comma as non-finite", () => {
    expect(parseDraftValue("6.5")).toBe(6.5);
    expect(Number.isFinite(parseDraftValue("6%"))).toBe(false);
    expect(Number.isFinite(parseDraftValue("20,000"))).toBe(false);
  });

  it("round-trips every sample field", () => {
    const draft = {} as Record<keyof RawInputs, string>;
    for (const key of Object.keys(sampleInputs) as Array<keyof RawInputs>) {
      draft[key] = String(sampleInputs[key]);
    }
    expect(parseDraft(draft)).toEqual(sampleInputs);
  });

  it("turns one blank field into an empty decision input", () => {
    const draft = {} as Record<keyof RawInputs, string>;
    for (const key of Object.keys(sampleInputs) as Array<keyof RawInputs>) {
      draft[key] = String(sampleInputs[key]);
    }
    draft.price = "";
    expect(parseDraft(draft).price).toBeNull();
    expect(parseDraft(draft).monthlyRent).toBe(700);
  });
});
