import { verdictSentence } from "./verdict";

describe("verdict sentence", () => {
  it("reads ahead from year 1 when owning leads immediately", () => {
    expect(verdictSentence(1)).toBe("Owning is ahead from year 1.");
  });

  it("names the later year owning pulls ahead", () => {
    expect(verdictSentence(8)).toBe("Owning pulls ahead in year 8.");
  });

  it("says renting stays ahead when no year crosses", () => {
    expect(verdictSentence(null)).toBe(
      "Renting stays ahead through the horizon.",
    );
  });
});
