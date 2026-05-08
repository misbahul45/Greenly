import * as React from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { dummyApprovals, type Approval } from "#/constants/dummy.table";

// ─── helpers ────────────────────────────────────────────────────────────────

type SortOrder = "asc" | "desc";

function sortData<T>(data: T[], key: keyof T, order: SortOrder): T[] {
  return [...data].sort((a, b) => {
    const av = (a[key] ?? "") as any;
    const bv = (b[key] ?? "") as any;
    if (typeof av === "string") return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    if (av instanceof Date) return order === "asc" ? av.getTime() - bv.getTime() : bv.getTime() - av.getTime();
    return 0;
  });
}

function getStatusVariant(status: Approval["status"]): "default" | "outline" | "destructive" {
  if (status === "APPROVED") return "outline";
  if (status === "REJECTED") return "destructive";
  return "default";
}

function getStatusLabel(status: Approval["status"]): string {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  return "Menunggu";
}

// ─── component ───────────────────────────────────────────────────────────────

export function ApprovalTableDummy() {
  const [data, setData] = React.useState<Approval[]>(dummyApprovals);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Approval>("submittedAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [openRejectModal, setOpenRejectModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Approval | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectReasonError, setRejectReasonError] = React.useState("");

  // ── derived ──────────────────────────────────────────────────────────────

  const filtered = sortData(
    data.filter((a) =>
      a.shopName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerEmail.toLowerCase().includes(search.toLowerCase())
    ),
    sortKey,
    sortOrder,
  );

  const pendingCount = data.filter((a) => a.status === "PENDING").length;

  // ── sort ─────────────────────────────────────────────────────────────────

  const handleSort = (key: keyof Approval) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const sortIcon = (key: keyof Approval) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  // ── action handlers ──────────────────────────────────────────────────────

  const handleApprove = (id: string) => {
    const item = data.find((a) => a.id === id);
    setData((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "APPROVED", reviewedAt: new Date() } : a
      )
    );
    toast.success("Pengajuan disetujui", {
      description: `${item?.shopName} telah disetujui.`,
      position: "bottom-right",
    });
  };

  const openReject = (item: Approval) => {
    setSelectedItem(item);
    setRejectReason("");
    setRejectReasonError("");
    setOpenRejectModal(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setRejectReasonError("Alasan penolakan wajib diisi");
      return;
    }
    if (!selectedItem) return;
    setData((prev) =>
      prev.map((a) =>
        a.id === selectedItem.id
          ? { ...a, status: "REJECTED", reviewedAt: new Date(), note: rejectReason.trim() }
          : a
      )
    );
    toast.error("Pengajuan ditolak", {
      description: `${selectedItem.shopName} telah ditolak.`,
      position: "bottom-right",
    });
    setOpenRejectModal(false);
    setSelectedItem(null);
    setRejectReason("");
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari toko, pemilik, atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear</Button>
        )}
        {pendingCount > 0 && (
          <Badge variant="default" className="ml-auto">
            {pendingCount} menunggu persetujuan
          </Badge>
        )}
      </div>

      {/* table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("shopName")}>Nama Toko{sortIcon("shopName")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("ownerName")}>Pemilik{sortIcon("ownerName")}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("businessType")}>Jenis Usaha{sortIcon("businessType")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("submittedAt")}>Diajukan{sortIcon("submittedAt")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>Status{sortIcon("status")}</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.shopName}</TableCell>
              <TableCell>{a.ownerName}</TableCell>
              <TableCell>{a.ownerEmail}</TableCell>
              <TableCell>{a.businessType}</TableCell>
              <TableCell>{a.submittedAt.toLocaleDateString("id-ID")}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(a.status)}>
                  {getStatusLabel(a.status)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[160px] truncate text-xs text-muted-foreground">
                {a.note ?? "—"}
              </TableCell>
              <TableCell className="space-x-2">
                {a.status === "PENDING" ? (
                  <>
                    <Button size="sm" onClick={() => handleApprove(a.id)}>Setujui</Button>
                    <Button size="sm" variant="destructive" onClick={() => openReject(a)}>Tolak</Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    {getStatusLabel(a.status)}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                Tidak ada data persetujuan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* modal tolak */}
      {openRejectModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Tolak Pengajuan</h2>
            <p className="text-sm text-muted-foreground">
              Tolak pengajuan toko{" "}
              <span className="font-medium text-foreground">{selectedItem.shopName}</span>{" "}
              dari {selectedItem.ownerName}?
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
                placeholder="Masukkan alasan penolakan..."
                className={`mt-1 ${rejectReasonError ? "border-destructive" : ""}`}
              />
              {rejectReasonError && (
                <p className="text-xs text-destructive mt-1">{rejectReasonError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenRejectModal(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleReject}>Tolak Pengajuan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
