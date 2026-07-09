"use client"

import { Bell, Menu, Search, Settings } from "lucide-react"

type HeaderProps = {
  title?: string
  onOpenSidebar?: () => void
  userName?: string
  userEmail?: string
}

export default function Header({
  onOpenSidebar,
  userName,
}: HeaderProps) {
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

          {userName && (
            <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-gray-800">
                  {userName}
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D1A87A] font-semibold text-white">
                {userName.slice(0, 1)}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
