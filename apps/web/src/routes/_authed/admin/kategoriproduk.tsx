import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/kategoriproduk')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/admin/kategoriproduk"!</div>
}
