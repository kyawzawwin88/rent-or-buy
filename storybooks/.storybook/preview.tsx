import type { Preview } from "@storybook/react-vite";
import "@fontsource/public-sans/400.css";
import { WorkshopSwitch } from "../../app/components/molecules/workshop-switch";
import "../../app/tailwind.css";

const storybookUrl = (import.meta.env as { STORYBOOK_URL?: string }).STORYBOOK_URL?.trim() || null;

const preview: Preview = {
  parameters: {
    layout: "padded",
    a11y: {
      test: "error",
    },
  },
  decorators: [
    (Story, context) => (
      <div className="bg-canvas font-sans text-ink antialiased">
        {context.parameters.workshopSwitch === false ? null : (
          <div className="mb-6 flex justify-end">
            <WorkshopSwitch current="storybook" storybookUrl={storybookUrl} />
          </div>
        )}
        <Story />
      </div>
    ),
  ],
};

export default preview;
