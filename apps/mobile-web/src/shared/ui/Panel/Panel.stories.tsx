import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ImageBox from "@/shared/ui/ImageBox";
import Panel from "./Panel";

const BG_IMAGES = [
  "감성.webp",
  "공통.webp",
  "날씨.webp",
  "연인.webp",
  "자연.webp",
  "친구.webp",
];

const meta = {
  title: "shared/ui/Panel",
  component: Panel,
  tags: ["autodocs"],
  args: {
    children: null,
  },
  decorators: [
    (Story) => {
      // 실제 화면(빔프로젝터/모바일)에서 Panel은 배경 사진 위에 얹히므로, 스토리북에서도
      // 단색 대신 public/img의 사진 중 하나를 매 렌더마다 무작위로 깔아 실제 유리 효과를 확인한다.
      const bgImage = useMemo(
        () => BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)],
        [],
      );

      return (
        // liquid-glass-react가 그리는 레이어는 전부 position:absolute라 이 래퍼가
        // 흐름으로 스스로 높이를 확보하지 못한다. 명시적 minHeight가 없으면 이 데코레이터가
        // padding만큼으로 찌그러지고, Panel의 top/left 50% 중앙 정렬 기준점도 같이 찌그러진다.
        <div
          style={{
            position: "relative",
            minHeight: 480,
            background: `center / cover no-repeat url("/img/${encodeURIComponent(bgImage)}")`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Story />
        </div>
      );
    },
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
      <Panel radius="panel" padding="8px" width={272} height={247}>
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
        width={272}
        radius="panel"
        padding="11px"
        style={{
          width: 272,

          minHeight: "388px",
        }}
      >
        <div
          className="container"
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          <div className="img-area" style={{ width: "100%", height: 228 }}>
            <ImageBox file={file} onChange={setFile} />
          </div>
          <div
            className="text-area"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 24,

              // font
              color: "var(--color-text)",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: "normal",
              textTransform: "capitalize",
            }}
          >
            <p
              style={{
                textShadow: "var(--shadow-text)",
                fontFamily: "var(--font-display)",
                fontSize: "var(--font-size-small)",
              }}
            >
              감사한 날이었다~~
              <br /> 너무 좋다~~~~
              <br /> 행복하고 하나님 너무 좋다~~~~
              <br /> 조금 안감사했지만 돌아보니 감사하다
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--font-size-caption)",
              }}
            >
              2026.08.14
              <br /> 삶으로 쓰는 예배전 (展)
            </p>
          </div>
        </div>
      </Panel>
    );
  },
};
