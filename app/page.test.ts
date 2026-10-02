import { createElement, type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AssumptionList } from "./components/organisms/assumption-list";
import { DecisionFields } from "./components/organisms/decision-fields";
import { YearComparison } from "./components/organisms/year-comparison";
import { DecisionLayout } from "./components/templates/decision-layout";
import { VerdictBlock } from "./components/molecules/verdict-block";
import { MoneyFigure } from "./components/atoms/money-figure";
import { assessHousingDecision, sampleInputs } from "./lib/compare";
import Index from "./routes/_index";

function treeText(renderer: ReactTestRenderer): string {
  return JSON.stringify(renderer.toJSON());
}

function node(element: ReactElement): ReactTestRenderer {
  return create(element);
}

describe("page", () => {
  it("renders the sample comparison and updates after a field change", async () => {
    jest.useFakeTimers();
    let renderer: ReactTestRenderer | undefined;
    await act(async () => {
      renderer = node(createElement(Index));
    });
    if (!renderer) {
      throw new Error("page did not render");
    }
    expect(treeText(renderer)).toContain("Owning is ahead from year 1.");
    expect(treeText(renderer)).toContain("$479.64");
    expect(treeText(renderer)).toContain("$44,597");

    await act(async () => {
      renderer?.root.findByType("select").props.onChange({ target: { value: "EUR" } });
    });
    expect(renderer.root.findByType("select").props.value).toBe("EUR");
    expect(treeText(renderer)).toContain("€479.64");
    expect(treeText(renderer)).toContain("EUR per month");

    const priceInput = () =>
      renderer?.root.findAllByType("input").find((entry) => entry.props.id === "price");
    await act(async () => {
      priceInput()?.props.onChange({ target: { value: "" } });
    });
    expect(treeText(renderer)).toContain("Updating");
    await act(async () => {
      priceInput()?.props.onChange({ target: { value: "0" } });
    });
    expect(priceInput()?.props.value).toBe("0");
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(treeText(renderer)).toContain("No projection. Check the price.");
    jest.useRealTimers();
  });

  it("renders the empty, invalid, and ready pieces of the page", () => {
    const ready = assessHousingDecision(sampleInputs);
    if (ready.status !== "ready") {
      throw new Error("sample should project");
    }
    const hidden = node(
      createElement(YearComparison, {
        columns: null,
        hiddenMessage: "Enter every field to see the comparison.",
        busy: true,
      }),
    );
    expect(treeText(hidden)).toContain("Enter every field to see the comparison.");

    const years = node(
      createElement(YearComparison, {
        columns: ready.columns,
        hiddenMessage: null,
      }),
    );
    expect(treeText(years)).toContain("$80,775");

    const pending = node(
      createElement(VerdictBlock, {
        updating: true,
        message: "Owning is ahead from year 1.",
        payment: null,
        tone: "ink",
      }),
    );
    expect(treeText(pending)).toContain("Updating");
    const priced = node(
      createElement(VerdictBlock, {
        updating: false,
        message: "Renting stays ahead through the horizon.",
        payment: ready.monthlyPayment,
        tone: "rent",
      }),
    );
    expect(treeText(priced)).toContain("$479.64");
    expect(treeText(node(createElement(MoneyFigure, { value: 12 })))).toContain("$12");

    const changes: string[] = [];
    const fields = node(
      createElement(DecisionFields, {
        sampleNote: "These entries start as a sample, not a forecast.",
        currency: "USD",
        onCurrencyChange: () => {},
        onChange: (id: string, value: string) => changes.push(`${id}:${value}`),
        fields: [
          {
            id: "price",
            label: "Home price",
            suffix: "USD",
            value: "0",
            invalid: true,
            invalidLabel: "price",
          },
        ],
      }),
    );
    const form = fields.root.findByType("form");
    form.props.onSubmit({ preventDefault() {} });
    fields.root.findAllByType("input")[0]?.props.onChange({ target: { value: "10" } });
    expect(changes).toEqual(["price:10"]);
    expect(treeText(fields)).toContain("price-error");

    const layout = node(
      createElement(DecisionLayout, {
        headline: "Rent or Buy? Let the numbers decide.",
        lede: "One page for your price, rent, and loan.",
        verdict: "verdict",
        fields: "fields",
        table: "table",
        assumptions: createElement(AssumptionList, {
          items: ["Dollars are nominal USD."],
        }),
      }),
    );
    expect(treeText(layout)).toContain("What the numbers include");
    expect(treeText(layout)).toContain("Skip to the year table");
  });
});
