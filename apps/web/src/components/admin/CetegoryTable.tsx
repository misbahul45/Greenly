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
import { dummyCategories, type Category } from "#/constants/dummy.table";

type SortOrder = "asc" | "desc";
type FormMode = "create" | "edit";

type CategoryForm = Omit<Category, "id" | "createdAt" | "totalProducts">;
type FormErrors = Partial<Record<keyof CategoryForm, string>>;

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  parent: null,
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

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

function generateCategoryCode(): string {
  return `${Date.now()}`;
}

export function CategoryTableDummy() {
  const [data, setData] = React.useState<Category[]>(dummyCategories);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Category>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

  const [formMode, setFormMode] = React.useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = React.useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  const [form, setForm] = React.useState<CategoryForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const filtered = sortData(
    data.filter((c) => {
      const keyword = search.toLowerCase();

      return (
        c.name.toLowerCase().includes(keyword) ||
        c.slug.toLowerCase().includes(keyword) ||
        (c.parent?.toLowerCase().includes(keyword) ?? false) ||
        c.description.toLowerCase().includes(keyword)
      );
    }),
    sortKey,
    sortOrder
  );

  const rootCategories = data.filter((c) => c.parent === null);

  const handleSort = (key: keyof Category) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortIcon = (key: keyof Category) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  const openCreate = () => {
    setFormMode("create");
    setSelectedItem(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setOpenFormModal(true);
  };

  const openEdit = (item: Category) => {
    setFormMode("edit");
    setSelectedItem(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description,
      parent: item.parent,
    });
    setErrors({});
    setOpenFormModal(true);
  };

  const closeFormModal = () => {
    setOpenFormModal(false);
    setErrors({});
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateCategoryCode(),
    }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!form.name.trim()) {
      e.name = "Nama kategori wajib diisi";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const finalForm = {
      ...form,
      slug: form.slug || generateCategoryCode(),
    };

    if (formMode === "edit" && selectedItem) {
      setData((prev) =>
        prev.map((c) =>
          c.id === selectedItem.id ? { ...c, ...finalForm } : c
        )
      );

      toast.success("Kategori diperbarui", {
        description: `${finalForm.name} berhasil disimpan.`,
        position: "bottom-right",
      });
    } else {
      const newItem: Category = {
        ...finalForm,
        id: generateId("cat"),
        totalProducts: 0,
        createdAt: new Date(),
      };

      setData((prev) => [newItem, ...prev]);

      toast.success("Kategori ditambahkan", {
        description: `${finalForm.name} berhasil ditambahkan.`,
        position: "bottom-right",
      });
    }

    setOpenFormModal(false);
  };

  const openDelete = (item: Category) => {
    setSelectedItem(item);
    setOpenDeleteModal(true);
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    const name = selectedItem.name;

    setData((prev) => prev.filter((c) => c.id !== selectedItem.id));
    setOpenDeleteModal(false);
    setSelectedItem(null);

    toast.error("Kategori dihapus", {
      description: `${name} telah dihapus.`,
      position: "bottom-right",
    });
  };

  return (
    <div className="w-full space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari nama, kode, parent, atau deskripsi..."
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
            onChange={(e) => {
              setSortKey("createdAt");
              setSortOrder(e.target.value as SortOrder);
            }}
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
            <TableHead
              className="w-[15%] cursor-pointer select-none"
              onClick={() => handleSort("name")}
            >
              Nama{sortIcon("name")}
            </TableHead>

            <TableHead
              className="w-[14%] cursor-pointer select-none"
              onClick={() => handleSort("slug")}
            >
              Kode{sortIcon("slug")}
            </TableHead>

            <TableHead
              className="w-[13%] cursor-pointer select-none"
              onClick={() => handleSort("parent")}
            >
              Parent{sortIcon("parent")}
            </TableHead>

            <TableHead className="w-[22%]">Deskripsi</TableHead>

            <TableHead
              className="w-[8%] cursor-pointer select-none"
              onClick={() => handleSort("totalProducts")}
            >
              Produk{sortIcon("totalProducts")}
            </TableHead>

            <TableHead className="w-[11%]">Dibuat</TableHead>

            <TableHead className="w-[17%]">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="truncate font-medium">{c.name}</TableCell>

              <TableCell className="truncate text-xs text-muted-foreground">
                {c.slug}
              </TableCell>

              <TableCell className="truncate">
                {c.parent ?? <span className="text-muted-foreground">—</span>}
              </TableCell>

              <TableCell className="truncate text-sm text-muted-foreground">
                {c.description || "—"}
              </TableCell>

              <TableCell>{c.totalProducts}</TableCell>

              <TableCell className="truncate">
                {c.createdAt.toLocaleDateString("id-ID")}
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
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-muted-foreground"
              >
                Tidak ada kategori ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
                <span className="text-right font-medium">
                  {selectedCategory.name}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Kode</span>
                <span className="text-right font-medium">
                  {selectedCategory.slug}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Parent</span>
                <span className="text-right font-medium">
                  {selectedCategory.parent ?? "—"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Deskripsi</span>
                <span className="max-w-[240px] text-right font-medium">
                  {selectedCategory.description || "—"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total Produk</span>
                <span className="text-right font-medium">
                  {selectedCategory.totalProducts}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Dibuat</span>
                <span className="text-right font-medium">
                  {selectedCategory.createdAt.toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
              >
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nama kategori"
                  className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                />

                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Kode Otomatis</label>

                <Input
                  value={form.slug || "kode akan otomatis dibuat"}
                  readOnly
                  className="mt-1 cursor-not-allowed bg-muted text-muted-foreground"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  Kode dibuat otomatis oleh sistem setelah nama kategori diisi.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Deskripsi</label>

                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat kategori"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Parent Kategori</label>

                <select
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.parent ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, parent: e.target.value || null })
                  }
                >
                  <option value="">— Tidak ada (root) —</option>

                  {rootCategories
                    .filter(
                      (r) => formMode === "create" || r.id !== selectedItem?.id
                    )
                    .map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeFormModal}>
                Batal
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSave}
              >
                {formMode === "edit" ? "Simpan Perubahan" : "Tambah Kategori"}
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
              <span className="font-medium text-foreground">
                {selectedItem.name}
              </span>
              ? Tindakan ini tidak bisa dibatalkan.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenDeleteModal(false)}
              >
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