import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AssumptionList } from "../../app/components/organisms/assumption-list";
import { DecisionFields } from "../../app/components/organisms/decision-fields";
import { YearComparison } from "../../app/components/organisms/year-comparison";
import { DecisionLayout } from "../../app/components/templates/decision-layout";
import { VerdictBlock } from "../../app/components/molecules/verdict-block";
import { readySample, sampleFields, sampleFieldValues } from "../fixtures";

const sample = readySample();

const meta = {
  title: "Templates/Decision layout",
  component: DecisionLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    headline: "Rent or Buy? Let the numbers decide.",
    lede: "One page for your price, rent, and loan. No account.",
    verdict: (
      <VerdictBlock
        updating={false}
        message="Owning is ahead from year 1."
        payment={sample.monthlyPayment}
        tone="own"
      />
    ),
    fields: (
      <DecisionFields
        sampleNote="These entries start as a sample, not a forecast."
        currency="USD"
        fields={sampleFields("USD", sampleFieldValues())}
        onChange={() => undefined}
        onCurrencyChange={() => undefined}
      />
    ),
    table: <YearComparison columns={sample.columns} hiddenMessage={null} />,
    assumptions: (
      <AssumptionList items={["Figures are nominal USD. The loan is the price minus the down payment."]} />
    ),
  },
} satisfies Meta<typeof DecisionLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sample: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Rent or Buy? Let the numbers decide." })).toBeInTheDocument();
    await expect(canvas.getByLabelText("Currency")).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Years 5, 10, and 20" })).toBeInTheDocument();
  },
};
