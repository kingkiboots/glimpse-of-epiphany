import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ImageBox from "@/shared/ui/ImageBox";
import Panel from "./Panel";

const meta = {
  title: "shared/ui/Panel",
  component: Panel,
  tags: ["autodocs"],
  args: {
    children: null,
  },
  decorators: [
    (Story) => (
      // liquid-glass-react가 그리는 레이어는 전부 position:absolute라 이 래퍼가
      // 흐름으로 스스로 높이를 확보하지 못한다. 명시적 minHeight가 없으면 이 데코레이터가
      // padding만큼으로 찌그러지고, Panel의 top/left 50% 중앙 정렬 기준점도 같이 찌그러진다.
      <div
        style={{
          position: "relative",
          minHeight: 480,
          padding: 24,
          background: "var(--color-bg)",
        }}
      >
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
      <Panel radius="image" padding="8px" width={272} height={247}>
        <ImageBox file={file} onChange={setFile} />
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
        <div style={{ width: 251, height: 228 }}>
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
