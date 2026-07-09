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
import { getShopOrdersFn, updateOrderStatusFn, getMyShopFn, type SellerOrder } from "#/features/seller/api";

export function OrderTable() {
  const getMyShop = useServerFn(getMyShopFn);
  const getOrders = useServerFn(getShopOrdersFn);
  const updateStatus = useServerFn(updateOrderStatusFn);

  const [shopId, setShopId] = React.useState<string | null>(null);
  const [data, setData] = React.useState<SellerOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [page] = React.useState(1);
  const limit = 10;

  React.useEffect(() => {
    getMyShop().then(res => {
      const id = res.data?.id || res.data?.shop?.id;
      if (id) setShopId(id);
    });
  }, [getMyShop]);

  const fetchData = React.useCallback(async () => {
    if (!shopId) return;
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
      setData(res.data);
    } catch (err) {
      toast.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [getOrders, shopId, page, statusFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateStatus({ data: { orderId, status } });
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
    </div>
  );
}
