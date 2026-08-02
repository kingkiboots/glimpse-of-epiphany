import type { Meta, StoryObj } from "@storybook/react-vite";
import ImageBox from "./ImageBox";
import Panel from "../Panel";

const meta = {
  title: "shared/ui/ImageBox",
  component: ImageBox,
  tags: ["autodocs"],
  args: {
    src: null,
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
    return (
      <Panel radius="panel" padding="8px" width={272} height={247}>
        <ImageBox {...args} />
      </Panel>
    );
  },
};

export const Filled: Story = {
  args: {
    src: "/img/친구.webp",
  },
  render: function Render(args) {
    return (
      <Panel radius="panel" padding="8px" width={272} height={247}>
        <ImageBox {...args} />
      </Panel>
    );
  },
};
