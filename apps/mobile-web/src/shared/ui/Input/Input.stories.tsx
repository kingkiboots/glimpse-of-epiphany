import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Input from "./Input";
import Panel from "../Panel";

const meta = {
  title: "shared/ui/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          minHeight: 480,
          background: `center / cover no-repeat url("/img/친구.webp")`,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <Panel radius="panel" padding="10px 12px" width={272}>
        <Input
          {...args}
          value={value}
          onChange={setValue}
        />
      </Panel>
    );
  },
};

export const Filled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("범사에 감사하라");
    return (
      <Panel radius="panel" padding="10px 12px" width={272}>
        <Input
          {...args}
          value={value}
          onChange={setValue}
        />
      </Panel>
    );
  },
};
