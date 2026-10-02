import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DecisionFields } from "../../app/components/organisms/decision-fields";
import type { CurrencyCode } from "../../app/lib/currencies";
import { sampleFields, sampleFieldValues } from "../fixtures";

const meta = {
  title: "Organisms/Decision fields",
  component: DecisionFields,
  tags: ["autodocs"],
  args: {
    sampleNote: "These entries start as a sample, not a forecast.",
    currency: "USD",
    fields: sampleFields("USD", sampleFieldValues()),
    onChange: () => undefined,
    onCurrencyChange: () => undefined,
  },
} satisfies Meta<typeof DecisionFields>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sample: Story = {};

export const Changeable: Story = {
  render: (args) => {
    const [currency, setCurrency] = useState<CurrencyCode>(args.currency ?? "USD");
    const [values, setValues] = useState(sampleFieldValues());
    return (
      <DecisionFields
        {...args}
        currency={currency}
        onCurrencyChange={setCurrency}
        fields={sampleFields(currency, values)}
        onChange={(id, value) => setValues((current) => ({ ...current, [id]: value }))}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("Currency"), "EUR");
    await expect(canvas.getByText("EUR per month")).toBeInTheDocument();
    const price = canvas.getByLabelText("Home price");
    await userEvent.clear(price);
    await userEvent.type(price, "125000");
    await expect(price).toHaveValue("125000");
  },
};
