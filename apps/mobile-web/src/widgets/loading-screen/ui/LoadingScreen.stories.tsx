import type { Meta, StoryObj } from '@storybook/react-vite'
import LoadingScreen from './LoadingScreen'

const meta = {
  title: 'widgets/LoadingScreen',
  component: LoadingScreen,
  tags: ['autodocs'],
  args: {
    title: '일상 속 감사 찾기',
    verseReference: '데살로니가전서 5:18',
    verseText:
      '범사에 감사하라\n이것이 그리스도 예수 안에서\n너희를 향하신 하나님의 뜻이니라.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 375, height: 812 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoadingScreen>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
