import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { YearComparison } from "../../app/components/organisms/year-comparison";
import { readySample } from "../fixtures";

const sample = readySample();

const meta = {
  title: "Organisms/Year comparison",
  component: YearComparison,
  tags: ["autodocs"],
  args: {
    columns: sample.columns,
    hiddenMessage: null,
    currency: "USD",
  },
} satisfies Meta<typeof YearComparison>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Years 5, 10, and 20" })).toBeInTheDocument();
    await expect(canvas.getAllByText("$44,597").length).toBeGreaterThan(0);
  },
};

export const Empty: Story = {
  args: {
    columns: null,
    hiddenMessage: "Enter every field to see the comparison.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Enter every field to see the comparison.")).toBeInTheDocument();
  },
};
