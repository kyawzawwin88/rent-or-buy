export function verdictSentence(breakEvenYear: number | null): string {
  if (breakEvenYear === 1) {
    return "Owning is ahead from year 1.";
  }
  if (breakEvenYear === null) {
    return "Renting stays ahead through the horizon.";
  }
  return `Owning pulls ahead in year ${breakEvenYear}.`;
}
