import * as React from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { dummyShops, type Shop } from "#/constants/dummy.table";

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

function getStatusVariant(status: Shop["status"]): "default" | "outline" | "destructive" | "secondary" {
  if (status === "APPROVED") return "outline";
  if (status === "REJECTED") return "destructive";
  if (status === "SUSPENDED") return "secondary";
  return "default";
}

function getStatusLabel(status: Shop["status"]): string {
  if (status === "APPROVED") return "Aktif";
  if (status === "REJECTED") return "Ditolak";
  if (status === "SUSPENDED") return "Ditangguhkan";
  return "Menunggu";
}

// ─── types ───────────────────────────────────────────────────────────────────

type ConfirmAction = {
  type: "reject" | "suspend";
  item: Shop;
};

// ─── component ───────────────────────────────────────────────────────────────

export function ShopTableDummy() {
  const [data, setData] = React.useState<Shop[]>(dummyShops);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Shop>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectReasonError, setRejectReasonError] = React.useState("");

  // ── derived ──────────────────────────────────────────────────────────────

  const filtered = sortData(
    data.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.owner.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    ),
    sortKey,
    sortOrder,
  );

  // ── sort ─────────────────────────────────────────────────────────────────

  const handleSort = (key: keyof Shop) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const sortIcon = (key: keyof Shop) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  // ── action handlers ──────────────────────────────────────────────────────

  const updateStatus = (id: string, status: Shop["status"]) => {
    setData((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  };

  const handleApprove = (id: string) => {
    const item = data.find((s) => s.id === id);
    updateStatus(id, "APPROVED");
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

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "reject") {
      if (!rejectReason.trim()) {
        setRejectReasonError("Alasan penolakan wajib diisi");
        return;
      }
      updateStatus(confirmAction.item.id, "REJECTED");
      toast.error("Toko ditolak", {
        description: `${confirmAction.item.name} telah ditolak.`,
        position: "bottom-right",
      });
    } else if (confirmAction.type === "suspend") {
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

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari nama toko, pemilik, atau email..."
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
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>Nama Toko{sortIcon("name")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("owner")}>Pemilik{sortIcon("owner")}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>Status{sortIcon("status")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("balance")}>Saldo{sortIcon("balance")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("totalProducts")}>Produk{sortIcon("totalProducts")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>Bergabung{sortIcon("createdAt")}</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.owner}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(s.status)}>
                  {getStatusLabel(s.status)}
                </Badge>
              </TableCell>
              <TableCell>Rp {s.balance.toLocaleString("id-ID")}</TableCell>
              <TableCell>{s.totalProducts}</TableCell>
              <TableCell>{s.createdAt.toLocaleDateString("id-ID")}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline">Lihat</Button>
                {s.status === "PENDING" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(s.id)}>Setujui</Button>
                    <Button size="sm" variant="destructive" onClick={() => openReject(s)}>Tolak</Button>
                  </>
                )}
                {s.status === "APPROVED" && (
                  <Button size="sm" variant="secondary" onClick={() => openSuspend(s)}>Tangguhkan</Button>
                )}
                {s.status === "SUSPENDED" && (
                  <Button size="sm" onClick={() => handleActivate(s.id)}>Aktifkan</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                Tidak ada toko ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* modal konfirmasi tolak */}
      {confirmAction?.type === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Tolak Toko</h2>
            <p className="text-sm text-muted-foreground">
              Tolak toko{" "}
              <span className="font-medium text-foreground">{confirmAction.item.name}</span>?
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
                className={`mt-1 ${rejectReasonError ? "border-destructive" : ""}`}
              />
              {rejectReasonError && (
                <p className="text-xs text-destructive mt-1">{rejectReasonError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleConfirm}>Tolak</Button>
            </div>
          </div>
        </div>
      )}

      {/* modal konfirmasi tangguhkan */}
      {confirmAction?.type === "suspend" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Tangguhkan Toko</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menangguhkan toko{" "}
              <span className="font-medium text-foreground">{confirmAction.item.name}</span>?{" "}
              Toko tidak akan bisa menerima pesanan baru.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
              <Button variant="secondary" onClick={handleConfirm}>Tangguhkan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
