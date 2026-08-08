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
        // 배경은 뷰포트에 고정하고 문서가 스크롤되는 ScreenBackground의 구조를 흉내낸다.
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              background: `center / cover no-repeat url("${bgImageUrl}")`,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              color: "var(--color-text)",
            }}
          >
            <Story />
          </div>
        </>
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

/** footerPlacement="flow". 하단이 바닥으로 내려가지 않고 본문 바로 뒤에 이어붙는다. */
export const FlowingFooter: Story = {
  args: {
    footerPlacement: "flow",
    children: <p>로딩·완료·에러 화면처럼 하단이 본문의 연장인 경우.</p>,
    footer: <p>에베소서 5:20</p>,
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
