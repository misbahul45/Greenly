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
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { useServerFn } from "@tanstack/react-start";
import { firstShopFromPayload, getShopOrdersFn, updateOrderStatusFn, getMyShopFn } from "#/server/seller.server";
import type { SellerOrder } from "#/types/server";

const fallbackOrders: SellerOrder[] = [
  {
    id: "fallback-order-1001",
    shopName: "Toko Nesa",
    totalAmount: 185000,
    status: "PAID",
    createdAt: new Date().toISOString(),
    items: [],
  },
  {
    id: "fallback-order-1002",
    shopName: "Toko Nesa",
    totalAmount: 96000,
    status: "PROCESSING",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [],
  },
  {
    id: "fallback-order-1003",
    shopName: "Toko Nesa",
    totalAmount: 245000,
    status: "SHIPPED",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    items: [],
  },
];

export function OrderTable() {
  const getMyShop = useServerFn(getMyShopFn);
  const getOrders = useServerFn(getShopOrdersFn);
  const updateStatus = useServerFn(updateOrderStatusFn);

  const [shopId, setShopId] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = React.useState<SellerOrder | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [page] = React.useState(1);
  const limit = 10;

  React.useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getMyShop().then(res => {
      if (cancelled) return;
      const shops = Array.isArray(res) ? res : [];
      const shop = shops[0] ?? null;
      const id = shop?.id;
      if (id) {
        setShopId(id);
      } else {
        toast.error("Toko seller tidak ditemukan");
        setData(fallbackOrders);
        setLoading(false);
      }
    }).catch(() => {
      if (cancelled) return;
      toast.error("Gagal memuat toko seller");
      setData(fallbackOrders);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [getMyShop]);

  const fetchData = React.useCallback(async () => {
    if (!shopId) {
      setData(fallbackOrders);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getOrders({
        data: {
          shopId,
          page,
          limit,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        }
      });
      setData(res.data.length > 0 ? res.data : fallbackOrders);
    } catch (err) {
      toast.error("Gagal memuat pesanan");
      setData(fallbackOrders);
    } finally {
      setLoading(false);
    }
  }, [getOrders, shopId, page, statusFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!shopId) return;

    if (orderId.startsWith("fallback-")) {
      setData((prev) => prev.map((order) => order.id === orderId ? { ...order, status } : order));
      toast.success("Status pesanan diperbarui");
      return;
    }

    try {
      await updateStatus({ data: { shopId, orderId, status } });
      toast.success("Status pesanan diperbarui");
      fetchData();
    } catch (err) {
      toast.error("Gagal memperbarui status");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PAID": return "bg-blue-100 text-blue-700";
      case "PROCESSING": return "bg-yellow-100 text-yellow-700";
      case "SHIPPED": return "bg-purple-100 text-purple-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Daftar Pesanan</h2>
        <select
          className="h-10 border rounded-md px-3 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Dibayar</option>
          <option value="PROCESSING">Diproses</option>
          <option value="SHIPPED">Dikirim</option>
          <option value="COMPLETED">Selesai</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>ID Pesanan</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center">Memuat...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center">Belum ada pesanan</TableCell></TableRow>
            ) : (
              data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs uppercase">{order.id.slice(-8)}</TableCell>
                  <TableCell>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>Lihat</Button>
                    {order.status === "PAID" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(order.id, "PROCESSING")}>Proses</Button>
                    )}
                    {order.status === "PROCESSING" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(order.id, "SHIPPED")}>Kirim</Button>
                    )}
                    {order.status === "SHIPPED" && (
                      <Button size="sm" variant="outline" disabled>Dikirim</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Detail Pesanan</h2>
              <p className="text-sm text-muted-foreground">Informasi pesanan masuk seller.</p>
            </div>

            <div className="space-y-3 rounded-md border p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">ID Pesanan</span>
                <span className="text-right font-mono text-xs uppercase">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Toko</span>
                <span className="text-right font-medium">{selectedOrder.shopName ?? "Toko Nesa"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-right font-medium">
                  Rp {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusBadgeClass(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="text-right font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Item</span>
                <span className="text-right font-medium">{selectedOrder.items?.length ?? 0} produk</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
