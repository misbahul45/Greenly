import { ApprovalTable } from '#/components/admin/ApprovalTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/admin/approval')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Persetujuan Toko</h1>
        <p className="text-sm text-muted-foreground">
          Tinjau dan proses pengajuan pembukaan toko baru.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5">
        <ApprovalTable />
      </div>
    </div>
  )
}
