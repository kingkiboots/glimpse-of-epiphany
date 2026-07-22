import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Input from './Input'

const meta = {
  title: 'shared/ui/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    value: '',
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 272, padding: 24, background: 'var(--color-bg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('')
    return (
      <Input
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="내용을 입력해주세요."
      />
    )
  },
}

export const Filled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('범사에 감사하라')
    return (
      <Input
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="내용을 입력해주세요."
      />
    )
  },
}
