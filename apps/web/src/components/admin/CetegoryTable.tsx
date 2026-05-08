import * as React from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { dummyCategories, type Category } from "#/constants/dummy.table";

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

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── types ───────────────────────────────────────────────────────────────────

type FormMode = "create" | "edit";

type CategoryForm = Omit<Category, "id" | "createdAt" | "totalProducts">;

const EMPTY_FORM: CategoryForm = {
  name: "", slug: "", description: "", parent: null,
};

type FormErrors = Partial<Record<keyof CategoryForm, string>>;

// ─── component ───────────────────────────────────────────────────────────────

export function CategoryTableDummy() {
  const [data, setData] = React.useState<Category[]>(dummyCategories);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Category>("name");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");

  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = React.useState<Category | null>(null);
  const [form, setForm] = React.useState<CategoryForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});

  // ── derived ──────────────────────────────────────────────────────────────

  const filtered = sortData(
    data.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.parent?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    ),
    sortKey,
    sortOrder,
  );

  const rootCategories = data.filter((c) => c.parent === null);

  // ── sort ─────────────────────────────────────────────────────────────────

  const handleSort = (key: keyof Category) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const sortIcon = (key: keyof Category) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  // ── form modal ───────────────────────────────────────────────────────────

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

  // ── name → slug sync ─────────────────────────────────────────────────────

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      // auto-update slug only if user hasn't manually edited it
      slug: toSlug(name),
    }));
  };

  // ── validation ───────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Nama kategori wajib diisi";
    if (!form.slug.trim()) e.slug = "Slug wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!validate()) return;
    if (formMode === "edit" && selectedItem) {
      setData((prev) =>
        prev.map((c) =>
          c.id === selectedItem.id ? { ...c, ...form } : c
        )
      );
      toast.success("Kategori diperbarui", {
        description: `${form.name} berhasil disimpan.`,
        position: "bottom-right",
      });
    } else {
      const newItem: Category = {
        ...form,
        id: generateId("cat"),
        totalProducts: 0,
        createdAt: new Date(),
      };
      setData((prev) => [newItem, ...prev]);
      toast.success("Kategori ditambahkan", {
        description: `${form.name} berhasil ditambahkan.`,
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

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari nama atau kategori parent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear</Button>
        )}
        <div className="ml-auto">
          <Button onClick={openCreate}>+ Tambah Kategori</Button>
        </div>
      </div>

      {/* table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>Nama{sortIcon("name")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("slug")}>Slug{sortIcon("slug")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("parent")}>Parent{sortIcon("parent")}</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("totalProducts")}>Produk{sortIcon("totalProducts")}</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>Dibuat{sortIcon("createdAt")}</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{c.slug}</TableCell>
              <TableCell>{c.parent ?? <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{c.description || "—"}</TableCell>
              <TableCell>{c.totalProducts}</TableCell>
              <TableCell>{c.createdAt.toLocaleDateString("id-ID")}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => openDelete(c)}>Hapus</Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                Tidak ada kategori ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* modal form create / edit */}
      {openFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">
              {formMode === "edit" ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            <div className="space-y-3">
              {/* nama */}
              <div>
                <label className="text-sm font-medium">Nama Kategori <span className="text-destructive">*</span></label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nama kategori"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              {/* slug */}
              <div>
                <label className="text-sm font-medium">Slug <span className="text-destructive">*</span></label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="slug-kategori"
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
              </div>

              {/* deskripsi */}
              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi singkat kategori"
                />
              </div>

              {/* parent */}
              <div>
                <label className="text-sm font-medium">Parent Kategori</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1"
                  value={form.parent ?? ""}
                  onChange={(e) => setForm({ ...form, parent: e.target.value || null })}
                >
                  <option value="">— Tidak ada (root) —</option>
                  {rootCategories
                    .filter((r) => formMode === "create" || r.id !== selectedItem?.id)
                    .map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeFormModal}>Batal</Button>
              <Button onClick={handleSave}>{formMode === "edit" ? "Simpan Perubahan" : "Tambah Kategori"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* modal konfirmasi hapus */}
      {openDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Hapus Kategori</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menghapus kategori{" "}
              <span className="font-medium text-foreground">{selectedItem.name}</span>?{" "}
              Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
