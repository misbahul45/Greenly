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
import { getUsersFn, updateUserStatusFn, type AdminUser } from "#/features/admin/api.server";
import { dummyCustomers, type Customer } from "#/constants/dummy.table";

type SortKey = "fullName" | "email" | "status" | "createdAt";
type SortOrder = "asc" | "desc";
type StatusFilter = AdminUser["status"] | "ALL";

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

type NormalizedUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: AdminUser["status"];
  createdAt: string;
  roles: string[];
};

function normalizeUser(u: AdminUser): NormalizedUser {
  return {
    id: u.id,
    fullName: u.profile?.fullName ?? u.name ?? "-",
    email: u.email,
    phone: u.profile?.phone ?? "-",
    status: u.status,
    createdAt: u.createdAt,
    roles: Array.isArray(u.roles)
      ? u.roles.map((r: any) =>
          typeof r === "string" ? r : r?.role?.name ?? r?.name ?? "-"
        )
      : [],
  };
}

function fromDummy(c: Customer): NormalizedUser {
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    roles: [],
  };
}

type ConfirmAction = {
  type: "suspend" | "ban";
  item: NormalizedUser;
};

export function CustomerTableDummy() {
  const getUsers = useServerFn(getUsersFn);
  const updateStatus = useServerFn(updateUserStatusFn);

  const [data, setData] = React.useState<NormalizedUser[]>(dummyCustomers.map(fromDummy));
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>("ALL");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const limit = 10;

  const [selectedCustomer, setSelectedCustomer] = React.useState<NormalizedUser | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        data: {
          page,
          limit,
          search: search || undefined,
          status: filterStatus === "ALL" ? undefined : filterStatus,
        },
      });
      const items = Array.isArray(res.data) ? res.data : [];
      if (items.length > 0) {
        setData(items.map(normalizeUser));
        setTotal(
          (res as any).metaData?.total ?? (res as any).meta?.total ?? items.length
        );
      } else {
        setData(dummyCustomers.map(fromDummy));
        setTotal(dummyCustomers.length);
      }
    } catch {
      toast.error("Gagal memuat customer dari database, menampilkan data contoh");
      setData(dummyCustomers.map(fromDummy));
      setTotal(dummyCustomers.length);
    } finally {
      setLoading(false);
    }
  }, [getUsers, page, filterStatus, search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filterStatus]);

  React.useEffect(() => {
    fetchData();
  }, [page]);

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    if (typeof av === "string" && typeof bv === "string") {
      return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  const applyStatus = async (id: string, status: AdminUser["status"]) => {
    try {
      await updateStatus({ data: { id, status } });
      setData((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      toast.success("Status customer diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui status");
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const newStatus: AdminUser["status"] =
      confirmAction.type === "suspend" ? "SUSPENDED" : "BANNED";
    await applyStatus(confirmAction.item.id, newStatus);
    setConfirmAction(null);
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari nama, email, atau telepon..."
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
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
            <option value="BANNED">Diblokir</option>
            <option value="PENDING_VERIFICATION">Belum Verifikasi</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortKey("createdAt");
              setSortOrder(e.target.value as SortOrder);
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm font-medium"
          >
            <option value="desc">Bergabung Terbaru</option>
            <option value="asc">Bergabung Terlama</option>
          </select>
        </div>
      </div>

      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[15%] cursor-pointer select-none"
              onClick={() => handleSort("fullName")}
            >
              Nama{sortIcon("fullName")}
            </TableHead>
            <TableHead
              className="w-[18%] cursor-pointer select-none"
              onClick={() => handleSort("email")}
            >
              Email{sortIcon("email")}
            </TableHead>
            <TableHead className="w-[12%]">Telepon</TableHead>
            <TableHead
              className="w-[14%] cursor-pointer select-none"
              onClick={() => handleSort("status")}
            >
              Status{sortIcon("status")}
            </TableHead>
            <TableHead className="w-[12%]">Roles</TableHead>
            <TableHead
              className="w-[10%] cursor-pointer select-none"
              onClick={() => handleSort("createdAt")}
            >
              Bergabung{sortIcon("createdAt")}
            </TableHead>
            <TableHead className="w-[19%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center">
                Memuat...
              </TableCell>
            </TableRow>
          ) : sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Tidak ada customer ditemukan
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="truncate font-medium">{c.fullName}</TableCell>
                <TableCell className="truncate">{c.email}</TableCell>
                <TableCell className="truncate">{c.phone}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${getStatusClass(c.status)}`}>
                    {STATUS_LABEL[c.status]}
                  </Badge>
                </TableCell>
                <TableCell className="truncate text-xs text-muted-foreground">
                  {c.roles.join(", ") || "-"}
                </TableCell>
                <TableCell className="truncate">
                  {new Date(c.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1">
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
                        onClick={() => applyStatus(c.id, "ACTIVE")}
                      >
                        Verifikasi
                      </Button>
                    )}

                    {c.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => setConfirmAction({ type: "suspend", item: c })}
                      >
                        Suspend
                      </Button>
                    )}

                    {c.status === "SUSPENDED" && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => applyStatus(c.id, "ACTIVE")}
                        >
                          Aktifkan
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setConfirmAction({ type: "ban", item: c })}
                        >
                          Blokir
                        </Button>
                      </>
                    )}

                    {c.status === "BANNED" && (
                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => applyStatus(c.id, "ACTIVE")}
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
                <span className="text-right font-medium">{selectedCustomer.fullName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Email</span>
                <span className="text-right font-medium">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Telepon</span>
                <span className="text-right font-medium">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusClass(selectedCustomer.status)}>
                  {STATUS_LABEL[selectedCustomer.status]}
                </Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Roles</span>
                <span className="text-right font-medium">
                  {selectedCustomer.roles.join(", ") || "-"}
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
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction?.type === "suspend" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Tangguhkan Customer</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menangguhkan{" "}
              <span className="font-medium text-foreground">
                {confirmAction.item.fullName}
              </span>
              ? Customer tidak akan bisa login sementara.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Batal
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleConfirm}
              >
                Tangguhkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction?.type === "ban" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Blokir Customer</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin memblokir{" "}
              <span className="font-medium text-foreground">
                {confirmAction.item.fullName}
              </span>
              ? Customer tidak akan bisa login sama sekali.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Batal
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirm}
              >
                Blokir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
