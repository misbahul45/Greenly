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
import { getUsersFn, updateUserStatusFn, type AdminUser } from "#/features/admin/api";

type StatusFilter = AdminUser["status"] | "ALL";

type ConfirmAction = {
  type: "suspend" | "ban" | "active";
  item: AdminUser;
};

const STATUS_LABEL: Record<AdminUser["status"], string> = {
  ACTIVE: "Aktif",
  SUSPENDED: "Ditangguhkan",
  BANNED: "Diblokir",
  PENDING_VERIFICATION: "Belum Verifikasi",
};

function getStatusClass(status: AdminUser["status"]) {
  if (status === "ACTIVE") return "bg-green-100 text-green-700";
  if (status === "SUSPENDED") return "bg-orange-100 text-orange-700";
  if (status === "BANNED") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export function CustomerTable() {
  const getUsers = useServerFn(getUsersFn);
  const updateUserStatus = useServerFn(updateUserStatusFn);

  const [data, setData] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);
  
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>("ALL");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [selectedCustomer, setSelectedCustomer] =
    React.useState<AdminUser | null>(null);

  const [confirmAction, setConfirmAction] =
    React.useState<ConfirmAction | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        data: {
          page,
          limit,
          search: debouncedSearch,
          status: filterStatus === "ALL" ? undefined : filterStatus,
        }
      });
      setData(res.data);
      setTotal(res.meta?.total ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data customer");
    } finally {
      setLoading(false);
    }
  }, [getUsers, page, debouncedSearch, filterStatus]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: AdminUser["status"]) => {
    try {
      await updateUserStatus({ data: { id, status } });
      toast.success("Status diperbarui", {
        description: `Customer berhasil diatur ke ${STATUS_LABEL[status]}.`,
        position: "bottom-right",
      });
      fetchData();
    } catch (err) {
      toast.error("Gagal memperbarui status", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        position: "bottom-right",
      });
    }
  };

  const openConfirm = (type: ConfirmAction["type"], item: AdminUser) => {
    setConfirmAction({ type, item });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    
    const statusMap: Record<ConfirmAction["type"], AdminUser["status"]> = {
      suspend: "SUSPENDED",
      ban: "BANNED",
      active: "ACTIVE",
    };

    handleUpdateStatus(confirmAction.item.id, statusMap[confirmAction.type]);
    setConfirmAction(null);
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

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
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
            <option value="BANNED">Diblokir</option>
            <option value="PENDING_VERIFICATION">Belum Verifikasi</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
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
                  Tidak ada customer ditemukan
                </TableCell>
              </TableRow>
            ) : (
              data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.profile?.fullName ?? c.name ?? "Tanpa Nama"}
                  </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-[10px] uppercase">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getStatusClass(c.status)}`}>
                      {STATUS_LABEL[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(c.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs"
                        onClick={() => setSelectedCustomer(c)}
                      >
                        Lihat
                      </Button>

                      {c.status === "PENDING_VERIFICATION" && (
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUpdateStatus(c.id, "ACTIVE")}
                        >
                          Verifikasi
                        </Button>
                      )}

                      {c.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => openConfirm("suspend", c)}
                        >
                          Suspend
                        </Button>
                      )}

                      {c.status === "SUSPENDED" && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => openConfirm("active", c)}
                          >
                            Aktifkan
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => openConfirm("ban", c)}
                          >
                            Blokir
                          </Button>
                        </>
                      )}

                      {c.status === "BANNED" && (
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => openConfirm("active", c)}
                        >
                          Pulihkan
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

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(page - 1) * limit + 1} sampai {Math.min(page * limit, total)} dari {total} customer
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

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <div>
              <h2 className="text-lg font-semibold">Detail Customer</h2>
              <p className="text-sm text-muted-foreground">
                Informasi lengkap customer yang dipilih.
              </p>
            </div>

            <div className="space-y-3 rounded-md border p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Nama</span>
                <span className="text-right font-medium">
                  {selectedCustomer.profile?.fullName ?? selectedCustomer.name ?? "Tanpa Nama"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Email</span>
                <span className="text-right font-medium">
                  {selectedCustomer.email}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Telepon</span>
                <span className="text-right font-medium">
                  {selectedCustomer.profile?.phoneNumber ?? "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusClass(selectedCustomer.status)}>
                  {STATUS_LABEL[selectedCustomer.status]}
                </Badge>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Alamat</span>
                <span className="text-right font-medium">
                  {selectedCustomer.profile?.address ?? "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Bergabung</span>
                <span className="text-right font-medium">
                  {new Date(selectedCustomer.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold capitalize">{confirmAction.type} Customer</h2>

            <p className="text-sm text-muted-foreground">
              Yakin ingin melakukan aksi <span className="font-bold">{confirmAction.type}</span> pada{" "}
              <span className="font-medium text-foreground">
                {confirmAction.item.profile?.fullName ?? confirmAction.item.name ?? confirmAction.item.email}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Batal
              </Button>

              <Button
                className={
                  confirmAction.type === "active" 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : confirmAction.type === "suspend"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
                onClick={handleConfirmAction}
              >
                Konfirmasi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
