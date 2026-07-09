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
  firstShopFromPayload,
  type SellerProduct
} from "#/features/seller/api.server";
import { getCategoriesFn, type AdminCategory } from "#/features/admin/api.server";

type FormMode = "create" | "edit";

const fallbackProducts: SellerProduct[] = [
  {
    id: "fallback-product-1",
    name: "Paket Sayur Organik",
    slug: "paket-sayur-organik",
    description: "Paket sayur segar untuk kebutuhan harian.",
    price: 45000,
    stock: 32,
    shopId: "fallback-shop-nesa",
    categoryId: "fallback-category",
    images: [],
    imageUrls: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-product-2",
    name: "Beras Merah Premium",
    slug: "beras-merah-premium",
    description: "Beras merah pilihan dari petani lokal.",
    price: 68000,
    stock: 18,
    shopId: "fallback-shop-nesa",
    categoryId: "fallback-category",
    images: [],
    imageUrls: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-product-3",
    name: "Madu Hutan Murni",
    slug: "madu-hutan-murni",
    description: "Madu murni tanpa campuran gula.",
    price: 85000,
    stock: 12,
    shopId: "fallback-shop-nesa",
    categoryId: "fallback-category",
    images: [],
    imageUrls: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function ProductTableFull() {
  const getMyShop = useServerFn(getMyShopFn);
  const getProducts = useServerFn(getSellerProductsFn);
  const createProduct = useServerFn(createProductFn);
  const updateProduct = useServerFn(updateProductFn);
  const deleteProduct = useServerFn(deleteProductFn);
  const toggleProduct = useServerFn(toggleProductFn);
  const getCategories = useServerFn(getCategoriesFn);

  const [shopId, setShopId] = React.useState<string | null>(null);
  const [data, setData] = React.useState<SellerProduct[]>([]);
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
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

  React.useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getMyShop().then(res => {
      if (cancelled) return;
      const shop = firstShopFromPayload(res);
      const id = shop?.id;
      if (id) {
        setShopId(id);
      } else {
        toast.error("Toko seller tidak ditemukan");
        setData(fallbackProducts);
        setLoading(false);
      }
    }).catch(() => {
      if (cancelled) return;
      toast.error("Gagal memuat toko seller");
      setData(fallbackProducts);
      setLoading(false);
    });

    getCategories({ data: { limit: 100 } })
      .then(res => {
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
    if (!shopId) {
      setData(fallbackProducts);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getProducts({
        data: {
          shopId,
          page,
          limit,
          search: debouncedSearch,
        }
      });
      setData(res.data.length > 0 ? res.data : fallbackProducts);
    } catch (err) {
      toast.error("Gagal memuat produk");
      setData(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, [getProducts, shopId, page, debouncedSearch]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (id: string) => {
    if (id.startsWith("fallback-")) {
      setData((prev) => prev.map((item) => item.id === id ? { ...item, isActive: !item.isActive } : item));
      toast.success("Status produk diperbarui");
      return;
    }

    try {
      await toggleProduct({ data: { id } });
      toast.success("Status produk diperbarui");
      fetchData();
    } catch (err) {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    if (id.startsWith("fallback-")) {
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Produk dihapus");
      return;
    }

    try {
      await deleteProduct({ data: { id } });
      toast.success("Produk dihapus");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus produk");
    }
  };

  const handleSave = async () => {
    try {
      if (!shopId) {
        const newItem: SellerProduct = {
          id: `fallback-product-${Date.now()}`,
          name: form.name,
          slug: form.name.toLowerCase().replace(/\s+/g, "-"),
          description: form.description,
          price: form.price,
          stock: form.stock,
          shopId: "fallback-shop-nesa",
          categoryId: form.categoryId || "fallback-category",
          images: [],
          imageUrls: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setData((prev) => [newItem, ...prev]);
        setOpenFormModal(false);
        toast.success("Produk ditambahkan");
        return;
      }

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
    } catch (err) {
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
    if (p.id.startsWith("fallback-")) {
      toast.info("Data contoh bisa ditambah/hapus. Edit penuh tersedia untuk data dari database.");
      return;
    }

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={openCreate}>+ Tambah Produk</Button>
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
              <TableRow><TableCell colSpan={5} className="py-10 text-center">Memuat...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center">Belum ada produk</TableCell></TableRow>
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
              <Input placeholder="Nama Produk" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <Input placeholder="Deskripsi" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Harga" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
                <Input type="number" placeholder="Stok" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} />
              </div>
              <select
                className="w-full h-10 border rounded-md px-3 text-sm"
                value={form.categoryId}
                onChange={e => setForm({...form, categoryId: e.target.value})}
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
