import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AssumptionList } from "../../app/components/organisms/assumption-list";

const meta = {
  title: "Organisms/Assumption list",
  component: AssumptionList,
  tags: ["autodocs"],
  args: {
    items: [
      "Figures are nominal USD. The loan is the price minus the down payment.",
      "Break-even is the first year owning net worth is at least renting net worth.",
    ],
  },
} satisfies Meta<typeof AssumptionList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "What the numbers include" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};
