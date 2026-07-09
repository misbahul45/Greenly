import { CategoryTable } from '#/components/admin/CategoryTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/kategori')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <CategoryTable />  
  </div>
}
