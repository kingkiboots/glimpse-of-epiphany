import type { Meta, StoryObj } from "@storybook/react-vite";
import { getRandomBackgroundImageUrl } from "@/shared/consts";
import ScreenBackground from "./ScreenBackground";

const meta = {
  title: "shared/ui/ScreenBackground",
  component: ScreenBackground,
  tags: ["autodocs"],
  args: {
    backgroundImageUrl: getRandomBackgroundImageUrl(),
    children: null,
    scrim: true,
  },
  decorators: [
    (Story) => (
      <div style={{ height: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScreenBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutScrim: Story = {
  args: { scrim: false },
};
