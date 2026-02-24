import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/toko')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/toko"!</div>
}
