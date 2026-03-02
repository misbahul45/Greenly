import { ShopTableDummy } from '#/components/admin/TokoTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/toko')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <ShopTableDummy />
  </div>
}
