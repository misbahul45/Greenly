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
import { Badge } from "#/components/ui/badge";
import { dummyOrders, type Order } from "#/constants/dummy.table";

type SortOrder = "asc" | "desc";
type StatusFilter = Order["status"] | "ALL";

const STATUS_LABEL: Record<Order["status"], string> = {
  PENDING: "Menunggu",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

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

function getStatusClass(status: Order["status"]) {
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (status === "PAID") return "bg-blue-100 text-blue-700";
  if (status === "PROCESSING") return "bg-purple-100 text-purple-700";
  if (status === "SHIPPED") return "bg-indigo-100 text-indigo-700";
  if (status === "COMPLETED") return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-700";
}

export function OrderTableDummy() {
  const [data, setData] = React.useState<Order[]>(dummyOrders);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Order>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>("ALL");

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const [openConfirmModal, setOpenConfirmModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Order | null>(null);
  const [pendingStatus, setPendingStatus] =
    React.useState<Order["status"] | null>(null);

  const filtered = sortData(
    data.filter((o) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        o.orderNumber.toLowerCase().includes(keyword) ||
        o.customerName.toLowerCase().includes(keyword) ||
        o.shopName.toLowerCase().includes(keyword);

      const matchStatus = filterStatus === "ALL" || o.status === filterStatus;

      return matchSearch && matchStatus;
    }),
    sortKey,
    sortOrder
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
    setData((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const openConfirm = (item: Order, status: Order["status"]) => {
    setSelectedItem(item);
    setPendingStatus(status);
    setOpenConfirmModal(true);
  };

  const handleConfirm = () => {
    if (!selectedItem || !pendingStatus) return;

    updateStatus(selectedItem.id, pendingStatus);

    if (pendingStatus === "PAID") {
      toast.success("Pembayaran dikonfirmasi", {
        description: `${selectedItem.orderNumber} telah dikonfirmasi.`,
        position: "bottom-right",
      });
    }

    if (pendingStatus === "COMPLETED") {
      toast.success("Pesanan diselesaikan", {
        description: `${selectedItem.orderNumber} ditandai selesai.`,
        position: "bottom-right",
      });
    }

    setOpenConfirmModal(false);
    setSelectedItem(null);
    setPendingStatus(null);
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari nomor order, customer, atau toko..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
            className="h-10 rounded-md border bg-background px-3 text-sm font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Dibayar</option>
            <option value="PROCESSING">Diproses</option>
            <option value="SHIPPED">Dikirim</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortKey("createdAt");
              setSortOrder(e.target.value as SortOrder);
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm font-medium"
          >
            <option value="desc">Tanggal Terbaru</option>
            <option value="asc">Tanggal Terlama</option>
          </select>
        </div>
      </div>

      <Table className="w-full table-fixed text-sm">
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[13%] cursor-pointer select-none"
              onClick={() => handleSort("orderNumber")}
            >
              No. Order{sortIcon("orderNumber")}
            </TableHead>

            <TableHead
              className="w-[15%] cursor-pointer select-none"
              onClick={() => handleSort("customerName")}
            >
              Customer{sortIcon("customerName")}
            </TableHead>

            <TableHead
              className="w-[15%] cursor-pointer select-none"
              onClick={() => handleSort("shopName")}
            >
              Toko{sortIcon("shopName")}
            </TableHead>

            <TableHead
              className="w-[13%] cursor-pointer select-none"
              onClick={() => handleSort("totalAmount")}
            >
              Total{sortIcon("totalAmount")}
            </TableHead>

            <TableHead
              className="w-[13%] cursor-pointer select-none"
              onClick={() => handleSort("status")}
            >
              Status{sortIcon("status")}
            </TableHead>

            <TableHead className="w-[12%]">Tanggal</TableHead>

            <TableHead className="w-[19%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="truncate font-medium">
                {o.orderNumber}
              </TableCell>

              <TableCell className="truncate">{o.customerName}</TableCell>

              <TableCell className="truncate">{o.shopName}</TableCell>

              <TableCell className="truncate">
                Rp {o.totalAmount.toLocaleString("id-ID")}
              </TableCell>

              <TableCell>
                <Badge className={`text-xs ${getStatusClass(o.status)}`}>
                  {STATUS_LABEL[o.status]}
                </Badge>
              </TableCell>

              <TableCell className="truncate">
                {o.createdAt.toLocaleDateString("id-ID")}
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => setSelectedOrder(o)}
                  >
                    Lihat
                  </Button>

                  {o.status === "PENDING" && (
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openConfirm(o, "PAID")}
                    >
                      Konfirmasi Bayar
                    </Button>
                  )}

                  {o.status === "SHIPPED" && (
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openConfirm(o, "COMPLETED")}
                    >
                      Selesaikan
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-muted-foreground"
              >
                Tidak ada pesanan ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <div>
              <h2 className="text-lg font-semibold">Detail Pesanan</h2>
              <p className="text-sm text-muted-foreground">
                Informasi lengkap pesanan yang dipilih.
              </p>
            </div>

            <div className="space-y-3 rounded-md border p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">No. Order</span>
                <span className="text-right font-medium">
                  {selectedOrder.orderNumber}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Customer</span>
                <span className="text-right font-medium">
                  {selectedOrder.customerName}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Toko</span>
                <span className="text-right font-medium">
                  {selectedOrder.shopName}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-right font-medium">
                  Rp {selectedOrder.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusClass(selectedOrder.status)}>
                  {STATUS_LABEL[selectedOrder.status]}
                </Badge>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="text-right font-medium">
                  {selectedOrder.createdAt.toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {openConfirmModal && selectedItem && pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">
              {pendingStatus === "PAID"
                ? "Konfirmasi Pembayaran"
                : "Selesaikan Pesanan"}
            </h2>

            <p className="text-sm text-muted-foreground">
              {pendingStatus === "PAID" ? (
                <>
                  Konfirmasi pembayaran untuk pesanan{" "}
                  <span className="font-medium text-foreground">
                    {selectedItem.orderNumber}
                  </span>
                  ?
                </>
              ) : (
                <>
                  Tandai pesanan{" "}
                  <span className="font-medium text-foreground">
                    {selectedItem.orderNumber}
                  </span>{" "}
                  sebagai selesai?
                </>
              )}
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenConfirmModal(false)}
              >
                Batal
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleConfirm}
              >
                {pendingStatus === "PAID" ? "Konfirmasi" : "Selesaikan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}