import { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@/shared/ui/Button";
import Panel from "@/shared/ui/Panel";
import { getRandomBackgroundImageUrl } from "@/shared/consts";
import PageShell from "./PageShell";

const meta = {
  title: "shared/ui/PageShell",
  component: PageShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      const bgImageUrl = useMemo(() => getRandomBackgroundImageUrl(), []);

      return (
        // 실제 화면과 같은 조건에서 봐야 스크롤 동작을 확인할 수 있다. 배경은 제자리에
        // 두고 그 위 층만 스크롤시키는 ScreenBackground의 구조를 그대로 흉내낸다.
        <div
          style={{
            height: "100dvh",
            overflow: "hidden",
            color: "var(--color-text)",
            background: `center / cover no-repeat url("${bgImageUrl}")`,
          }}
        >
          <div style={{ height: "100%", overflowY: "auto" }}>
            <Story />
          </div>
        </div>
      );
    },
  ],
} satisfies Meta<typeof PageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <p>
        셸이 그리는 건 제목뿐이다. 이 설명처럼
        <br />
        화면마다 성격이 다른 텍스트는 본문에 둔다.
      </p>
    ),
    footer: <Button>처음으로</Button>,
  },
};

/** 콘텐츠가 화면보다 길면 제목까지 포함해 화면 전체가 스크롤된다. */
export const Scrolling: Story = {
  args: {
    footer: <Button>작성 완료</Button>,
    children: (
      <>
        <Panel radius="panel" padding="8px" width={272} height={247}>
          <div />
        </Panel>
        <Panel radius="panel" padding="8px" width={272} height={247}>
          <div />
        </Panel>
      </>
    ),
  },
};
