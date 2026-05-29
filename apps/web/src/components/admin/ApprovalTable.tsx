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
import { getApplicationsFn, reviewApplicationFn, type ShopApplication } from "#/features/admin/api";

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
  if (status === "REVIEW") return "Ditinjau";
  return "Menunggu";
}

export function ApprovalTable() {
  const getApplications = useServerFn(getApplicationsFn);
  const reviewApplication = useServerFn(reviewApplicationFn);

  const [data, setData] = React.useState<ShopApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [selectedApproval, setSelectedApproval] = React.useState<ShopApplication | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [openRejectModal, setOpenRejectModal] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApplications({
        data: {
          page,
          limit,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        }
      });
      setData(res.data);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      toast.error("Gagal memuat data pengajuan");
    } finally {
      setLoading(false);
    }
  }, [getApplications, page, statusFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReview = async (shopId: string, status: string, notes?: string) => {
    try {
      await reviewApplication({ data: { shopId, status, notes } });
      toast.success("Pengajuan telah diproses");
      fetchData();
    } catch (err) {
      toast.error("Gagal memproses pengajuan");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="ml-auto flex gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="h-10 border rounded-md px-3 text-sm"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="REVIEW">Ditinjau</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table className="table-fixed w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Nama Toko</TableHead>
              <TableHead className="w-[20%]">Pemilik</TableHead>
              <TableHead className="w-[15%]">Tanggal</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[30%] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Tidak ada pengajuan ditemukan
                </TableCell>
              </TableRow>
            ) : (
              data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="truncate font-medium">{a.shop?.name}</TableCell>
                  <TableCell className="truncate">{a.shop?.owner?.profile?.fullName ?? a.shop?.owner?.email}</TableCell>
                  <TableCell>{new Date(a.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge className={getStatusClass(a.status)}>
                      {getStatusLabel(a.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
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
                            className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleReview(a.shopId, "APPROVED")}
                          >
                            Setujui
                          </Button>

                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                              setSelectedApproval(a);
                              setOpenRejectModal(true);
                            }}
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
      </div>

      {selectedApproval && !openRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl">
            <h2 className="font-semibold text-lg border-b pb-2">Detail Pengajuan Toko</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nama Toko</p>
                <p className="font-medium">{selectedApproval.shop?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pemilik</p>
                <p className="font-medium">{selectedApproval.shop?.owner?.profile?.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bank</p>
                <p className="font-medium">{selectedApproval.bankName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nomor Rekening</p>
                <p className="font-medium">{selectedApproval.bankAccount}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Nama Pemilik Rekening</p>
                <p className="font-medium">{selectedApproval.accountName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">Link KTP</p>
                <a href={selectedApproval.idCardUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Lihat Dokumen</a>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedApproval(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {openRejectModal && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
            <h2 className="font-semibold">Alasan Penolakan</h2>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setOpenRejectModal(false);
                setRejectReason("");
              }}>
                Batal
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={() => {
                  handleReview(selectedApproval.shopId, "REJECTED", rejectReason);
                  setOpenRejectModal(false);
                  setSelectedApproval(null);
                  setRejectReason("");
                }}
              >
                Konfirmasi Tolak
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
