import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { MoneyFigure } from "../../app/components/atoms/money-figure";

const meta = {
  title: "Atoms/Money figure",
  component: MoneyFigure,
  tags: ["autodocs"],
  args: {
    value: 44597,
    currency: "USD",
  },
} satisfies Meta<typeof MoneyFigure>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WholeDollars: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("$44,597")).toBeInTheDocument();
  },
};

export const Payment: Story = {
  args: {
    value: 479.64,
    cents: true,
    tone: "price",
  },
  render: (args) => (
    <p className="text-2xl leading-none">
      <MoneyFigure {...args} />
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("$479.64")).toBeInTheDocument();
  },
};

export const Euros: Story = {
  args: {
    value: 44597,
    currency: "EUR",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("€44,597")).toBeInTheDocument();
  },
};
