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
import { getCategoriesFn, createCategoryFn, deleteCategoryFn, type AdminCategory } from "#/features/admin/api";

export function CategoryTable() {
  const getCategories = useServerFn(getCategoriesFn);
  const createCategory = useServerFn(createCategoryFn);
  const deleteCategory = useServerFn(deleteCategoryFn);

  const [data, setData] = React.useState<AdminCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const limit = 20;

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategories({ data: { page, limit } });
      setData(res.data);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  }, [getCategories, page]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ data: { name: newCategoryName } });
      toast.success("Kategori berhasil ditambahkan");
      setNewCategoryName("");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Gagal menambahkan kategori");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await deleteCategory({ data: { id } });
      toast.success("Kategori berhasil dihapus");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus kategori");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Daftar Kategori</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>Tambah Kategori</Button>
      </div>

      <div className="rounded-md border">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Dibuat Pada</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Tidak ada kategori
                </TableCell>
              </TableRow>
            ) : (
              data.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{new Date(cat.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-lg">Tambah Kategori Baru</h2>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nama Kategori..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddCategory}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
