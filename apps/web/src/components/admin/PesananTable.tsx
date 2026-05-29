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
import { getAllOrdersFn, type AdminOrder } from "#/features/admin/api";

type StatusFilter = AdminOrder["status"] | "ALL";

function getStatusClass(status: AdminOrder["status"]) {
  switch (status) {
    case "PAID": return "bg-blue-100 text-blue-700";
    case "PROCESSING": return "bg-yellow-100 text-yellow-700";
    case "SHIPPED": return "bg-purple-100 text-purple-700";
    case "COMPLETED": return "bg-green-100 text-green-700";
    case "CANCELLED": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function OrderTable() {
  const getOrders = useServerFn(getAllOrdersFn);

  const [data, setData] = React.useState<AdminOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>("ALL");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const limit = 10;

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders({
        data: {
          page,
          limit,
          status: filterStatus === "ALL" ? undefined : filterStatus,
        }
      });
      setData(res.data);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      toast.error("Gagal memuat data pesanan");
    } finally {
      setLoading(false);
    }
  }, [getOrders, page, filterStatus]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Semua Pesanan</h2>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="h-10 border rounded-md px-3 text-sm"
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
              <TableHead>Customer</TableHead>
              <TableHead>Toko</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Tidak ada pesanan
                </TableCell>
              </TableRow>
            ) : (
              data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs uppercase">{order.id.slice(-8)}</TableCell>
                  <TableCell>{order.user?.profile?.fullName ?? order.user?.email}</TableCell>
                  <TableCell>{order.shopName}</TableCell>
                  <TableCell>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge className={getStatusClass(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString("id-ID")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total {total} pesanan
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
