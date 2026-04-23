import { OrderTableDummy } from '#/components/admin/PesananTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/pesanan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <OrderTableDummy />
  </div>
}
