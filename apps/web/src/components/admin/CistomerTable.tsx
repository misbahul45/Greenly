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
import { dummyCustomers, type Customer } from "#/constants/dummy.table";

type SortOrder = "asc" | "desc";
type StatusFilter = Customer["status"] | "ALL";

type ConfirmAction = {
  type: "suspend" | "ban";
  item: Customer;
};

const STATUS_LABEL: Record<Customer["status"], string> = {
  ACTIVE: "Aktif",
  SUSPENDED: "Ditangguhkan",
  BANNED: "Diblokir",
  PENDING_VERIFICATION: "Belum Verifikasi",
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

function getStatusClass(status: Customer["status"]) {
  if (status === "ACTIVE") return "bg-green-100 text-green-700";
  if (status === "SUSPENDED") return "bg-orange-100 text-orange-700";
  if (status === "BANNED") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export function CustomerTableDummy() {
  const [data, setData] = React.useState<Customer[]>(dummyCustomers);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Customer>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [filterStatus, setFilterStatus] = React.useState<StatusFilter>("ALL");

  const [selectedCustomer, setSelectedCustomer] =
    React.useState<Customer | null>(null);

  const [confirmAction, setConfirmAction] =
    React.useState<ConfirmAction | null>(null);

  const filtered = sortData(
    data.filter((c) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        c.fullName.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword) ||
        c.phone.toLowerCase().includes(keyword);

      const matchStatus =
        filterStatus === "ALL" || c.status === filterStatus;

      return matchSearch && matchStatus;
    }),
    sortKey,
    sortOrder
  );

  const handleSort = (key: keyof Customer) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortIcon = (key: keyof Customer) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  const updateStatus = (id: string, status: Customer["status"]) => {
    setData((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
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

  const openSuspend = (item: Customer) => {
    setConfirmAction({ type: "suspend", item });
  };

  const openBan = (item: Customer) => {
    setConfirmAction({ type: "ban", item });
  };

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
          <TableHead className="w-[12%] cursor-pointer select-none" onClick={() => handleSort("fullName")}>
  Nama{sortIcon("fullName")}
</TableHead>

<TableHead className="w-[15%] cursor-pointer select-none" onClick={() => handleSort("email")}>
  Email{sortIcon("email")}
</TableHead>

<TableHead className="w-[12%]">Telepon</TableHead>

<TableHead className="w-[13%] cursor-pointer select-none" onClick={() => handleSort("status")}>
  Status{sortIcon("status")}
</TableHead>

<TableHead className="w-[8%] cursor-pointer select-none" onClick={() => handleSort("totalOrders")}>
  Pesanan{sortIcon("totalOrders")}
</TableHead>

<TableHead className="w-[12%] cursor-pointer select-none" onClick={() => handleSort("totalSpent")}>
  Belanja{sortIcon("totalSpent")}
</TableHead>

<TableHead className="w-[10%]">Bergabung</TableHead>

<TableHead className="w-[18%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="truncate font-medium">
                {c.fullName}
              </TableCell>

              <TableCell className="truncate">{c.email}</TableCell>

              <TableCell className="truncate">{c.phone}</TableCell>

              <TableCell>
                <Badge className={`text-xs ${getStatusClass(c.status)}`}>
                  {STATUS_LABEL[c.status]}
                </Badge>
              </TableCell>

              <TableCell>{c.totalOrders}</TableCell>

              <TableCell className="truncate">
                Rp {c.totalSpent.toLocaleString("id-ID")}
              </TableCell>

              <TableCell className="truncate">
                {c.createdAt.toLocaleDateString("id-ID")}
              </TableCell>

          <TableCell>
  <div className="flex items-center gap-2 whitespace-nowrap">
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
                      onClick={() => handleVerify(c.id)}
                    >
                      Verifikasi
                    </Button>
                  )}

                  {c.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => openSuspend(c)}
                    >
                      Suspend
                    </Button>
                  )}

                  {c.status === "SUSPENDED" && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleRestore(c.id)}
                      >
                        Aktifkan
                      </Button>

                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => openBan(c)}
                      >
                        Blokir
                      </Button>
                    </>
                  )}

                  {c.status === "BANNED" && (
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleRestore(c.id)}
                    >
                      Pulihkan
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
                Tidak ada customer ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
                  {selectedCustomer.fullName}
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
                  {selectedCustomer.phone}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusClass(selectedCustomer.status)}>
                  {STATUS_LABEL[selectedCustomer.status]}
                </Badge>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total Pesanan</span>
                <span className="text-right font-medium">
                  {selectedCustomer.totalOrders}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total Belanja</span>
                <span className="text-right font-medium">
                  Rp {selectedCustomer.totalSpent.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Bergabung</span>
                <span className="text-right font-medium">
                  {selectedCustomer.createdAt.toLocaleDateString("id-ID")}
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