import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/kategori')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/kategori"!</div>
}
