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
import {
  getCategoriesFn,
  createCategoryFn,
  updateCategoryFn,
  deleteCategoryFn,
} from "#/server/admin";
import type { AdminCategory } from "#/types/server";

type SortOrder = "asc" | "desc";
type FormMode = "create" | "edit";

type CategoryForm = {
  name: string;
  parentId: string | null;
};

type FormErrors = Partial<Record<keyof CategoryForm, string>>;

const EMPTY_FORM: CategoryForm = { name: "", parentId: null };

export function CategoryTable() {
  const getCategories = useServerFn(getCategoriesFn);
  const createCategory = useServerFn(createCategoryFn);
  const updateCategory = useServerFn(updateCategoryFn);
  const deleteCategory = useServerFn(deleteCategoryFn);

  const [data, setData] = React.useState<AdminCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const limit = 10;

  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = React.useState<AdminCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<AdminCategory | null>(null);

  const [form, setForm] = React.useState<CategoryForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [saving, setSaving] = React.useState(false);

  const rootCategories = data.filter((c) => c.parentId === null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories({ data: { page, limit } });
      const items = Array.isArray(res.data) ? res.data : [];
      setData(items);
      setTotal((res as any).meta?.total ?? items.length);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat kategori";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [getCategories, page]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = [...data]
    .filter((c) => {
      const keyword = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(keyword) ||
        c.slug.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? aT - bT : bT - aT;
    });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const openCreate = () => {
    setFormMode("create");
    setSelectedItem(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setOpenFormModal(true);
  };

  const openEdit = (item: AdminCategory) => {
    setFormMode("edit");
    setSelectedItem(item);
    setForm({ name: item.name, parentId: item.parentId });
    setErrors({});
    setOpenFormModal(true);
  };

  const openDelete = (item: AdminCategory) => {
    setSelectedItem(item);
    setOpenDeleteModal(true);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Nama kategori wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (formMode === "create") {
        await createCategory({
          data: {
            name: form.name.trim(),
            parentId: form.parentId ?? undefined,
          },
        });
        toast.success("Kategori ditambahkan");
      } else if (selectedItem) {
        await updateCategory({
          data: {
            id: selectedItem.id,
            name: form.name.trim(),
            parentId: form.parentId,
          },
        });
        toast.success("Kategori diperbarui");
      }
      setOpenFormModal(false);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan kategori");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteCategory({ data: { id: selectedItem.id } });
      toast.success(`Kategori ${selectedItem.name} dihapus`);
      setOpenDeleteModal(false);
      setSelectedItem(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kategori");
    }
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari nama atau slug kategori..."
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
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="h-10 rounded-md border bg-background px-3 text-sm font-medium"
          >
            <option value="desc">Dibuat Terbaru</option>
            <option value="asc">Dibuat Terlama</option>
          </select>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={openCreate}
          >
            + Tambah Kategori
          </Button>
        </div>
      </div>

      <Table className="w-full table-fixed text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[22%]">Nama</TableHead>
            <TableHead className="w-[20%]">Slug</TableHead>
            <TableHead className="w-[20%]">Parent ID</TableHead>
            <TableHead className="w-[15%]">Dibuat</TableHead>
            <TableHead className="w-[23%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((__, j) => (
                  <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center">
                <p className="text-red-500 font-medium">{error}</p>
                <button onClick={fetchData} className="mt-3 text-sm text-green-600 underline hover:no-underline">Coba lagi</button>
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                Tidak ada kategori ditemukan
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="truncate font-medium">{c.name}</TableCell>
                <TableCell className="truncate text-xs text-muted-foreground">
                  {c.slug}
                </TableCell>
                <TableCell className="truncate text-xs text-muted-foreground">
                  {c.parentId ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="truncate">
                  {new Date(c.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => setSelectedCategory(c)}
                    >
                      Lihat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => openEdit(c)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => openDelete(c)}
                    >
                      Hapus
                    </Button>
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

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <div>
              <h2 className="text-lg font-semibold">Detail Kategori</h2>
              <p className="text-sm text-muted-foreground">
                Informasi lengkap kategori yang dipilih.
              </p>
            </div>
            <div className="space-y-3 rounded-md border p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Nama</span>
                <span className="text-right font-medium">{selectedCategory.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Slug</span>
                <span className="text-right font-medium">{selectedCategory.slug}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Parent ID</span>
                <span className="text-right font-medium">
                  {selectedCategory.parentId ?? "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Dibuat</span>
                <span className="text-right font-medium">
                  {new Date(selectedCategory.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {openFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">
              {formMode === "edit" ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  Nama Kategori <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, name: e.target.value }));
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Nama kategori"
                  className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Parent Kategori</label>
                <select
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.parentId ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, parentId: e.target.value || null }))
                  }
                >
                  <option value="">— Tidak ada (root) —</option>
                  {rootCategories
                    .filter((r) => formMode === "create" || r.id !== selectedItem?.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenFormModal(false)}>
                Batal
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : formMode === "edit" ? "Simpan Perubahan" : "Tambah Kategori"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {openDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Hapus Kategori</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menghapus kategori{" "}
              <span className="font-medium text-foreground">{selectedItem.name}</span>? Tindakan
              ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
                Batal
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
