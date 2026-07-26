import type { Meta, StoryObj } from "@storybook/react-vite";
import Typography from "./Typography";

const meta = {
  title: "shared/ui/Typography",
  component: Typography,
  tags: ["autodocs"],
  args: {
    children: "일상 속 감사 찾기",
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Title: Story = {
  args: { variant: "title" },
};

export const Body: Story = {
  args: { variant: "body" },
};

export const Caption: Story = {
  args: { variant: "caption" },
};

export const ButtonText: Story = {
  args: { variant: "button" },
};

export const Small: Story = {
  args: { variant: "small" },
};

export const Tiny: Story = {
  args: { variant: "tiny" },
};
