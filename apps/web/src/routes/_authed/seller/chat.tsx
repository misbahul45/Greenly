import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_authed/seller/chat")({
  component: ChatPage,
})

function ChatPage() {
  const [selectedUser, setSelectedUser] = useState("Andi")

  const users = [
    { name: "Andi", last: "Apakah masih ada stok?", online: true },
    { name: "Siska", last: "Terima kasih ya kak", online: false },
    { name: "Budi", last: "Pengiriman berapa hari?", online: true },
  ]

  const [messages, setMessages] = useState([
    { from: "customer", text: "Halo kak" },
    { from: "seller", text: "Halo, ada yang bisa dibantu?" },
  ])

  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (!input) return
    setMessages([...messages, { from: "seller", text: input }])
    setInput("")
  }

  return (
    <div className="space-y-6">

      {/* ===== PERFORMA CHAT ===== */}
      <div className="space-y-6">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Performa Chat</h2>
          <p className="text-sm text-muted-foreground">
            Update terakhir: Hari ini, 09:00
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">

          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-muted-foreground">Jumlah Chat</p>
            <p className="text-2xl font-bold mt-2">1,284</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-muted-foreground">Chat Dibalas</p>
            <p className="text-2xl font-bold mt-2">98.5%</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-muted-foreground">Waktu Respons</p>
            <p className="text-2xl font-bold mt-2">&lt; 2 menit</p>
          </div>

        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-medium mb-2">Distribusi Balasan</p>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Semua chat dibalas oleh admin
          </p>
        </div>

      </div>

      {/* ===== CHAT LAYOUT ===== */}
      <div className="flex h-[500px] bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">

        {/* LEFT */}
        <div className="w-1/3 border-r">

          <div className="p-4 font-semibold border-b">
            Chat Customer
          </div>

          <div className="overflow-y-auto">

            {users.map((u, i) => (
              <div
                key={i}
                onClick={() => setSelectedUser(u.name)}
                className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                  selectedUser === u.name ? "bg-green-50" : ""
                }`}
              >
                <div className="flex justify-between">
                  <p className="font-medium">{u.name}</p>
                  {u.online && (
                    <span className="text-xs text-green-600">Online</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {u.last}
                </p>
              </div>
            ))}

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col">

          {/* HEADER */}
          <div className="p-4 border-b font-semibold">
            {selectedUser}
          </div>

          {/* CHAT */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.from === "seller"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-xl text-sm max-w-xs ${
                    msg.from === "seller"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

          </div>

          {/* INPUT */}
          <div className="p-4 border-t flex gap-2">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-4 rounded-lg"
            >
              Kirim
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}