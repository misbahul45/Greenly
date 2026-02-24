"use client"

import * as React from "react"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import SidebarAdmin from "../components/SidebarAdmin"
import Header from "../components/Header"

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
})

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-[#F5F1E8]">
      <SidebarAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          title="Dashboard"
          userName="Admin"
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Biar kelihatan layoutnya kepanggil */}
        {/* <div className="px-4 pt-2 text-xs opacity-60">ADMIN LAYOUT AKTIF ✅</div> */}

        <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}