export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  totalProducts: number;
  createdAt: Date;
};

export const dummyCategories: Category[] = [
  { id: "cat-001", name: "Tas", slug: "tas", description: "Semua jenis tas ramah lingkungan", parent: null, totalProducts: 18, createdAt: new Date(2026, 0, 1) },
  { id: "cat-002", name: "Peralatan Makan", slug: "peralatan-makan", description: "Peralatan makan dan minum berkelanjutan", parent: null, totalProducts: 25, createdAt: new Date(2026, 0, 2) },
  { id: "cat-003", name: "Perawatan Diri", slug: "perawatan-diri", description: "Produk perawatan diri alami dan organik", parent: null, totalProducts: 32, createdAt: new Date(2026, 0, 3) },
  { id: "cat-004", name: "Dapur", slug: "dapur", description: "Perlengkapan dapur ramah lingkungan", parent: null, totalProducts: 14, createdAt: new Date(2026, 0, 4) },
  { id: "cat-005", name: "Dekorasi", slug: "dekorasi", description: "Dekorasi rumah dari bahan alami", parent: null, totalProducts: 9, createdAt: new Date(2026, 0, 5) },
  { id: "cat-006", name: "Pertanian", slug: "pertanian", description: "Produk pertanian dan berkebun organik", parent: null, totalProducts: 7, createdAt: new Date(2026, 0, 6) },
  { id: "cat-007", name: "Tas Belanja", slug: "tas-belanja", description: "Tas belanja reusable pengganti kantong plastik", parent: "Tas", totalProducts: 10, createdAt: new Date(2026, 0, 7) },
  { id: "cat-008", name: "Tas Ransel", slug: "tas-ransel", description: "Ransel dari bahan daur ulang", parent: "Tas", totalProducts: 8, createdAt: new Date(2026, 0, 8) },
  { id: "cat-009", name: "Sabun & Sampo", slug: "sabun-sampo", description: "Sabun dan sampo organik bebas bahan kimia", parent: "Perawatan Diri", totalProducts: 15, createdAt: new Date(2026, 0, 9) },
  { id: "cat-010", name: "Sikat & Sisir", slug: "sikat-sisir", description: "Sikat dan sisir dari bahan alami", parent: "Perawatan Diri", totalProducts: 12, createdAt: new Date(2026, 0, 10) },
  { id: "cat-011", name: "Peralatan Masak", slug: "peralatan-masak", description: "Peralatan masak bebas bahan berbahaya", parent: "Dapur", totalProducts: 6, createdAt: new Date(2026, 0, 11) },
  { id: "cat-012", name: "Penyimpanan Makanan", slug: "penyimpanan-makanan", description: "Wadah penyimpanan makanan ramah lingkungan", parent: "Dapur", totalProducts: 8, createdAt: new Date(2026, 0, 12) },
];
