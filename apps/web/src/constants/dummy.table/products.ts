export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export const dummyProducts: Product[] = [
  { id: "prod-001", name: "Tas Ramah Lingkungan", sku: "SKU-001", price: 150000, stock: 50, category: "Tas", isActive: true, description: "Tas berbahan daur ulang", createdAt: new Date(2026, 0, 1), updatedAt: new Date(2026, 0, 2) },
  { id: "prod-002", name: "Botol Minum Bambu", sku: "SKU-002", price: 85000, stock: 120, category: "Peralatan Makan", isActive: true, description: "Botol minum dari bambu organik", createdAt: new Date(2026, 0, 3), updatedAt: new Date(2026, 0, 4) },
  { id: "prod-003", name: "Sedotan Stainless", sku: "SKU-003", price: 25000, stock: 300, category: "Peralatan Makan", isActive: true, description: "Sedotan anti karat bisa dicuci ulang", createdAt: new Date(2026, 0, 5), updatedAt: new Date(2026, 0, 6) },
  { id: "prod-004", name: "Sabun Organik Lavender", sku: "SKU-004", price: 45000, stock: 80, category: "Perawatan Diri", isActive: false, description: "Sabun alami tanpa bahan kimia berbahaya", createdAt: new Date(2026, 0, 7), updatedAt: new Date(2026, 0, 8) },
  { id: "prod-005", name: "Tote Bag Kanvas", sku: "SKU-005", price: 65000, stock: 200, category: "Tas", isActive: true, description: "Tote bag kanvas tebal dan kuat", createdAt: new Date(2026, 0, 9), updatedAt: new Date(2026, 0, 10) },
  { id: "prod-006", name: "Lilin Aromaterapi Kedelai", sku: "SKU-006", price: 95000, stock: 60, category: "Dekorasi", isActive: true, description: "Lilin dari minyak kedelai alami", createdAt: new Date(2026, 0, 11), updatedAt: new Date(2026, 0, 12) },
  { id: "prod-007", name: "Sikat Gigi Bambu", sku: "SKU-007", price: 30000, stock: 400, category: "Perawatan Diri", isActive: true, description: "Sikat gigi biodegradable dari bambu", createdAt: new Date(2026, 0, 13), updatedAt: new Date(2026, 0, 14) },
  { id: "prod-008", name: "Beeswax Wrap", sku: "SKU-008", price: 55000, stock: 150, category: "Dapur", isActive: false, description: "Pembungkus makanan dari lilin lebah", createdAt: new Date(2026, 0, 15), updatedAt: new Date(2026, 0, 16) },
  { id: "prod-009", name: "Kompos Organik 5kg", sku: "SKU-009", price: 120000, stock: 30, category: "Pertanian", isActive: true, description: "Pupuk kompos organik siap pakai", createdAt: new Date(2026, 0, 17), updatedAt: new Date(2026, 0, 18) },
  { id: "prod-010", name: "Tempat Sabun Kayu", sku: "SKU-010", price: 40000, stock: 90, category: "Perawatan Diri", isActive: true, description: "Tempat sabun dari kayu jati daur ulang", createdAt: new Date(2026, 0, 19), updatedAt: new Date(2026, 0, 20) },
  { id: "prod-011", name: "Kain Lap Microfiber", sku: "SKU-011", price: 35000, stock: 250, category: "Dapur", isActive: true, description: "Kain lap ramah lingkungan pengganti tisu", createdAt: new Date(2026, 0, 21), updatedAt: new Date(2026, 0, 22) },
  { id: "prod-012", name: "Minyak Esensial Eucalyptus", sku: "SKU-012", price: 75000, stock: 70, category: "Perawatan Diri", isActive: true, description: "Minyak esensial murni 100% alami", createdAt: new Date(2026, 0, 23), updatedAt: new Date(2026, 0, 24) },
];
