import ConfirmPage from '@/pages/confirm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/confirm')({
  component: ConfirmPage,
})
