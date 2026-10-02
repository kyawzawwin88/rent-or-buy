import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { FieldLabel } from "../../app/components/atoms/field-label";
import { NumberInput } from "../../app/components/atoms/number-input";

const meta = {
  title: "Atoms/Number input",
  component: NumberInput,
  tags: ["autodocs"],
  args: {
    id: "price",
    value: "100000",
    invalid: false,
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div>
        <FieldLabel htmlFor="price">Home price</FieldLabel>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const Invalid: Story = {
  args: {
    value: "0",
    invalid: true,
    describedBy: "price-error",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toBeInvalid();
  },
};

export const Editable: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "250000");
    await expect(input).toHaveValue("250000");
  },
};
