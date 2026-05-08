// ⛔️ potong import lama kamu, ganti jadi ini
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
import { dummyApprovals, type Approval } from "#/constants/dummy.table";

type SortOrder = "asc" | "desc";
type StatusFilter = "ALL" | Approval["status"];

function getStatusClass(status: Approval["status"]) {
  if (status === "APPROVED") return "bg-green-100 text-green-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

function getStatusLabel(status: Approval["status"]) {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  return "Menunggu";
}

export function ApprovalTableDummy() {
  const [data, setData] = React.useState<Approval[]>(dummyApprovals);
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");

  const [selectedApproval, setSelectedApproval] =
    React.useState<Approval | null>(null);

  const [openRejectModal, setOpenRejectModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Approval | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const filtered = [...data]
    .filter((a) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        a.shopName.toLowerCase().includes(keyword) ||
        a.ownerName.toLowerCase().includes(keyword) ||
        a.ownerEmail.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "ALL" || a.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.submittedAt.getTime() - b.submittedAt.getTime()
        : b.submittedAt.getTime() - a.submittedAt.getTime()
    );

  const pendingCount = data.filter((a) => a.status === "PENDING").length;

  const handleApprove = (id: string) => {
    setData((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "APPROVED", reviewedAt: new Date() }
          : a
      )
    );

    toast.success("Disetujui");
  };

  const openReject = (item: Approval) => {
    setSelectedItem(item);
    setRejectReason("");
    setOpenRejectModal(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;

    setData((prev) =>
      prev.map((a) =>
        a.id === selectedItem?.id
          ? {
            ...a,
            status: "REJECTED",
            reviewedAt: new Date(),
            note: rejectReason,
          }
          : a
      )
    );

    setOpenRejectModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-4">
      {/* 🔥 TOP BAR */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Cari toko, pemilik, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="ml-auto flex gap-2 items-center">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700">
              {pendingCount} menunggu
            </Badge>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-10 border rounded-md px-3 text-sm"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="h-10 border rounded-md px-3 text-sm"
          >
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>
        </div>
      </div>

      {/* 🔥 TABLE */}
      <Table className="table-fixed w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">Nama Toko</TableHead>
            <TableHead className="w-[13%]">Pemilik</TableHead>
            <TableHead className="w-[17%]">Email</TableHead>
            <TableHead className="w-[10%]">Jenis</TableHead>
            <TableHead className="w-[10%]">Tanggal</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[10%]">Catatan</TableHead>
            <TableHead className="w-[16%]">Aksi</TableHead>          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="truncate font-medium">
                {a.shopName}
              </TableCell>

              <TableCell className="truncate">{a.ownerName}</TableCell>
              <TableCell className="truncate">{a.ownerEmail}</TableCell>
              <TableCell>{a.businessType}</TableCell>

              <TableCell>
                {a.submittedAt.toLocaleDateString("id-ID")}
              </TableCell>

              <TableCell>
                <Badge className={getStatusClass(a.status)}>
                  {getStatusLabel(a.status)}
                </Badge>
              </TableCell>

              <TableCell className="truncate text-xs">
                {a.note ?? "—"}
              </TableCell>

              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={() => setSelectedApproval(a)}
                  >
                    Lihat
                  </Button>

                  {a.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(a.id)}
                      >
                        Setujui
                      </Button>

                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => openReject(a)}
                      >
                        Tolak
                      </Button>
                    </>
                  )}

                  {a.status !== "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="h-8 px-3 text-xs"
                    >
                      {getStatusLabel(a.status)}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔥 MODAL DETAIL */}
      {selectedApproval && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="font-semibold text-lg">Detail Toko</h2>

            <div className="space-y-2 text-sm">
              <p><b>Nama:</b> {selectedApproval.shopName}</p>
              <p><b>Pemilik:</b> {selectedApproval.ownerName}</p>
              <p><b>Email:</b> {selectedApproval.ownerEmail}</p>
              <p><b>Jenis:</b> {selectedApproval.businessType}</p>
              <p>
                <b>Status:</b>{" "}
                {getStatusLabel(selectedApproval.status)}
              </p>
              <p><b>Catatan:</b> {selectedApproval.note ?? "-"}</p>
            </div>

            {selectedApproval.status === "PENDING" && (
              <div className="flex gap-2 justify-end">
                <Button
                  className="bg-green-600 text-white"
                  onClick={() => {
                    handleApprove(selectedApproval.id);
                    setSelectedApproval(null);
                  }}
                >
                  Setujui
                </Button>

                <Button
                  className="bg-red-600 text-white"
                  onClick={() => {
                    openReject(selectedApproval);
                    setSelectedApproval(null);
                  }}
                >
                  Tolak
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setSelectedApproval(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}

      {/* 🔥 MODAL REJECT */}
      {openRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
            <h2 className="font-semibold">Alasan Penolakan</h2>

            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan..."
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenRejectModal(false)}
              >
                Batal
              </Button>

              <Button
                className="bg-red-600 text-white"
                onClick={handleReject}
              >
                Tolak
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}