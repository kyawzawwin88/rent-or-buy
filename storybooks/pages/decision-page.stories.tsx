import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import Index from "../../app/routes/_index";

const meta = {
  title: "Pages/Decision page",
  component: Index,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Index>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sample: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Rent or Buy? Let the numbers decide." }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("$479.64")).toBeInTheDocument();
    await expect(canvas.getAllByText("$44,597").length).toBeGreaterThan(0);

    await userEvent.selectOptions(canvas.getByLabelText("Currency"), "EUR");
    await expect(canvas.getByText("€479.64")).toBeInTheDocument();
    await expect(canvas.getByText("EUR per month")).toBeInTheDocument();
    await expect(canvas.getAllByText("€44,597").length).toBeGreaterThan(0);

    const price = canvas.getByLabelText("Home price");
    await userEvent.clear(price);
    await waitFor(() => {
      expect(canvas.getAllByText("Enter every field to see the comparison.").length).toBeGreaterThan(0);
    });
  },
};
