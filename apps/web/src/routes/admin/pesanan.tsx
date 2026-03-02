import { OrderTableDummy } from '#/components/seller/OrderTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/pesanan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <OrderTableDummy />
  </div>
}
