"use client"

import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Bell, LogOut, Menu, Search, Settings } from "lucide-react"
import { toast } from "sonner"

import { logoutFn } from "#/server/auth"

type HeaderProps = {
  title?: string
  onOpenSidebar?: () => void
  userName?: string
  userEmail?: string
}

export default function Header({
  title,
  onOpenSidebar,
  userName = "Super Admin",
}: HeaderProps) {
  const navigate = useNavigate()
  const logout = useServerFn(logoutFn)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logout()
      toast.success("Logout berhasil", {
        position: "bottom-right",
      })
      await navigate({ to: "/auth/login" })
    } catch (error: any) {
      toast.error("Logout gagal", {
        description: error.message ?? "Terjadi kesalahan",
        position: "bottom-right",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-[#F9FAFB]">
      <div className="flex items-center gap-4 px-4 py-3">
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm sm:hidden"
            aria-label="Buka sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex-1">
          {title && (
            <p className="mb-1 text-xs font-medium text-gray-500">{title}</p>
          )}
          <div className="flex items-center gap-2 rounded-full bg-[#E5E7EB] px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Cari data, pesanan, atau toko..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" className="relative" aria-label="Notifikasi">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button type="button" aria-label="Pengaturan">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-gray-800">
                {userName}
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D1A87A] font-semibold text-white">
              {userName?.slice(0, 1)}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
