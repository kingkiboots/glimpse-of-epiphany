import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ImageBox from "./ImageBox";
import Panel from "../Panel";

const meta = {
  title: "shared/ui/ImageBox",
  component: ImageBox,
  tags: ["autodocs"],
  args: {
    file: null,
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          padding: "16px 24px",
          background: "blue",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: function Render(args) {
    const [file, setFile] = useState<File | null>(null);
    return (
      <Panel radius="image" padding="8px" width={272} height={247}>
        <ImageBox {...args} file={file} onChange={setFile} />
      </Panel>
    );
  },
};
