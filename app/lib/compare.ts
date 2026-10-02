export type RawInputs = {
  price: number | null;
  downPayment: number | null;
  mortgageRatePercent: number | null;
  termYears: number | null;
  monthlyRent: number | null;
  rentGrowthPercent: number | null;
  taxPercent: number | null;
  maintenancePercent: number | null;
  insuranceAnnual: number | null;
  appreciationPercent: number | null;
  investmentReturnPercent: number | null;
};

export type YearColumn = {
  year: 5 | 10 | 20;
  rentCash: number;
  ownCash: number;
  equity: number;
  downPaymentFutureValue: number;
  homeValue: number;
};

export type HousingDecision =
  | { status: "empty" }
  | { status: "invalid"; field: string }
  | {
      status: "ready";
      monthlyPayment: number;
      horizonYears: number;
      breakEvenYear: number | null;
      columns: YearColumn[];
    };

export const sampleInputs: RawInputs = {
  price: 100_000,
  downPayment: 20_000,
  mortgageRatePercent: 6,
  termYears: 30,
  monthlyRent: 700,
  rentGrowthPercent: 3,
  taxPercent: 1,
  maintenancePercent: 1,
  insuranceAnnual: 600,
  appreciationPercent: 3,
  investmentReturnPercent: 7,
};

const MONTHS_PER_YEAR = 12;
const DISPLAY_YEARS = new Set<number>([5, 10, 20]);

type FieldKey = keyof RawInputs;

type Check = {
  key: FieldKey;
  label: string;
  valid: (value: number, inputs: RawInputs) => boolean;
};

const CHECKS: Check[] = [
  {
    key: "price",
    label: "price",
    valid: (value) => value > 0,
  },
  {
    key: "downPayment",
    label: "down payment",
    valid: (value, inputs) =>
      value >= 0 && inputs.price !== null && value <= inputs.price,
  },
  {
    key: "termYears",
    label: "loan term",
    valid: (value) => Number.isInteger(value) && value >= 1 && value <= 40,
  },
  {
    key: "mortgageRatePercent",
    label: "mortgage rate",
    valid: (value) => value >= 0 && value <= 25,
  },
  {
    key: "rentGrowthPercent",
    label: "rent growth",
    valid: (value) => value >= 0 && value <= 20,
  },
  {
    key: "taxPercent",
    label: "property tax",
    valid: (value) => value >= 0 && value <= 10,
  },
  {
    key: "maintenancePercent",
    label: "maintenance",
    valid: (value) => value >= 0 && value <= 10,
  },
  {
    key: "monthlyRent",
    label: "monthly rent",
    valid: (value) => value >= 0,
  },
  {
    key: "insuranceAnnual",
    label: "insurance",
    valid: (value) => value >= 0,
  },
  {
    key: "appreciationPercent",
    label: "appreciation",
    valid: (value) => value >= -20 && value <= 30,
  },
  {
    key: "investmentReturnPercent",
    label: "investment return",
    valid: (value) => value >= -20 && value <= 30,
  },
];

type ReadyInputs = {
  [Key in FieldKey]: number;
};

export function comparisonFieldLabel(key: keyof RawInputs): string {
  const check = CHECKS.find((entry) => entry.key === key);
  if (!check) {
    throw new Error(`unknown field ${key}`);
  }
  return check.label;
}

function isBlank(inputs: RawInputs): boolean {
  return CHECKS.some((check) => inputs[check.key] === null);
}

function firstInvalidField(inputs: RawInputs): string | null {
  for (const check of CHECKS) {
    const value = inputs[check.key];
    if (
      value === null ||
      !Number.isFinite(value) ||
      !check.valid(value, inputs)
    ) {
      return check.label;
    }
  }
  return null;
}

function asReady(inputs: RawInputs): ReadyInputs {
  return {
    price: inputs.price ?? 0,
    downPayment: inputs.downPayment ?? 0,
    mortgageRatePercent: inputs.mortgageRatePercent ?? 0,
    termYears: inputs.termYears ?? 0,
    monthlyRent: inputs.monthlyRent ?? 0,
    rentGrowthPercent: inputs.rentGrowthPercent ?? 0,
    taxPercent: inputs.taxPercent ?? 0,
    maintenancePercent: inputs.maintenancePercent ?? 0,
    insuranceAnnual: inputs.insuranceAnnual ?? 0,
    appreciationPercent: inputs.appreciationPercent ?? 0,
    investmentReturnPercent: inputs.investmentReturnPercent ?? 0,
  };
}

function monthlyMortgage(
  loan: number,
  annualPercent: number,
  termYears: number,
): number {
  const months = termYears * MONTHS_PER_YEAR;
  if (loan <= 0 || months <= 0) {
    return 0;
  }
  if (annualPercent === 0) {
    return loan / months;
  }
  const monthlyRate = annualPercent / 100 / MONTHS_PER_YEAR;
  const factor = (1 + monthlyRate) ** months;
  return (loan * monthlyRate * factor) / (factor - 1);
}

function balanceAfter(
  loan: number,
  annualPercent: number,
  termYears: number,
  paymentsMade: number,
): number {
  const months = termYears * MONTHS_PER_YEAR;
  if (loan <= 0 || paymentsMade >= months) {
    return 0;
  }
  if (annualPercent === 0) {
    return loan * (1 - paymentsMade / months);
  }
  const monthlyRate = annualPercent / 100 / MONTHS_PER_YEAR;
  const factorTerm = (1 + monthlyRate) ** months;
  const factorPaid = (1 + monthlyRate) ** paymentsMade;
  return (loan * (factorTerm - factorPaid)) / (factorTerm - 1);
}

function projectReady(inputs: ReadyInputs): HousingDecision {
  const loan = inputs.price - inputs.downPayment;
  const termMonths = inputs.termYears * MONTHS_PER_YEAR;
  const payment = monthlyMortgage(
    loan,
    inputs.mortgageRatePercent,
    inputs.termYears,
  );
  const horizon = Math.min(40, Math.max(20, inputs.termYears));
  const monthlyReturn = inputs.investmentReturnPercent / 100 / MONTHS_PER_YEAR;
  const rentGrowth = inputs.rentGrowthPercent / 100;
  const appreciation = inputs.appreciationPercent / 100;

  let homeValue = inputs.price;
  let rentCash = 0;
  let ownCash = 0;
  let owningSurplus = 0;
  let rentingSurplus = 0;
  let breakEvenYear: number | null = null;
  const columns: YearColumn[] = [];

  for (let year = 1; year <= horizon; year += 1) {
    const valueAtStart = homeValue;
    const tax = (inputs.taxPercent / 100) * valueAtStart;
    const maintenance = (inputs.maintenancePercent / 100) * valueAtStart;
    const insurance = inputs.insuranceAnnual;
    const monthlyFixed = (tax + maintenance + insurance) / MONTHS_PER_YEAR;
    const rentThisYear =
      inputs.monthlyRent * MONTHS_PER_YEAR * (1 + rentGrowth) ** (year - 1);
    const rentMonth = rentThisYear / MONTHS_PER_YEAR;
    let mortgageThisYear = 0;

    for (let month = 1; month <= MONTHS_PER_YEAR; month += 1) {
      const paymentsMade = (year - 1) * MONTHS_PER_YEAR + (month - 1);
      const mortgageDue = paymentsMade < termMonths ? payment : 0;
      mortgageThisYear += mortgageDue;
      const gap = mortgageDue + monthlyFixed - rentMonth;
      owningSurplus *= 1 + monthlyReturn;
      rentingSurplus *= 1 + monthlyReturn;
      if (gap > 0) {
        rentingSurplus += gap;
      } else if (gap < 0) {
        owningSurplus += -gap;
      }
    }

    homeValue = valueAtStart * (1 + appreciation);
    rentCash += rentThisYear;
    ownCash += mortgageThisYear + tax + maintenance + insurance;

    const equity =
      homeValue -
      balanceAfter(loan, inputs.mortgageRatePercent, inputs.termYears, year * MONTHS_PER_YEAR);
    const downPaymentFutureValue =
      inputs.downPayment * (1 + monthlyReturn) ** (year * MONTHS_PER_YEAR);
    const owningNetWorth = equity + owningSurplus;
    const rentingNetWorth = downPaymentFutureValue + rentingSurplus;
    if (breakEvenYear === null && owningNetWorth >= rentingNetWorth) {
      breakEvenYear = year;
    }

    if (DISPLAY_YEARS.has(year)) {
      columns.push({
        year: year as YearColumn["year"],
        rentCash,
        ownCash,
        equity,
        downPaymentFutureValue,
        homeValue,
      });
    }
  }

  return {
    status: "ready",
    monthlyPayment: payment,
    horizonYears: horizon,
    breakEvenYear,
    columns,
  };
}

export function assessHousingDecision(inputs: RawInputs): HousingDecision {
  if (isBlank(inputs)) {
    return { status: "empty" };
  }
  const field = firstInvalidField(inputs);
  if (field) {
    return { status: "invalid", field };
  }
  return projectReady(asReady(inputs));
}
