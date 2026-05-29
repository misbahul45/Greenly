import { CategoryTable } from '#/components/admin/CategoryTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/kategori')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Kategori</h1>
        <p className="text-sm text-muted-foreground">
          Kelola kategori produk untuk marketplace.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
        <CategoryTable />
      </div>
    </div>
  )
}
