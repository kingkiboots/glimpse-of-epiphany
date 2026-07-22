import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ImageBox from './ImageBox'

const meta = {
  title: 'shared/ui/ImageBox',
  component: ImageBox,
  tags: ['autodocs'],
  args: {
    file: null,
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200, height: 200, padding: 24, background: 'var(--color-bg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageBox>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: function Render(args) {
    const [file, setFile] = useState<File | null>(null)
    return <ImageBox {...args} file={file} onChange={setFile} />
  },
}
