import {
  assessHousingDecision,
  comparisonFieldLabel,
  sampleInputs,
  type RawInputs,
} from "./compare";

function expectDollars(actual: number, expected: number): void {
  expect(Math.abs(Math.round(actual) - expected)).toBeLessThanOrEqual(1);
}

function column(
  decision: ReturnType<typeof assessHousingDecision>,
  year: 5 | 10 | 20,
) {
  if (decision.status !== "ready") {
    throw new Error(`expected a projection, got ${decision.status}`);
  }
  const match = decision.columns.find((entry) => entry.year === year);
  if (!match) {
    throw new Error(`missing year ${year}`);
  }
  return { decision, match };
}

describe("rent or buy projection", () => {
  it("matches the sample payment and year 5 and year 20 cash figures", () => {
    const decision = assessHousingDecision(sampleInputs);
    expect(decision.status).toBe("ready");
    if (decision.status !== "ready") {
      return;
    }
    expect(decision.monthlyPayment).toBeCloseTo(479.64, 2);
    const year5 = column(decision, 5).match;
    const year20 = column(decision, 20).match;
    expectDollars(year5.rentCash, 44_597);
    expectDollars(year5.ownCash, 42_397);
    expectDollars(year5.equity, 41_484);
    expectDollars(year5.downPaymentFutureValue, 28_353);
    const year10 = column(decision, 10).match;
    expectDollars(year10.rentCash, 96_297);
    expectDollars(year10.ownCash, 86_485);
    expectDollars(year10.equity, 67_443);
    expectDollars(year10.downPaymentFutureValue, 40_193);
    expectDollars(year20.rentCash, 225_711);
    expectDollars(year20.ownCash, 180_854);
    expectDollars(year20.equity, 137_408);
    expectDollars(year20.downPaymentFutureValue, 80_775);
    expect(decision.columns.map((entry) => entry.year)).toEqual([5, 10, 20]);
    expect(decision.breakEvenYear).toBe(1);
  });

  it("names a later year when owning catches renting after year 1", () => {
    const decision = assessHousingDecision({
      price: 400_000,
      downPayment: 80_000,
      mortgageRatePercent: 6.5,
      termYears: 30,
      monthlyRent: 2_800,
      rentGrowthPercent: 3,
      taxPercent: 1.1,
      maintenancePercent: 1,
      insuranceAnnual: 1_500,
      appreciationPercent: -2,
      investmentReturnPercent: 0,
    });
    expect(decision.status).toBe("ready");
    if (decision.status !== "ready") {
      return;
    }
    expect(decision.breakEvenYear).toBe(8);
  });

  it("keeps renting ahead through the horizon when the home falls and cash is costly", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      price: 100_000,
      downPayment: 100_000,
      mortgageRatePercent: 0,
      monthlyRent: 0,
      rentGrowthPercent: 0,
      taxPercent: 10,
      maintenancePercent: 10,
      insuranceAnnual: 10_000,
      appreciationPercent: -20,
      investmentReturnPercent: 30,
    });
    expect(decision.status).toBe("ready");
    if (decision.status !== "ready") {
      return;
    }
    expect(decision.breakEvenYear).toBeNull();
  });

  it("treats a cash purchase as zero payment and equity equal to grown value", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      downPayment: sampleInputs.price,
    });
    expect(decision.status).toBe("ready");
    if (decision.status !== "ready") {
      return;
    }
    expect(decision.monthlyPayment).toBe(0);
    for (const entry of decision.columns) {
      expect(entry.equity).toBeCloseTo(entry.homeValue, 6);
      expect(entry.homeValue).toBeGreaterThan(0);
    }
  });

  it("sets a zero-rate payment to the loan divided by the months", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      price: 120_000,
      downPayment: 0,
      mortgageRatePercent: 0,
      termYears: 10,
    });
    expect(decision.status).toBe("ready");
    if (decision.status !== "ready") {
      return;
    }
    expect(decision.monthlyPayment).toBeCloseTo(120_000 / 120, 8);
  });

  it("stops charging the mortgage after the loan is paid off", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      price: 12_000,
      downPayment: 0,
      mortgageRatePercent: 0,
      termYears: 1,
      monthlyRent: 0,
      rentGrowthPercent: 0,
      taxPercent: 0,
      maintenancePercent: 0,
      insuranceAnnual: 0,
      appreciationPercent: 0,
      investmentReturnPercent: 0,
    });
    expect(decision.status).toBe("ready");
    if (decision.status !== "ready") {
      return;
    }
    expect(decision.monthlyPayment).toBeCloseTo(1_000, 8);
    expect(decision.horizonYears).toBe(20);
    const year5 = column(decision, 5).match;
    expectDollars(year5.ownCash, 12_000);
    expect(year5.equity).toBeCloseTo(12_000, 6);
  });

  it("names the down payment and hides the projection when it exceeds the price", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      downPayment: 100_001,
    });
    expect(decision).toEqual({ status: "invalid", field: "down payment" });
  });

  it("returns an empty decision when the price is blank", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      price: null,
      downPayment: 500_000,
    });
    expect(decision).toEqual({ status: "empty" });
  });

  it("still projects when the home value and equity fall", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      appreciationPercent: -5,
    });
    expect(decision.status).toBe("ready");
    if (decision.status !== "ready") {
      return;
    }
    const year5 = column(decision, 5).match;
    const year10 = column(decision, 10).match;
    expect(year5.homeValue).toBeLessThan(sampleInputs.price ?? 0);
    expect(year10.homeValue).toBeLessThan(year5.homeValue);
    expect(year5.equity).toBeLessThan(sampleInputs.downPayment ?? 0);
    expect(year10.equity).toBeLessThan(year5.equity);
    expect(decision.columns).toHaveLength(3);
  });

  it("names the first field that is not finite", () => {
    const cases: Array<[keyof RawInputs, number, string]> = [
      ["price", Number.NaN, "price"],
      ["price", Number.POSITIVE_INFINITY, "price"],
      ["price", 0, "price"],
      ["mortgageRatePercent", 25.01, "mortgage rate"],
      ["termYears", 1.5, "loan term"],
      ["rentGrowthPercent", -1, "rent growth"],
      ["taxPercent", 11, "property tax"],
      ["maintenancePercent", -0.1, "maintenance"],
      ["monthlyRent", -1, "monthly rent"],
      ["insuranceAnnual", -1, "insurance"],
      ["appreciationPercent", -20.1, "appreciation"],
      ["investmentReturnPercent", 30.1, "investment return"],
    ];
    for (const [key, value, field] of cases) {
      const decision = assessHousingDecision({
        ...sampleInputs,
        [key]: value,
      });
      expect(decision).toEqual({ status: "invalid", field });
      expect(comparisonFieldLabel(key)).toBe(field);
    }
  });

  it("rejects a field name the form does not collect", () => {
    expect(() => comparisonFieldLabel("nope" as keyof RawInputs)).toThrow(
      "unknown field nope",
    );
  });

  it("accepts the inclusive edges of each range", () => {
    const decision = assessHousingDecision({
      ...sampleInputs,
      downPayment: 0,
      mortgageRatePercent: 25,
      termYears: 40,
      rentGrowthPercent: 20,
      taxPercent: 10,
      maintenancePercent: 0,
      monthlyRent: 0,
      insuranceAnnual: 0,
      appreciationPercent: -20,
      investmentReturnPercent: 30,
    });
    expect(decision.status).toBe("ready");
    if (decision.status === "ready") {
      expect(decision.horizonYears).toBe(40);
    }
  });
});
