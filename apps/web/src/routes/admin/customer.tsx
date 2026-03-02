import { CustomerTableDummy } from '#/components/admin/CistomerTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/customer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <CustomerTableDummy />
  </div>
}
