import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/dashboard2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/admin/dashboard2"!</div>
}
