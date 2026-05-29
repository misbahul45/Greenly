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
import { useServerFn } from "@tanstack/react-start";
import { getShopsFn, updateShopStatusFn, type AdminShop } from "#/features/admin/api";

type StatusFilter = AdminShop["status"] | "ALL";

function getStatusClass(status: AdminShop["status"]) {
  if (status === "APPROVED") return "bg-green-100 text-green-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  if (status === "SUSPENDED") return "bg-orange-100 text-orange-700";
  return "bg-yellow-100 text-yellow-700";
}

function getStatusLabel(status: AdminShop["status"]) {
  if (status === "APPROVED") return "Aktif";
  if (status === "REJECTED") return "Ditolak";
  if (status === "SUSPENDED") return "Ditangguhkan";
  return "Menunggu";
}

export function ShopTable() {
  const getShops = useServerFn(getShopsFn);
  const updateShopStatus = useServerFn(updateShopStatusFn);

  const [data, setData] = React.useState<AdminShop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>("ALL");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [selectedShop, setSelectedShop] = React.useState<AdminShop | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShops({
        data: {
          page,
          limit,
          search: debouncedSearch,
          status: filterStatus === "ALL" ? undefined : filterStatus,
        }
      });
      setData(res.data);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      toast.error("Gagal memuat data toko");
    } finally {
      setLoading(false);
    }
  }, [getShops, page, debouncedSearch, filterStatus]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: AdminShop["status"]) => {
    try {
      await updateShopStatus({ data: { id, status } });
      toast.success("Status toko diperbarui");
      fetchData();
    } catch (err) {
      toast.error("Gagal memperbarui status toko");
    }
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari nama toko atau pemilik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="ml-auto">
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
            <option value="APPROVED">Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Nama Toko</TableHead>
              <TableHead>Pemilik</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
                  Tidak ada toko ditemukan
                </TableCell>
              </TableRow>
            ) : (
              data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.owner?.profile?.fullName ?? s.owner?.email ?? "-"}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusClass(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>Rp {Number(s.balance).toLocaleString("id-ID")}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs"
                        onClick={() => setSelectedShop(s)}
                      >
                        Lihat
                      </Button>

                      {s.status === "PENDING" && (
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUpdateStatus(s.id, "APPROVED")}
                        >
                          Setujui
                        </Button>
                      )}

                      {s.status === "APPROVED" && (
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => handleUpdateStatus(s.id, "SUSPENDED")}
                        >
                          Suspend
                        </Button>
                      )}

                      {s.status === "SUSPENDED" && (
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUpdateStatus(s.id, "APPROVED")}
                        >
                          Aktifkan
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(page - 1) * limit + 1} sampai {Math.min(page * limit, total)} dari {total} toko
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * limit >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <div>
              <h2 className="text-lg font-semibold">Detail Toko</h2>
              <p className="text-sm text-muted-foreground">Informasi lengkap toko.</p>
            </div>

            <div className="space-y-3 rounded-md border p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Nama Toko</span>
                <span className="text-right font-medium">{selectedShop.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Deskripsi</span>
                <span className="text-right font-medium">{selectedShop.description ?? "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusClass(selectedShop.status)}>
                  {getStatusLabel(selectedShop.status)}
                </Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Saldo</span>
                <span className="text-right font-medium">Rp {Number(selectedShop.balance).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Pemilik</span>
                <span className="text-right font-medium">{selectedShop.owner?.email}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedShop(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
