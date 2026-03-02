import { CategoryTableDummy } from '#/components/admin/CetegoryTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/kategori')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <CategoryTableDummy />  
  </div>
}
