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
import { dummyProducts, type Product } from "#/constants/dummy.table";

type SortOrder = "asc" | "desc";
type FormMode = "create" | "edit";

type ProductForm = Omit<Product, "id" | "createdAt" | "updatedAt">;
type FormErrors = Partial<Record<keyof ProductForm, string>>;

function sortData<T>(data: T[], key: keyof T, order: SortOrder): T[] {
  return [...data].sort((a, b) => {
    const av = a[key] as any;
    const bv = b[key] as any;

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

function generateSKU(index: number) {
  return `SKU-${String(index + 1).padStart(3, "0")}`;
}

function generateNextSKU(products: Product[]) {
  return `SKU-${String(products.length + 1).padStart(3, "0")}`;
}

function getProductStatusLabel(isActive: boolean) {
  return isActive ? "Aktif" : "Nonaktif";
}

function getStatusClass(isActive: boolean) {
  return isActive
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-gray-100 text-gray-600 border-gray-200";
}

const EMPTY_FORM: ProductForm = {
  name: "",
  sku: "",
  price: 0,
  stock: 0,
  category: "",
  isActive: true,
  description: "",
};

export function ProductTableFull() {
  const [data, setData] = React.useState<Product[]>(
    dummyProducts.map((product, index) => ({
      ...product,
      sku: generateSKU(index),
    })),
  );

  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof Product>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const filtered = sortData(
    data.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()),
    ),
    sortKey,
    sortOrder,
  );

  const handleSort = (key: keyof Product) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortIcon = (key: keyof Product) =>
    sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  const openCreate = () => {
    setFormMode("create");
    setSelectedItem(null);
    setForm({
      ...EMPTY_FORM,
      sku: generateNextSKU(data),
    });
    setErrors({});
    setOpenFormModal(true);
  };

  const openEdit = (item: Product) => {
    setFormMode("edit");
    setSelectedItem(item);
    setForm({
      name: item.name,
      sku: item.sku,
      price: item.price,
      stock: item.stock,
      category: item.category,
      isActive: item.isActive,
      description: item.description,
    });
    setErrors({});
    setOpenFormModal(true);
  };

  const closeFormModal = () => {
    setOpenFormModal(false);
    setSelectedItem(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (!form.sku.trim()) e.sku = "SKU wajib diisi";
    if (!form.category.trim()) e.category = "Kategori wajib diisi";
    if (form.price <= 0) e.price = "Harga harus lebih dari 0";
    if (form.stock < 0) e.stock = "Stok tidak boleh negatif";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (formMode === "edit" && selectedItem) {
      setData((prev) =>
        prev.map((p) =>
          p.id === selectedItem.id
            ? { ...p, ...form, updatedAt: new Date() }
            : p,
        ),
      );

      toast.success("Produk diperbarui", {
        description: `${form.name} berhasil disimpan.`,
        position: "bottom-right",
      });
    } else {
      const newItem: Product = {
        ...form,
        id: generateId("prod"),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setData((prev) => [newItem, ...prev]);

      toast.success("Produk ditambahkan", {
        description: `${form.name} berhasil ditambahkan.`,
        position: "bottom-right",
      });
    }

    setOpenFormModal(false);
  };

  const updateProductStatus = (id: string, isActive: boolean) => {
    const item = data.find((p) => p.id === id);

    setData((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isActive, updatedAt: new Date() } : p,
      ),
    );

    toast.success("Status produk diperbarui", {
      description: `${item?.name} menjadi ${getProductStatusLabel(isActive)}.`,
      position: "bottom-right",
    });
  };

  const openDelete = (item: Product) => {
    setSelectedItem(item);
    setOpenDeleteModal(true);
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    const name = selectedItem.name;

    setData((prev) => prev.filter((p) => p.id !== selectedItem.id));
    setOpenDeleteModal(false);
    setSelectedItem(null);

    toast.error("Produk dihapus", {
      description: `${name} telah dihapus dari daftar.`,
      position: "bottom-right",
    });
  };

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari nama, SKU, atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {search && (
          <Button variant="outline" size="sm" onClick={() => setSearch("")}>
            Clear
          </Button>
        )}

        <div className="ml-auto">
          <Button onClick={openCreate}>+ Tambah Produk</Button>
        </div>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("name")}
            >
              Nama{sortIcon("name")}
            </TableHead>

            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("sku")}
            >
              SKU{sortIcon("sku")}
            </TableHead>

            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("category")}
            >
              Kategori{sortIcon("category")}
            </TableHead>

            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("price")}
            >
              Harga{sortIcon("price")}
            </TableHead>

            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("stock")}
            >
              Stok{sortIcon("stock")}
            </TableHead>

            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("isActive")}
            >
              Status{sortIcon("isActive")}
            </TableHead>

            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("createdAt")}
            >
              Dibuat{sortIcon("createdAt")}
            </TableHead>

            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>

              <TableCell className="text-muted-foreground text-xs">
                {p.sku}
              </TableCell>

              <TableCell>{p.category}</TableCell>

              <TableCell>Rp {p.price.toLocaleString("id-ID")}</TableCell>

              <TableCell>{p.stock}</TableCell>

              <TableCell>
                <select
                  value={p.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    updateProductStatus(p.id, e.target.value === "active")
                  }
                  className={[
                    "h-9 rounded-full border px-3 text-sm font-medium outline-none",
                    getStatusClass(p.isActive),
                  ].join(" ")}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </TableCell>

              <TableCell>{p.createdAt.toLocaleDateString("id-ID")}</TableCell>

              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(p)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => openDelete(p)}
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
                colSpan={8}
                className="text-center text-muted-foreground py-10"
              >
                Tidak ada produk ditemukan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* MODAL FORM CREATE / EDIT */}
      {openFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">
              {formMode === "edit" ? "Edit Produk" : "Tambah Produk"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  Nama Produk <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Nama produk"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">
                    SKU <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={form.sku}
                    readOnly
                    placeholder="SKU otomatis"
                    className="bg-muted text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Kategori <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Kategori"
                    className={errors.category ? "border-destructive" : ""}
                  />
                  {errors.category && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">
                    Harga (Rp) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.price === 0 ? "" : form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    placeholder="Masukkan harga"
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Stok <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.stock === 0 ? "" : form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    placeholder="Masukkan stok"
                    className={errors.stock ? "border-destructive" : ""}
                  />
                  {errors.stock && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.stock}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat produk"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status Produk</label>
                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive: e.target.value === "active",
                    })
                  }
                  className={[
                    "mt-1 h-10 w-full rounded-md border px-3 text-sm font-medium outline-none",
                    getStatusClass(form.isActive),
                  ].join(" ")}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeFormModal}>
                Batal
              </Button>

              <Button onClick={handleSave}>
                {formMode === "edit" ? "Simpan Perubahan" : "Tambah Produk"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {openDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Hapus Produk</h2>

            <p className="text-sm text-muted-foreground">
              Yakin ingin menghapus{" "}
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
                className="bg-red-600 text-white hover:bg-red-700"
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