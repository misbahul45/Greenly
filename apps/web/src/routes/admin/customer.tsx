import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/customer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/customer"!</div>
}
