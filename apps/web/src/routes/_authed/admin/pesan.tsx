import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/pesan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/admin/pesan"!</div>
}
