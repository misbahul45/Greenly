import * as React from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { dummyOrders, type Order } from "#/constants/dummy.table";

// ─── helpers ────────────────────────────────────────────────────────────────

type SortOrder = "asc" | "desc";

function sortData<T>(data: T[], key: keyof T, order: SortOrder): T[] {
  return [...data].sort((a, b) => {
    const av = (a[key] ?? "") as any;
    const bv = (b[key] ?? "") as any;
    if (typeof av === "string") return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    if (typeof av === "number") return order === "asc" ? av - bv : bv - av;
    if (av instanceof Date) return order === "asc" ? av.getTime() - bv.getTime() : bv.getTime() - av.getTime();
    return 0;
  });
}

function getStatusVariant(status: Order["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "COMPLETED") return "outline";
  if (status === "CANCELLED") return "destructive";
  if (status === "PENDING") return "default";
  return "secondary";
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

// ─── component ───────────────────────────────────────────────────────────────

export function OrderTableDummy() {
  const [data, setData] = React.useState<Order[]>(dummyOrders);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Order>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [openCancelModal, setOpenCancelModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Order | null>(null);

  // ── derived ──────────────────────────────────────────────────────────────

  const filtered = sortData(
    data.filter((o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.shopName.toLowerCase().includes(search.toLowerCase())
    ),
    sortKey,
    sortOrder,
  );

  // ── sort ─────────────────────────────────────────────────────────────────

  const handleSort = (key: keyof Order) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const sortIcon = (key: keyof Order) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  // ── action handlers ──────────────────────────────────────────────────────

  const updateStatus = (id: string, status: Order["status"]) => {
    const item = data.find((o) => o.id === id);
    setData((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    if (status === "PROCESSING") {
      toast.success("Pesanan diproses", {
        description: `${item?.orderNumber} sedang diproses.`,
        position: "bottom-right",
      });
    } else if (status === "SHIPPED") {
      toast.success("Pesanan dikirim", {
        description: `${item?.orderNumber} telah dikirim ke customer.`,
        position: "bottom-right",
      });
    }
  };

  const openCancel = (item: Order) => {
    setSelectedItem(item);
    setOpenCancelModal(true);
  };

  const handleCancel = () => {
    if (!selectedItem) return;
    updateStatus(selectedItem.id, "CANCELLED");
    toast.error("Pesanan dibatalkan", {
      description: `${selectedItem.orderNumber} telah dibatalkan.`,
      position: "bottom-right",
    });
    setOpenCancelModal(false);
    setSelectedItem(null);
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari nomor order, customer, atau toko..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear</Button>
        )}
      </div>

      {/* table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("orderNumber")}>No. Order{sortIcon("orderNumber")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("customerName")}>Customer{sortIcon("customerName")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("shopName")}>Toko{sortIcon("shopName")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("totalAmount")}>Total{sortIcon("totalAmount")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>Status{sortIcon("status")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>Tanggal{sortIcon("createdAt")}</TableHead>
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
              <TableCell>
                <Badge variant={getStatusVariant(o.status)}>
                  {getStatusLabel(o.status)}
                </Badge>
              </TableCell>
              <TableCell>{o.createdAt.toLocaleDateString("id-ID")}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline">Lihat</Button>
                {o.status === "PENDING" && (
                  <Button size="sm" variant="destructive" onClick={() => openCancel(o)}>Batalkan</Button>
                )}
                {o.status === "PAID" && (
                  <Button size="sm" onClick={() => updateStatus(o.id, "PROCESSING")}>Proses</Button>
                )}
                {o.status === "PROCESSING" && (
                  <Button size="sm" onClick={() => updateStatus(o.id, "SHIPPED")}>Kirim</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                Tidak ada pesanan ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* modal konfirmasi batalkan */}
      {openCancelModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Batalkan Pesanan</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin membatalkan pesanan{" "}
              <span className="font-medium text-foreground">{selectedItem.orderNumber}</span>?{" "}
              Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenCancelModal(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleCancel}>Batalkan Pesanan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
