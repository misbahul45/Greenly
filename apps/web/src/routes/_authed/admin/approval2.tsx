import { createFileRoute, redirect } from "@tanstack/react-router"

/*
 * Halaman ini adalah versi lama/duplikat dari /_authed/admin/approval.
 * Semua fungsionalitas sudah tersedia di halaman approval dengan koneksi API penuh.
 */

export const Route = createFileRoute("/_authed/admin/approval2")({
  beforeLoad: () => {
    throw redirect({ to: "/_authed/admin/approval" })
  },
  component: () => null,
})
