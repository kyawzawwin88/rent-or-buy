import { amountSuffix, isMajorCurrency, MAJOR_CURRENCIES } from "./currencies";
import { formatPayment, formatWholeDollars } from "./money";

describe("money formatting", () => {
  it("rounds whole dollars to the nearest dollar", () => {
    expect(formatWholeDollars(44597.4)).toBe("$44,597");
    expect(formatWholeDollars(44596.6)).toBe("$44,597");
  });

  it("keeps cents on the mortgage payment", () => {
    expect(formatPayment(479.64)).toBe("$479.64");
  });

  it("formats the same numbers in another major currency", () => {
    expect(formatPayment(479.64, "EUR")).toBe("€479.64");
    expect(formatWholeDollars(44597, "GBP")).toBe("£44,597");
    expect(formatPayment(479.64, "JPY")).toBe("¥480");
    expect(formatWholeDollars(44597, "nope")).toBe("$44,597");
  });

  it("lists the major currencies once", () => {
    const codes = MAJOR_CURRENCIES.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(isMajorCurrency("USD")).toBe(true);
    expect(isMajorCurrency("EUR")).toBe(true);
    expect(isMajorCurrency("JPY")).toBe(true);
    expect(isMajorCurrency("XXX")).toBe(false);
    expect(amountSuffix("EUR", "month")).toBe("EUR per month");
    expect(amountSuffix("GBP", "year")).toBe("GBP per year");
  });
});
