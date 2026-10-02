export const MAJOR_CURRENCIES = [
  { code: "USD", name: "US dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British pound" },
  { code: "JPY", name: "Japanese yen" },
  { code: "CNY", name: "Chinese yuan" },
  { code: "AUD", name: "Australian dollar" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "CHF", name: "Swiss franc" },
  { code: "HKD", name: "Hong Kong dollar" },
  { code: "SGD", name: "Singapore dollar" },
  { code: "SEK", name: "Swedish krona" },
  { code: "NOK", name: "Norwegian krone" },
  { code: "DKK", name: "Danish krone" },
  { code: "NZD", name: "New Zealand dollar" },
  { code: "KRW", name: "South Korean won" },
  { code: "INR", name: "Indian rupee" },
  { code: "MXN", name: "Mexican peso" },
  { code: "BRL", name: "Brazilian real" },
  { code: "ZAR", name: "South African rand" },
  { code: "TRY", name: "Turkish lira" },
  { code: "AED", name: "UAE dirham" },
  { code: "SAR", name: "Saudi riyal" },
  { code: "PLN", name: "Polish zloty" },
  { code: "THB", name: "Thai baht" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "MYR", name: "Malaysian ringgit" },
  { code: "PHP", name: "Philippine peso" },
  { code: "TWD", name: "New Taiwan dollar" },
  { code: "ILS", name: "Israeli shekel" },
  { code: "CZK", name: "Czech koruna" },
  { code: "HUF", name: "Hungarian forint" },
  { code: "RON", name: "Romanian leu" },
  { code: "CLP", name: "Chilean peso" },
] as const;

export type CurrencyCode = (typeof MAJOR_CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

const CODES = new Set<string>(MAJOR_CURRENCIES.map((entry) => entry.code));

export function isMajorCurrency(code: string): code is CurrencyCode {
  return CODES.has(code);
}

export function amountSuffix(
  code: string,
  period?: "month" | "year",
): string {
  const label = isMajorCurrency(code) ? code : DEFAULT_CURRENCY;
  if (period === "month") {
    return `${label} per month`;
  }
  if (period === "year") {
    return `${label} per year`;
  }
  return label;
}
