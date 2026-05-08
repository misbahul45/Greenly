import * as React from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { dummyCustomers, type Customer } from "#/constants/dummy.table";

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

function getStatusVariant(status: Customer["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ACTIVE") return "outline";
  if (status === "BANNED") return "destructive";
  if (status === "SUSPENDED") return "secondary";
  return "default";
}

const STATUS_LABEL: Record<Customer["status"], string> = {
  ACTIVE: "Aktif",
  SUSPENDED: "Ditangguhkan",
  BANNED: "Diblokir",
  PENDING_VERIFICATION: "Belum Verifikasi",
};

// ─── types ───────────────────────────────────────────────────────────────────

type ConfirmAction = {
  type: "suspend" | "ban";
  item: Customer;
};

// ─── component ───────────────────────────────────────────────────────────────

export function CustomerTableDummy() {
  const [data, setData] = React.useState<Customer[]>(dummyCustomers);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Customer>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [confirmAction, setConfirmAction] = React.useState<ConfirmAction | null>(null);

  // ── derived ──────────────────────────────────────────────────────────────

  const filtered = sortData(
    data.filter((c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
    ),
    sortKey,
    sortOrder,
  );

  // ── sort ─────────────────────────────────────────────────────────────────

  const handleSort = (key: keyof Customer) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const sortIcon = (key: keyof Customer) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  // ── action handlers ──────────────────────────────────────────────────────

  const updateStatus = (id: string, status: Customer["status"]) => {
    setData((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const handleVerify = (id: string) => {
    const item = data.find((c) => c.id === id);
    updateStatus(id, "ACTIVE");
    toast.success("Customer diverifikasi", {
      description: `${item?.fullName} berhasil diverifikasi.`,
      position: "bottom-right",
    });
  };

  const handleRestore = (id: string) => {
    const item = data.find((c) => c.id === id);
    updateStatus(id, "ACTIVE");
    toast.success("Customer dipulihkan", {
      description: `${item?.fullName} kembali aktif.`,
      position: "bottom-right",
    });
  };

  const openSuspend = (item: Customer) => setConfirmAction({ type: "suspend", item });
  const openBan = (item: Customer) => setConfirmAction({ type: "ban", item });

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "suspend") {
      updateStatus(confirmAction.item.id, "SUSPENDED");
      toast.warning("Customer ditangguhkan", {
        description: `${confirmAction.item.fullName} tidak bisa login sementara.`,
        position: "bottom-right",
      });
    }
    if (confirmAction.type === "ban") {
      updateStatus(confirmAction.item.id, "BANNED");
      toast.error("Customer diblokir", {
        description: `${confirmAction.item.fullName} tidak bisa login.`,
        position: "bottom-right",
      });
    }
    setConfirmAction(null);
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari nama, email, atau telepon..."
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
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("fullName")}>Nama{sortIcon("fullName")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("email")}>Email{sortIcon("email")}</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>Status{sortIcon("status")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("totalOrders")}>Pesanan{sortIcon("totalOrders")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("totalSpent")}>Total Belanja{sortIcon("totalSpent")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>Bergabung{sortIcon("createdAt")}</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.fullName}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(c.status)}>
                  {STATUS_LABEL[c.status]}
                </Badge>
              </TableCell>
              <TableCell>{c.totalOrders}</TableCell>
              <TableCell>Rp {c.totalSpent.toLocaleString("id-ID")}</TableCell>
              <TableCell>{c.createdAt.toLocaleDateString("id-ID")}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline">Lihat</Button>
                {c.status === "PENDING_VERIFICATION" && (
                  <Button size="sm" onClick={() => handleVerify(c.id)}>Verifikasi</Button>
                )}
                {c.status === "ACTIVE" && (
                  <Button size="sm" variant="secondary" onClick={() => openSuspend(c)}>Tangguhkan</Button>
                )}
                {c.status === "SUSPENDED" && (
                  <>
                    <Button size="sm" onClick={() => handleRestore(c.id)}>Aktifkan</Button>
                    <Button size="sm" variant="destructive" onClick={() => openBan(c)}>Blokir</Button>
                  </>
                )}
                {c.status === "BANNED" && (
                  <Button size="sm" onClick={() => handleRestore(c.id)}>Pulihkan</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                Tidak ada customer ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* modal konfirmasi tangguhkan */}
      {confirmAction?.type === "suspend" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Tangguhkan Customer</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menangguhkan{" "}
              <span className="font-medium text-foreground">{confirmAction.item.fullName}</span>?{" "}
              Customer tidak akan bisa login sementara.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
              <Button variant="secondary" onClick={handleConfirm}>Tangguhkan</Button>
            </div>
          </div>
        </div>
      )}

      {/* modal konfirmasi blokir */}
      {confirmAction?.type === "ban" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Blokir Customer</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin memblokir{" "}
              <span className="font-medium text-foreground">{confirmAction.item.fullName}</span>?{" "}
              Customer tidak akan bisa login sama sekali.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleConfirm}>Blokir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
