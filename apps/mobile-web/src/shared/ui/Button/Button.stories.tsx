import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "./Button";

const meta = {
  title: "shared/ui/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {args: {
  children: '일상 속 감사 찾기'
}};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "사진 선택하기",
  },
};
