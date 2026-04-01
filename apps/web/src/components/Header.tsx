"use client"

import * as React from "react"
import { Menu, Search, Bell, Settings } from "lucide-react"

type HeaderProps = {
  onOpenSidebar?: () => void
  userName?: string
  userEmail?: string
}

export default function Header({
  onOpenSidebar,
  userName = "Super Admin"
  // userEmail = "super.admin@greenly.com",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-[#F9FAFB]">
      <div className="flex items-center gap-4 px-4 py-3">

        {/* LEFT: MENU */}
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* SEARCH BAR */}
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

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATION */}
          <button className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* SETTINGS */}
          <button>
            <Settings className="h-5 w-5 text-gray-600" />
          </button>

          {/* USER INFO */}
          <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
            
            {/* TEXT */}
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-gray-800">
                {userName}
              </div>
              {/* <div className="text-xs text-gray-500">
                {userEmail}
              </div> */}
            </div>

            {/* AVATAR */}
            <div className="h-10 w-10 rounded-xl bg-[#D1A87A] flex items-center justify-center text-white font-semibold">
              {userName?.slice(0, 1)}
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}