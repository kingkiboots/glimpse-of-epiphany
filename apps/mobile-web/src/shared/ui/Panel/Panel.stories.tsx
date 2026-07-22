import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ImageBox from "@/shared/ui/ImageBox";
import Panel from "./Panel";

const meta = {
  title: "shared/ui/Panel",
  component: Panel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ padding: 24, background: "var(--color-bg)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div style={{ width: 272, height: 114 }} />,
  },
};

export const WithImageBox: Story = {
  render: function Render() {
    const [file, setFile] = useState<File | null>(null);
    return (
      <Panel style={{ width: 272, padding: 6, display: "flex" }}>
        <div style={{ width: "100%", aspectRatio: "251 / 228" }}>
          <ImageBox file={file} onChange={setFile} />
        </div>
      </Panel>
    );
  },
};

export const WithImageBoxAndText: Story = {
  render: function Render() {
    const [file, setFile] = useState<File | null>(null);
    return (
      <Panel
        style={{
          width: 272,
          padding: 8,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ width: "100%", aspectRatio: "251 / 228" }}>
          <ImageBox file={file} onChange={setFile} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p>
            감사한 날이었다~~
            <br /> 너무 좋다~~~~
            <br /> 행복하고 하나님 너무 좋다~~~~
            <br /> 조금 안감사했지만 돌아보니 감사하다
          </p>
          <p>
            2026.08.14
            <br /> 삶으로 쓰는 예배전 (展)
          </p>
        </div>
      </Panel>
    );
  },
};
