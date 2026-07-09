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
import {
  getApplicationsFn,
  reviewApplicationFn,
} from "#/server/admin.server";
import type { ShopApplication } from "#/types/server";

type SortOrder = "asc" | "desc";
type StatusFilter = "ALL" | ShopApplication["status"];

function getStatusClass(status: ShopApplication["status"]) {
  if (status === "APPROVED") return "bg-green-100 text-green-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  if (status === "REVIEW") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
}

function getStatusLabel(status: ShopApplication["status"]) {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  if (status === "REVIEW") return "Review";
  return "Menunggu";
}

function ownerName(app: ShopApplication) {
  return app.shop?.owner?.profile?.fullName ?? app.accountName ?? "-";
}

function ownerEmail(app: ShopApplication) {
  return app.shop?.owner?.email ?? "-";
}

export function ApprovalTableDummy() {
  const getApplications = useServerFn(getApplicationsFn);
  const reviewApplication = useServerFn(reviewApplicationFn);

  const [data, setData] = React.useState<ShopApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [selectedApproval, setSelectedApproval] =
    React.useState<ShopApplication | null>(null);
  const [openRejectModal, setOpenRejectModal] = React.useState(false);
  const [selectedItem, setSelectedItem] =
    React.useState<ShopApplication | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApplications({
        data: {
          limit: 100,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        },
      });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Gagal memuat pengajuan toko dari database");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [getApplications, statusFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = [...data]
    .filter((a) => {
      const keyword = search.toLowerCase();
      const matchSearch =
        (a.shop?.name ?? "").toLowerCase().includes(keyword) ||
        ownerName(a).toLowerCase().includes(keyword) ||
        ownerEmail(a).toLowerCase().includes(keyword) ||
        (a.bankName ?? "").toLowerCase().includes(keyword);

      return matchSearch;
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });

  const pendingCount = data.filter((a) => a.status === "PENDING").length;

  const handleApprove = async (item: ShopApplication) => {
    try {
      await reviewApplication({
        data: { shopId: item.shopId, status: "APPROVED" },
      });
      toast.success("Pengajuan toko disetujui dan tersimpan di database");
      setSelectedApproval(null);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui toko");
    }
  };

  const openReject = (item: ShopApplication) => {
    setSelectedItem(item);
    setRejectReason("");
    setOpenRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) return;

    try {
      await reviewApplication({
        data: {
          shopId: selectedItem.shopId,
          status: "REJECTED",
          notes: rejectReason,
        },
      });
      toast.success("Pengajuan toko ditolak dan tersimpan di database");
      setOpenRejectModal(false);
      setSelectedItem(null);
      setRejectReason("");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menolak toko");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari toko, pemilik, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="ml-auto flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700">
              {pendingCount} menunggu
            </Badge>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-10 rounded-md border px-3 text-sm"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Menunggu</option>
            <option value="REVIEW">Review</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="h-10 rounded-md border px-3 text-sm"
          >
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>
        </div>
      </div>

      <Table className="w-full table-fixed text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[17%]">Nama Toko</TableHead>
            <TableHead className="w-[15%]">Pemilik</TableHead>
            <TableHead className="w-[17%]">Email</TableHead>
            <TableHead className="w-[12%]">Bank</TableHead>
            <TableHead className="w-[11%]">Tanggal</TableHead>
            <TableHead className="w-[11%]">Status</TableHead>
            <TableHead className="w-[17%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center">
                Memuat data dari database...
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Belum ada pengajuan toko di database.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="truncate font-medium">
                  {a.shop?.name ?? "-"}
                </TableCell>
                <TableCell className="truncate">{ownerName(a)}</TableCell>
                <TableCell className="truncate">{ownerEmail(a)}</TableCell>
                <TableCell className="truncate">{a.bankName ?? "-"}</TableCell>
                <TableCell>
                  {new Date(a.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusClass(a.status)}>
                    {getStatusLabel(a.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => setSelectedApproval(a)}
                    >
                      Lihat
                    </Button>

                    {(a.status === "PENDING" || a.status === "REVIEW") && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleApprove(a)}
                        >
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs bg-red-600 text-white hover:bg-red-700"
                          onClick={() => openReject(a)}
                        >
                          Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Detail Pengajuan Toko</h2>
            <div className="space-y-2 text-sm">
              <p><b>Toko:</b> {selectedApproval.shop?.name ?? "-"}</p>
              <p><b>Pemilik:</b> {ownerName(selectedApproval)}</p>
              <p><b>Email:</b> {ownerEmail(selectedApproval)}</p>
              <p><b>Bank:</b> {selectedApproval.bankName ?? "-"}</p>
              <p><b>No. Rekening:</b> {selectedApproval.bankAccount ?? "-"}</p>
              <p><b>Status:</b> {getStatusLabel(selectedApproval.status)}</p>
              <p><b>Catatan:</b> {selectedApproval.notes ?? "-"}</p>
            </div>

            <div className="flex justify-end gap-2">
              {(selectedApproval.status === "PENDING" ||
                selectedApproval.status === "REVIEW") && (
                <>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleApprove(selectedApproval)}
                  >
                    Setujui
                  </Button>
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      openReject(selectedApproval);
                      setSelectedApproval(null);
                    }}
                  >
                    Tolak
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedApproval(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {openRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="font-semibold">Alasan Penolakan</h2>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenRejectModal(false)}>
                Batal
              </Button>
              <Button className="bg-red-600 text-white" onClick={handleReject}>
                Tolak
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
