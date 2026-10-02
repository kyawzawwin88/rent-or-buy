import { useEffect, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { DecisionFields } from "../components/organisms/decision-fields";
import { AssumptionList } from "../components/organisms/assumption-list";
import { YearComparison } from "../components/organisms/year-comparison";
import { DecisionLayout } from "../components/templates/decision-layout";
import { VerdictBlock } from "../components/molecules/verdict-block";
import {
  assessHousingDecision,
  comparisonFieldLabel,
  sampleInputs,
  type RawInputs,
} from "../lib/compare";
import { amountSuffix, DEFAULT_CURRENCY, isMajorCurrency, type CurrencyCode } from "../lib/currencies";
import { parseDraft } from "../lib/draft";
import { projectionRefresh } from "../lib/refresh";
import { verdictSentence } from "../lib/verdict";

export const meta: MetaFunction = () => [
  { title: "Rent or Buy? Let the numbers decide." },
  {
    name: "description",
    content:
      "Compare the cash, equity, and invested down payment of buying or renting. No account.",
  },
];

const ASSUMPTION_REST = [
  "Property tax and maintenance are annual percents of the home value at the start of that year. Insurance is a flat amount. The value then changes by the appreciation rate.",
  "Rent in a later year is the monthly rent times 12, grown once for each year after the first.",
  "Owning cash is the mortgage, tax, maintenance, and insurance. Renting cash is the rent. Only principal reduces the balance. Equity is the grown value minus the remaining principal.",
  "The down payment compounds monthly at the investment return, with nothing added. Each month the gap between the mortgage plus one twelfth of that year's tax, maintenance, and insurance, and that month's rent, is invested on the cheaper side at the same rate.",
  "Owning net worth is equity plus the owning surplus. Renting net worth is the down payment future value plus the renting surplus. The horizon is at least 20 years, at most 40, and never shorter than the loan. The table shows years 5, 10, and 20.",
  "Break-even is the first year owning net worth is at least renting net worth. PMI, HOA fees, closing costs, selling costs, and tax deductions are left out.",
];

type FieldId = keyof RawInputs;

function assumptionsFor(currency: CurrencyCode): string[] {
  return [
    `Figures are nominal ${currency}. The loan is the price minus the down payment and is paid monthly. At a 0% rate the payment is the loan divided by the number of months. After payoff the mortgage payment is zero.`,
    ...ASSUMPTION_REST,
  ];
}

const FIELDS: Array<{
  id: FieldId;
  label: string;
  money?: "amount" | "month" | "year";
  suffix?: string;
}> = [
  { id: "price", label: "Home price", money: "amount" },
  { id: "downPayment", label: "Down payment", money: "amount" },
  {
    id: "mortgageRatePercent",
    label: "Mortgage rate",
    suffix: "percent per year",
  },
  { id: "termYears", label: "Loan term", suffix: "years, whole number" },
  { id: "monthlyRent", label: "Monthly rent", money: "month" },
  {
    id: "rentGrowthPercent",
    label: "Rent growth",
    suffix: "percent per year",
  },
  {
    id: "taxPercent",
    label: "Property tax",
    suffix: "percent of value per year",
  },
  {
    id: "maintenancePercent",
    label: "Maintenance",
    suffix: "percent of value per year",
  },
  { id: "insuranceAnnual", label: "Insurance", money: "year" },
  {
    id: "appreciationPercent",
    label: "Appreciation",
    suffix: "percent per year",
  },
  {
    id: "investmentReturnPercent",
    label: "Investment return",
    suffix: "percent per year",
  },
];

function fieldSuffix(
  field: (typeof FIELDS)[number],
  currency: CurrencyCode,
): string {
  if (field.money === "month" || field.money === "year") {
    return amountSuffix(currency, field.money);
  }
  if (field.money === "amount") {
    return amountSuffix(currency);
  }
  return field.suffix ?? "";
}

function sampleDraft(): Record<FieldId, string> {
  return {
    price: String(sampleInputs.price),
    downPayment: String(sampleInputs.downPayment),
    mortgageRatePercent: String(sampleInputs.mortgageRatePercent),
    termYears: String(sampleInputs.termYears),
    monthlyRent: String(sampleInputs.monthlyRent),
    rentGrowthPercent: String(sampleInputs.rentGrowthPercent),
    taxPercent: String(sampleInputs.taxPercent),
    maintenancePercent: String(sampleInputs.maintenancePercent),
    insuranceAnnual: String(sampleInputs.insuranceAnnual),
    appreciationPercent: String(sampleInputs.appreciationPercent),
    investmentReturnPercent: String(sampleInputs.investmentReturnPercent),
  };
}

function sameDraft(
  left: Record<FieldId, string>,
  right: Record<FieldId, string>,
): boolean {
  return FIELDS.every((field) => left[field.id] === right[field.id]);
}

export default function Index() {
  const initial = sampleDraft();
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [updating, setUpdating] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const plan = projectionRefresh(!sameDraft(draft, applied));
    if (!plan.showUpdating) {
      setUpdating(false);
      return;
    }
    setUpdating(true);
    const timer = setTimeout(() => {
      setApplied(draft);
      setUpdating(false);
    }, plan.waitMs);
    return () => clearTimeout(timer);
  }, [draft, applied]);

  const decision = assessHousingDecision(parseDraft(applied));
  const invalidName = decision.status === "invalid" ? decision.field : null;

  let message = "Enter every field to see the comparison.";
  let payment: number | null = null;
  let columns = null;
  let hiddenMessage: string | null = "Enter every field to see the comparison.";
  let tone: "ink" | "own" | "rent" = "ink";

  if (decision.status === "invalid") {
    message = `No projection. Check the ${decision.field}.`;
    hiddenMessage = `No projection until the ${decision.field} is valid.`;
  } else if (decision.status === "ready") {
    message = verdictSentence(decision.breakEvenYear);
    payment = decision.monthlyPayment;
    columns = decision.columns;
    hiddenMessage = null;
    tone = decision.breakEvenYear === null ? "rent" : "own";
  }

  return (
    <DecisionLayout
      headline="Rent or Buy? Let the numbers decide."
      lede="One page for your price, rent, and loan. No account. The sample is a starting point, not a forecast."
      verdict={
        <VerdictBlock
          updating={updating}
          message={message}
          payment={payment}
          tone={updating ? "ink" : tone}
          currency={currency}
        />
      }
      fields={
        <DecisionFields
          sampleNote="These entries start as a sample, not a forecast."
          currency={currency}
          onCurrencyChange={(code) => {
            if (isMajorCurrency(code)) {
              setCurrency(code);
            }
          }}
          fields={FIELDS.map((field) => ({
            id: field.id,
            label: field.label,
            suffix: fieldSuffix(field, currency),
            value: draft[field.id],
            invalid: invalidName === comparisonFieldLabel(field.id),
            invalidLabel: comparisonFieldLabel(field.id),
          }))}
          onChange={(id, value) =>
            setDraft((current) => ({ ...current, [id]: value }))
          }
        />
      }
      table={
        <YearComparison
          columns={columns}
          hiddenMessage={hiddenMessage}
          busy={updating}
          currency={currency}
        />
      }
      assumptions={<AssumptionList items={assumptionsFor(currency)} />}
    />
  );
}
