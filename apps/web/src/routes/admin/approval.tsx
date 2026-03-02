import { ApprovalTableDummy } from '#/components/admin/ApprovalTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/approval')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <ApprovalTableDummy />
  </div>
}
