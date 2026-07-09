import * as React from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
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
import { getAllOrdersFn, type AdminOrder } from "#/features/admin/api.server";
import { dummyOrders, type Order } from "#/constants/dummy.table";

type SortOrder = "asc" | "desc";
type StatusFilter = AdminOrder["status"] | "ALL";

const STATUS_LABEL: Record<AdminOrder["status"], string> = {
  PENDING: "Menunggu",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

function getStatusClass(status: AdminOrder["status"]) {
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (status === "PAID") return "bg-blue-100 text-blue-700";
  if (status === "PROCESSING") return "bg-purple-100 text-purple-700";
  if (status === "SHIPPED") return "bg-indigo-100 text-indigo-700";
  if (status === "COMPLETED") return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-700";
}

function toAdminOrder(o: Order): AdminOrder {
  return {
    id: o.id,
    userId: "-",
    shopId: "-",
    shopName: o.shopName,
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    user: { email: "-", profile: { fullName: o.customerName } },
  };
}

export function OrderTableDummy() {
  const getOrders = useServerFn(getAllOrdersFn);

  const [data, setData] = React.useState<AdminOrder[]>(dummyOrders.map(toAdminOrder));
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>("ALL");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const limit = 10;

  const [selectedOrder, setSelectedOrder] = React.useState<AdminOrder | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders({
        data: {
          page,
          limit,
          status: filterStatus === "ALL" ? undefined : filterStatus,
        },
      });
      const items = Array.isArray(res.data) ? res.data : [];
      if (items.length > 0) {
        setData(items);
        setTotal(res.metaData?.total ?? res.meta?.total ?? items.length);
      } else {
        setData(dummyOrders.map(toAdminOrder));
        setTotal(dummyOrders.length);
      }
    } catch {
      toast.error("Gagal memuat pesanan dari database, menampilkan data contoh");
      setData(dummyOrders.map(toAdminOrder));
      setTotal(dummyOrders.length);
    } finally {
      setLoading(false);
    }
  }, [getOrders, page, filterStatus]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = [...data]
    .filter((o) => {
      const keyword = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(keyword) ||
        (o.user?.profile?.fullName ?? "").toLowerCase().includes(keyword) ||
        o.shopName.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? aT - bT : bT - aT;
    });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari ID pesanan, customer, atau toko..."
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
            onChange={(e) => {
              setFilterStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
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
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
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
            <TableHead className="w-[18%]">ID Pesanan</TableHead>
            <TableHead className="w-[17%]">Customer</TableHead>
            <TableHead className="w-[17%]">Toko</TableHead>
            <TableHead className="w-[14%]">Total</TableHead>
            <TableHead className="w-[13%]">Status</TableHead>
            <TableHead className="w-[11%]">Tanggal</TableHead>
            <TableHead className="w-[10%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center">
                Memuat...
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Tidak ada pesanan ditemukan
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="truncate font-mono text-xs">
                  {o.id.slice(-10).toUpperCase()}
                </TableCell>
                <TableCell className="truncate">
                  {o.user?.profile?.fullName ?? o.user?.email ?? "-"}
                </TableCell>
                <TableCell className="truncate">{o.shopName}</TableCell>
                <TableCell className="truncate">
                  Rp {Number(o.totalAmount).toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${getStatusClass(o.status)}`}>
                    {STATUS_LABEL[o.status]}
                  </Badge>
                </TableCell>
                <TableCell className="truncate">
                  {new Date(o.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => setSelectedOrder(o)}
                  >
                    Lihat
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

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
                <span className="text-muted-foreground">ID Pesanan</span>
                <span className="text-right font-mono text-xs font-medium">
                  {selectedOrder.id}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Customer</span>
                <span className="text-right font-medium">
                  {selectedOrder.user?.profile?.fullName ?? selectedOrder.user?.email ?? "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Toko</span>
                <span className="text-right font-medium">{selectedOrder.shopName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-right font-medium">
                  Rp {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}
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
                  {new Date(selectedOrder.createdAt).toLocaleDateString("id-ID")}
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
    </div>
  );
}
