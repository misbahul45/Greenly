import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/regiister')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/regiister"!</div>
}
