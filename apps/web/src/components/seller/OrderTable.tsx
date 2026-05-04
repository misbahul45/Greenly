import * as React from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { dummyOrders, type Order } from "#/constants/dummy.table";

type SortOrder = "asc" | "desc";

const STATUS_OPTIONS: Order["status"][] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

function generateOrderNumber(index: number) {
  return `ORD-${String(index + 1).padStart(4, "0")}`;
}

function getStatusLabel(status: Order["status"]): string {
  const labels: Record<Order["status"], string> = {
    PENDING: "Menunggu",
    PAID: "Dibayar",
    PROCESSING: "Diproses",
    SHIPPED: "Dikirim",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };
  return labels[status];
}

function sortData<T>(data: T[], key: keyof T, order: SortOrder): T[] {
  return [...data].sort((a, b) => {
    const av = (a[key] ?? "") as any;
    const bv = (b[key] ?? "") as any;

    if (typeof av === "string") {
      return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }

    if (typeof av === "number") {
      return order === "asc" ? av - bv : bv - av;
    }

    if (av instanceof Date) {
      return order === "asc"
        ? av.getTime() - bv.getTime()
        : bv.getTime() - av.getTime();
    }

    return 0;
  });
}

export function OrderTableDummy() {
  const [data, setData] = React.useState<Order[]>(
    dummyOrders.map((order, index) => ({
      ...order,
      orderNumber: generateOrderNumber(index),
    })),
  );

  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Order>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [selectedItem, setSelectedItem] = React.useState<Order | null>(null);
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [openCancelModal, setOpenCancelModal] = React.useState(false);

  const filtered = sortData(
    data.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.shopName.toLowerCase().includes(search.toLowerCase()),
    ),
    sortKey,
    sortOrder,
  );

  const handleSort = (key: keyof Order) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortIcon = (key: keyof Order) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  const updateStatus = (id: string, status: Order["status"]) => {
    const item = data.find((o) => o.id === id);

    setData((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );

    toast.success("Status diperbarui", {
      description: `${item?.orderNumber} → ${getStatusLabel(status)}`,
      position: "bottom-right",
    });
  };

  const openDetail = (item: Order) => {
    setSelectedItem(item);
    setOpenDetailModal(true);
  };

  const openCancel = (item: Order) => {
    setSelectedItem(item);
    setOpenCancelModal(true);
  };

  const handleCancel = () => {
    if (!selectedItem) return;

    updateStatus(selectedItem.id, "CANCELLED");

    toast.error("Pesanan dibatalkan", {
      description: `${selectedItem.orderNumber} dibatalkan`,
      position: "bottom-right",
    });

    setOpenCancelModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari order / customer / toko..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("orderNumber")} className="cursor-pointer">
              No. Order{sortIcon("orderNumber")}
            </TableHead>
            <TableHead onClick={() => handleSort("customerName")} className="cursor-pointer">
              Customer{sortIcon("customerName")}
            </TableHead>
            <TableHead onClick={() => handleSort("shopName")} className="cursor-pointer">
              Toko{sortIcon("shopName")}
            </TableHead>
            <TableHead onClick={() => handleSort("totalAmount")} className="cursor-pointer">
              Total{sortIcon("totalAmount")}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
              Tanggal{sortIcon("createdAt")}
            </TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{o.orderNumber}</TableCell>
              <TableCell>{o.customerName}</TableCell>
              <TableCell>{o.shopName}</TableCell>
              <TableCell>Rp {o.totalAmount.toLocaleString("id-ID")}</TableCell>

              {/* ✅ STATUS DROPDOWN ONLY */}
              <TableCell>
                <select
                  value={o.status}
                  onChange={(e) =>
                    updateStatus(o.id, e.target.value as Order["status"])
                  }
                  className={[
                    "h-9 px-3 rounded-full text-sm font-medium border",
                    o.status === "PENDING" && "bg-green-100 text-green-700 border-green-200",
                    o.status === "PAID" && "bg-gray-100 text-gray-700 border-gray-200",
                    o.status === "PROCESSING" && "bg-gray-200 text-gray-800 border-gray-300",
                    o.status === "SHIPPED" && "bg-gray-200 text-gray-800 border-gray-300",
                    o.status === "COMPLETED" && "bg-gray-100 text-gray-700 border-gray-200",
                    o.status === "CANCELLED" && "bg-red-100 text-red-600 border-red-200",
                  ].join(" ")}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </TableCell>

              <TableCell>{o.createdAt.toLocaleDateString("id-ID")}</TableCell>

              {/* AKSI */}
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openDetail(o)}>
                  Lihat
                </Button>

                <Button
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => openCancel(o)}
                  disabled={o.status === "CANCELLED"}
                >
                  Batalkan
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                Tidak ada data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* MODAL DETAIL */}
      {openDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-semibold text-lg">Detail Pesanan</h2>

            <div className="text-sm space-y-2">
              <p><b>No:</b> {selectedItem.orderNumber}</p>
              <p><b>Customer:</b> {selectedItem.customerName}</p>
              <p><b>Toko:</b> {selectedItem.shopName}</p>
              <p><b>Total:</b> Rp {selectedItem.totalAmount.toLocaleString("id-ID")}</p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setOpenDetailModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCEL */}
      {openCancelModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold">Batalkan Pesanan</h2>
            <p className="text-sm">
              Yakin batalkan <b>{selectedItem.orderNumber}</b>?
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenCancelModal(false)}>
                Batal
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={handleCancel}
              >
                Ya, Batalkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}