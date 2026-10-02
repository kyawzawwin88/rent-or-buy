import { assessHousingDecision, sampleInputs, type YearColumn } from "../app/lib/compare";
import { amountSuffix, type CurrencyCode } from "../app/lib/currencies";

export function readySample(): {
  monthlyPayment: number;
  columns: YearColumn[];
} {
  const decision = assessHousingDecision(sampleInputs);
  if (decision.status !== "ready") {
    throw new Error("sample inputs should produce a projection");
  }
  return decision;
}

const FIELD_DEFS = [
  { id: "price", label: "Home price", money: "amount" },
  { id: "downPayment", label: "Down payment", money: "amount" },
  { id: "mortgageRatePercent", label: "Mortgage rate", suffix: "percent per year" },
  { id: "termYears", label: "Loan term", suffix: "years, whole number" },
  { id: "monthlyRent", label: "Monthly rent", money: "month" },
  { id: "rentGrowthPercent", label: "Rent growth", suffix: "percent per year" },
  { id: "taxPercent", label: "Property tax", suffix: "percent of value per year" },
  { id: "maintenancePercent", label: "Maintenance", suffix: "percent of value per year" },
  { id: "insuranceAnnual", label: "Insurance", money: "year" },
  { id: "appreciationPercent", label: "Appreciation", suffix: "percent per year" },
  { id: "investmentReturnPercent", label: "Investment return", suffix: "percent per year" },
] as const;

export function sampleFieldValues(): Record<string, string> {
  return {
    price: "100000",
    downPayment: "20000",
    mortgageRatePercent: "6",
    termYears: "30",
    monthlyRent: "700",
    rentGrowthPercent: "3",
    taxPercent: "1",
    maintenancePercent: "1",
    insuranceAnnual: "600",
    appreciationPercent: "3",
    investmentReturnPercent: "7",
  };
}

export function sampleFields(currency: CurrencyCode, values: Record<string, string>) {
  return FIELD_DEFS.map((field) => ({
    id: field.id,
    label: field.label,
    value: values[field.id] ?? "",
    invalid: false,
    invalidLabel: field.label.toLowerCase(),
    suffix:
      "money" in field
        ? amountSuffix(currency, field.money === "amount" ? undefined : field.money)
        : field.suffix,
  }));
}
