import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Headline } from "../../app/components/atoms/headline";

const meta = {
  title: "Atoms/Headline",
  component: Headline,
  tags: ["autodocs"],
  args: {
    children: "Rent or Buy? Let the numbers decide.",
  },
} satisfies Meta<typeof Headline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Rent or Buy? Let the numbers decide." }),
    ).toBeInTheDocument();
  },
};
