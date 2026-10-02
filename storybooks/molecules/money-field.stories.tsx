import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { MoneyField } from "../../app/components/molecules/money-field";

const meta = {
  title: "Molecules/Money field",
  component: MoneyField,
  tags: ["autodocs"],
  args: {
    id: "price",
    label: "Home price",
    suffix: "USD",
    value: "100000",
    invalid: false,
    invalidLabel: "price",
    onChange: () => undefined,
  },
} satisfies Meta<typeof MoneyField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Home price")).toHaveValue("100000");
    await expect(canvas.getByText("USD")).toBeInTheDocument();
  },
};

export const Invalid: Story = {
  args: {
    value: "0",
    invalid: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Check the price.")).toBeInTheDocument();
  },
};

export const Editable: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <MoneyField {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Home price");
    await userEvent.clear(input);
    await userEvent.type(input, "8");
    await expect(input).toHaveValue("8");
  },
};
