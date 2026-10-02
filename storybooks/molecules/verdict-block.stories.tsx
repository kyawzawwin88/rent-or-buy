import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { VerdictBlock } from "../../app/components/molecules/verdict-block";

const meta = {
  title: "Molecules/Verdict",
  component: VerdictBlock,
  tags: ["autodocs"],
  args: {
    updating: false,
    message: "Owning is ahead from year 1.",
    payment: 479.64,
    tone: "own",
    currency: "USD",
  },
} satisfies Meta<typeof VerdictBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Owning is ahead from year 1.")).toBeInTheDocument();
    await expect(canvas.getByText("$479.64")).toBeInTheDocument();
  },
};

export const Updating: Story = {
  args: {
    updating: true,
    payment: 479.64,
    tone: "ink",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Updating")).toBeInTheDocument();
  },
};

export const HiddenPayment: Story = {
  args: {
    message: "Enter every field to see the comparison.",
    payment: null,
    tone: "ink",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/mortgage payment/i)).not.toBeInTheDocument();
  },
};
