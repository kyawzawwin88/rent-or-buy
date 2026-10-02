import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { WorkshopSwitch } from "../../app/components/molecules/workshop-switch";

const meta = {
  title: "Molecules/Workshop switch",
  component: WorkshopSwitch,
  tags: ["autodocs"],
  parameters: { workshopSwitch: false },
  args: { current: "site" },
} satisfies Meta<typeof WorkshopSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnSite: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Site" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "Storybook" })).toBeInTheDocument();
  },
};

export const InStorybook: Story = {
  args: { current: "storybook" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Storybook" })).toHaveAttribute("aria-current", "page");
  },
};
