import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/user/data')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/user/data"!</div>
}
