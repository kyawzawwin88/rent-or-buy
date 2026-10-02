import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FieldLabel } from "../../app/components/atoms/field-label";

const meta = {
  title: "Atoms/Field label",
  component: FieldLabel,
  tags: ["autodocs"],
  args: {
    htmlFor: "price",
    children: "Home price",
  },
} satisfies Meta<typeof FieldLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Home price").tagName).toBe("LABEL");
  },
};
