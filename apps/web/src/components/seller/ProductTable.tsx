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
import { useServerFn } from "@tanstack/react-start";
import {
  getSellerProductsFn,
  createProductFn,
  updateProductFn,
  deleteProductFn,
  toggleProductFn,
  getMyShopFn,
} from "#/server/seller";
import { getCategoriesFn } from "#/server/admin";
import type { SellerProduct } from "#/types/server";
import type { AdminCategory } from "#/types/server";

type FormMode = "create" | "edit";

export function ProductTableFull() {
  const getMyShop = useServerFn(getMyShopFn);
  const getProducts = useServerFn(getSellerProductsFn);
  const createProduct = useServerFn(createProductFn);
  const updateProduct = useServerFn(updateProductFn);
  const deleteProduct = useServerFn(deleteProductFn);
  const toggleProduct = useServerFn(toggleProductFn);
  const getCategories = useServerFn(getCategoriesFn);

  const [shopId, setShopId] = React.useState<string | null>(null);
  const [shopError, setShopError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<SellerProduct[]>([]);
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page] = React.useState(1);
  const limit = 10;

  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = React.useState<SellerProduct | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
  });

  // Load shop & categories on mount
  React.useEffect(() => {
    let cancelled = false;

    getMyShop()
      .then((res) => {
        if (cancelled) return;
        const shops = Array.isArray(res) ? res : [];
        const shop = shops[0] ?? null;
        const id = shop?.id;
        if (id) {
          setShopId(id);
        } else {
          setShopError("Anda belum memiliki toko yang terdaftar.");
          setLoading(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        const msg = "Gagal memuat data toko seller";
        setShopError(msg);
        toast.error(msg);
        setLoading(false);
      });

    getCategories({ data: { limit: 100 } })
      .then((res) => {
        if (!cancelled) setCategories(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Gagal memuat kategori");
      });

    return () => {
      cancelled = true;
    };
  }, [getMyShop, getCategories]);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({
        data: {
          shopId,
          page,
          limit,
          search: debouncedSearch,
        },
      });
      setData(res.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat produk";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [getProducts, shopId, page, debouncedSearch]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (id: string) => {
    try {
      await toggleProduct({ data: { id } });
      toast.success("Status produk diperbarui");
      fetchData();
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await deleteProduct({ data: { id } });
      toast.success("Produk dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus produk");
    }
  };

  const handleSave = async () => {
    if (!shopId) {
      toast.error("ID toko tidak ditemukan");
      return;
    }
    try {
      const sku = selectedItem?.slug ?? `SKU-${Date.now()}`;
      const payload = {
        name: form.name,
        description: form.description || undefined,
        sku,
        price: form.price,
        currency: "IDR" as const,
        stock: form.stock,
        shopId,
        categoryId: form.categoryId,
        imageUrls: selectedItem?.imageUrls ?? [],
        isActive: true,
      };

      if (formMode === "create") {
        await createProduct({ data: payload });
        toast.success("Produk ditambahkan");
      } else if (selectedItem) {
        await updateProduct({ data: { id: selectedItem.id, data: payload } });
        toast.success("Produk diperbarui");
      }
      setOpenFormModal(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan produk");
    }
  };

  const openCreate = () => {
    setFormMode("create");
    setSelectedItem(null);
    setForm({ name: "", description: "", price: 0, stock: 0, categoryId: "" });
    setOpenFormModal(true);
  };

  const openEdit = (p: SellerProduct) => {
    setFormMode("edit");
    setSelectedItem(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId,
    });
    setOpenFormModal(true);
  };

  // Shop not found or error state
  if (shopError) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p className="font-medium text-red-500">{shopError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={openCreate} disabled={!shopId}>+ Tambah Produk</Button>
      </div>

      <div className="rounded-md border">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Belum ada produk. Klik "+ Tambah Produk" untuk mulai.
                </TableCell>
              </TableRow>
            ) : (
              data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>Rp {Number(p.price).toLocaleString("id-ID")}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={p.isActive ? "text-green-600" : "text-gray-400"}
                      onClick={() => handleToggle(p.id)}
                    >
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(p.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {openFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold">{formMode === "create" ? "Tambah Produk" : "Edit Produk"}</h2>
            <div className="space-y-3">
              <Input placeholder="Nama Produk" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Harga" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                <Input type="number" placeholder="Stok" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <select
                className="w-full h-10 border rounded-md px-3 text-sm"
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenFormModal(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
