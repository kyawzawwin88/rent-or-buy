import type { RawInputs } from "./compare";

const KEYS: Array<keyof RawInputs> = [
  "price",
  "downPayment",
  "mortgageRatePercent",
  "termYears",
  "monthlyRent",
  "rentGrowthPercent",
  "taxPercent",
  "maintenancePercent",
  "insuranceAnnual",
  "appreciationPercent",
  "investmentReturnPercent",
];

export function parseDraftValue(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") {
    return null;
  }
  return Number(trimmed);
}

export function parseDraft(
  draft: Record<keyof RawInputs, string>,
): RawInputs {
  const parsed = {} as RawInputs;
  for (const key of KEYS) {
    parsed[key] = parseDraftValue(draft[key]);
  }
  return parsed;
}
