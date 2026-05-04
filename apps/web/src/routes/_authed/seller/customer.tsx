import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/seller/customer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/seller/customer"!</div>
}
