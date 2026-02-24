import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/pesanan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/pesanan"!</div>
}
