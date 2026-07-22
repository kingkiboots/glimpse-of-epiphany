import type { Meta, StoryObj } from '@storybook/react-vite'
import Spinner from './Spinner'

const meta = {
  title: 'shared/ui/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: {
    size: 48,
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', padding: 24, background: 'var(--color-bg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spinner>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
  args: {
    size: 24,
  },
}
