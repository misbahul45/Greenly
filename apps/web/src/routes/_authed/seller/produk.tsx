import { ProductTableFull } from '#/components/seller/ProductTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/seller/produk')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <ProductTableFull />
  </div>
}
