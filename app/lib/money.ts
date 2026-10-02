import { DEFAULT_CURRENCY, isMajorCurrency } from "./currencies";

const wholeFormatters = new Map<string, Intl.NumberFormat>();
const paymentFormatters = new Map<string, Intl.NumberFormat>();

function currencyCode(currency: string): string {
  return isMajorCurrency(currency) ? currency : DEFAULT_CURRENCY;
}

function wholeFormatter(currency: string): Intl.NumberFormat {
  const code = currencyCode(currency);
  const cached = wholeFormatters.get(code);
  if (cached) {
    return cached;
  }
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  wholeFormatters.set(code, formatter);
  return formatter;
}

function paymentFormatter(currency: string): Intl.NumberFormat {
  const code = currencyCode(currency);
  const cached = paymentFormatters.get(code);
  if (cached) {
    return cached;
  }
  const digits =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).resolvedOptions().maximumFractionDigits ?? 0;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  paymentFormatters.set(code, formatter);
  return formatter;
}

export function formatWholeDollars(value: number, currency = DEFAULT_CURRENCY): string {
  return wholeFormatter(currency).format(Math.round(value));
}

export function formatPayment(value: number, currency = DEFAULT_CURRENCY): string {
  return paymentFormatter(currency).format(value);
}
