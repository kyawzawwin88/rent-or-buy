import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { CurrencySelect } from "../../app/components/atoms/currency-select";
import type { CurrencyCode } from "../../app/lib/currencies";

const meta = {
  title: "Atoms/Currency select",
  component: CurrencySelect,
  tags: ["autodocs"],
  args: {
    id: "currency",
    value: "USD",
    onChange: () => undefined,
  },
} satisfies Meta<typeof CurrencySelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Changeable: Story = {
  render: (args) => {
    const [value, setValue] = useState<CurrencyCode>(args.value);
    return <CurrencySelect {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByLabelText("Currency");
    await userEvent.selectOptions(select, "GBP");
    await expect(select).toHaveValue("GBP");
    await expect(canvas.getByText(/No exchange rate/)).toBeInTheDocument();
  },
};
