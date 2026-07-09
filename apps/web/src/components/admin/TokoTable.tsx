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
import { getShopsFn, reviewApplicationFn } from "#/server/admin";
import type { AdminShop } from "#/types/server";

type Shop = {
  id: string;
  name: string;
  owner: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  balance: number;
  totalProducts: number;
  createdAt: Date;
};

type SortOrder = "asc" | "desc";

type ConfirmAction = {
  type: "reject" | "suspend";
  item: Shop;
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

function getStatusClass(status: Shop["status"]) {
  if (status === "APPROVED") return "bg-green-100 text-green-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  if (status === "SUSPENDED") return "bg-orange-100 text-orange-700";
  return "bg-yellow-100 text-yellow-700";
}

function getStatusLabel(status: Shop["status"]) {
  if (status === "APPROVED") return "Aktif";
  if (status === "REJECTED") return "Ditolak";
  if (status === "SUSPENDED") return "Ditangguhkan";
  return "Menunggu";
}

export function ShopTable() {
  const getShops = useServerFn(getShopsFn);
  const reviewApplication = useServerFn(reviewApplicationFn);
  const [data, setData] = React.useState<Shop[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Shop>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [selectedShop, setSelectedShop] = React.useState<Shop | null>(null);

  const [confirmAction, setConfirmAction] =
    React.useState<ConfirmAction | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectReasonError, setRejectReasonError] = React.useState("");

  const fetchData = React.useCallback(async () => {
    try {
      setError(null);
      const res = await getShops({ data: { limit: 100 } });
      const shops = Array.isArray(res.data) ? res.data : [];
      setData(shops.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        owner: shop.owner?.fullName ?? shop.owner?.profile?.fullName ?? "-",
        email: shop.owner?.email ?? "-",
        status: shop.status,
        balance: Number(shop.balance ?? 0),
        totalProducts: Number(shop.totalProducts ?? 0),
        createdAt: new Date(shop.createdAt),
      })));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat toko";
      setError(msg);
      toast.error(msg);
    }
  }, [getShops]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = sortData(
    data.filter((s) => {
      const keyword = search.toLowerCase();

      return (
        s.name.toLowerCase().includes(keyword) ||
        s.owner.toLowerCase().includes(keyword) ||
        s.email.toLowerCase().includes(keyword)
      );
    }),
    sortKey,
    sortOrder
  );

  const handleSort = (key: keyof Shop) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortIcon = (key: keyof Shop) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  const updateStatus = (id: string, status: Shop["status"]) => {
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleApprove = async (id: string) => {
    const item = data.find((s) => s.id === id);

    try {
      await reviewApplication({ data: { shopId: id, status: "APPROVED" } });
      updateStatus(id, "APPROVED");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui toko");
      return;
    }

    toast.success("Toko disetujui", {
      description: `${item?.name} telah diaktifkan.`,
      position: "bottom-right",
    });
  };

  const openReject = (item: Shop) => {
    setConfirmAction({ type: "reject", item });
    setRejectReason("");
    setRejectReasonError("");
  };

  const openSuspend = (item: Shop) => {
    setConfirmAction({ type: "suspend", item });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "reject") {
      if (!rejectReason.trim()) {
        setRejectReasonError("Alasan penolakan wajib diisi");
        return;
      }

      try {
        await reviewApplication({
          data: {
            shopId: confirmAction.item.id,
            status: "REJECTED",
            notes: rejectReason,
          },
        });
        updateStatus(confirmAction.item.id, "REJECTED");
        await fetchData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menolak toko");
        return;
      }

      toast.error("Toko ditolak", {
        description: `${confirmAction.item.name} telah ditolak.`,
        position: "bottom-right",
      });
    }

    if (confirmAction.type === "suspend") {
      updateStatus(confirmAction.item.id, "SUSPENDED");

      toast.warning("Toko ditangguhkan", {
        description: `${confirmAction.item.name} tidak bisa menerima pesanan baru.`,
        position: "bottom-right",
      });
    }

    setConfirmAction(null);
    setRejectReason("");
  };

  const handleActivate = (id: string) => {
    const item = data.find((s) => s.id === id);

    updateStatus(id, "APPROVED");

    toast.success("Toko diaktifkan", {
      description: `${item?.name} kembali aktif.`,
      position: "bottom-right",
    });
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari nama toko, pemilik, atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear
          </Button>
        )}
      </div>

      <Table className="w-full table-fixed text-sm">
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[15%] cursor-pointer select-none"
              onClick={() => handleSort("name")}
            >
              Nama Toko{sortIcon("name")}
            </TableHead>

            <TableHead
              className="w-[13%] cursor-pointer select-none"
              onClick={() => handleSort("owner")}
            >
              Pemilik{sortIcon("owner")}
            </TableHead>

            <TableHead className="w-[17%]">Email</TableHead>

            <TableHead
              className="w-[12%] cursor-pointer select-none"
              onClick={() => handleSort("status")}
            >
              Status{sortIcon("status")}
            </TableHead>

            <TableHead
              className="w-[12%] cursor-pointer select-none"
              onClick={() => handleSort("balance")}
            >
              Saldo{sortIcon("balance")}
            </TableHead>

            <TableHead
              className="w-[8%] cursor-pointer select-none"
              onClick={() => handleSort("totalProducts")}
            >
              Produk{sortIcon("totalProducts")}
            </TableHead>

            <TableHead className="w-[12%]">
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortKey("createdAt");
                  setSortOrder(e.target.value as SortOrder);
                }}
                className="w-full rounded-md border bg-background px-2 py-1 text-xs font-medium"
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </TableHead>

            <TableHead className="w-[16%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="truncate font-medium">{s.name}</TableCell>
              <TableCell className="truncate">{s.owner}</TableCell>
              <TableCell className="truncate">{s.email}</TableCell>

              <TableCell>
                <Badge className={`text-xs ${getStatusClass(s.status)}`}>
                  {getStatusLabel(s.status)}
                </Badge>
              </TableCell>

              <TableCell className="truncate">
                Rp {s.balance.toLocaleString("id-ID")}
              </TableCell>

              <TableCell>{s.totalProducts}</TableCell>

              <TableCell className="truncate">
                {s.createdAt.toLocaleDateString("id-ID")}
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => setSelectedShop(s)}
                  >
                    Lihat
                  </Button>

                  {s.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(s.id)}
                      >
                        Setujui
                      </Button>

                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => openReject(s)}
                      >
                        Tolak
                      </Button>
                    </>
                  )}

                  {s.status === "APPROVED" && (
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => openSuspend(s)}
                    >
                      Tangguhkan
                    </Button>
                  )}

                  {s.status === "SUSPENDED" && (
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleActivate(s.id)}
                    >
                      Aktifkan
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-10 text-center text-muted-foreground"
              >
                Tidak ada toko ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <div>
              <h2 className="text-lg font-semibold">Detail Toko</h2>
              <p className="text-sm text-muted-foreground">
                Informasi lengkap toko yang dipilih.
              </p>
            </div>

            <div className="space-y-3 rounded-md border p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Nama Toko</span>
                <span className="text-right font-medium">{selectedShop.name}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Pemilik</span>
                <span className="text-right font-medium">
                  {selectedShop.owner}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Email</span>
                <span className="text-right font-medium">
                  {selectedShop.email}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusClass(selectedShop.status)}>
                  {getStatusLabel(selectedShop.status)}
                </Badge>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Saldo</span>
                <span className="text-right font-medium">
                  Rp {selectedShop.balance.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total Produk</span>
                <span className="text-right font-medium">
                  {selectedShop.totalProducts}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Bergabung</span>
                <span className="text-right font-medium">
                  {selectedShop.createdAt.toLocaleDateString("id-ID")}
                </span>
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

      {confirmAction?.type === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Tolak Toko</h2>

            <p className="text-sm text-muted-foreground">
              Tolak toko{" "}
              <span className="font-medium text-foreground">
                {confirmAction.item.name}
              </span>
              ?
            </p>

            <div>
              <label className="text-sm font-medium">
                Alasan Penolakan <span className="text-destructive">*</span>
              </label>

              <Input
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (e.target.value.trim()) setRejectReasonError("");
                }}
                placeholder="Masukkan alasan..."
                className={`mt-1 ${rejectReasonError ? "border-red-500" : ""}`}
              />

              {rejectReasonError && (
                <p className="mt-1 text-xs text-red-500">
                  {rejectReasonError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Batal
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirm}
              >
                Tolak
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction?.type === "suspend" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Tangguhkan Toko</h2>

            <p className="text-sm text-muted-foreground">
              Yakin ingin menangguhkan toko{" "}
              <span className="font-medium text-foreground">
                {confirmAction.item.name}
              </span>
              ? Toko tidak akan bisa menerima pesanan baru.
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
    </div>
  );
}
