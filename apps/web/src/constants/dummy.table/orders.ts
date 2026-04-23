export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  shopName: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
};

export const dummyOrders: Order[] = [
  { id: "ord-001", orderNumber: "ORD-0001", customerName: "Budi Santoso", shopName: "Toko Hijau", totalAmount: 235000, status: "PENDING", createdAt: new Date(2026, 0, 1) },
  { id: "ord-002", orderNumber: "ORD-0002", customerName: "Siti Rahayu", shopName: "EcoStore", totalAmount: 180000, status: "PAID", createdAt: new Date(2026, 0, 3) },
  { id: "ord-003", orderNumber: "ORD-0003", customerName: "Ahmad Fauzi", shopName: "Green Life", totalAmount: 320000, status: "PROCESSING", createdAt: new Date(2026, 0, 5) },
  { id: "ord-004", orderNumber: "ORD-0004", customerName: "Dewi Lestari", shopName: "Toko Hijau", totalAmount: 95000, status: "SHIPPED", createdAt: new Date(2026, 0, 7) },
  { id: "ord-005", orderNumber: "ORD-0005", customerName: "Rizky Pratama", shopName: "NaturalShop", totalAmount: 450000, status: "COMPLETED", createdAt: new Date(2026, 0, 9) },
  { id: "ord-006", orderNumber: "ORD-0006", customerName: "Rina Wulandari", shopName: "EcoStore", totalAmount: 125000, status: "CANCELLED", createdAt: new Date(2026, 0, 11) },
  { id: "ord-007", orderNumber: "ORD-0007", customerName: "Hendra Gunawan", shopName: "Green Life", totalAmount: 275000, status: "PENDING", createdAt: new Date(2026, 0, 13) },
  { id: "ord-008", orderNumber: "ORD-0008", customerName: "Maya Sari", shopName: "Toko Hijau", totalAmount: 390000, status: "PAID", createdAt: new Date(2026, 0, 15) },
  { id: "ord-009", orderNumber: "ORD-0009", customerName: "Doni Kusuma", shopName: "NaturalShop", totalAmount: 210000, status: "PROCESSING", createdAt: new Date(2026, 0, 17) },
  { id: "ord-010", orderNumber: "ORD-0010", customerName: "Fitri Handayani", shopName: "EcoStore", totalAmount: 165000, status: "SHIPPED", createdAt: new Date(2026, 0, 19) },
  { id: "ord-011", orderNumber: "ORD-0011", customerName: "Agus Setiawan", shopName: "Green Life", totalAmount: 540000, status: "COMPLETED", createdAt: new Date(2026, 0, 21) },
  { id: "ord-012", orderNumber: "ORD-0012", customerName: "Lina Marlina", shopName: "Toko Hijau", totalAmount: 88000, status: "PENDING", createdAt: new Date(2026, 0, 23) },
];
