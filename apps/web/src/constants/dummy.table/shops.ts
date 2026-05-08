export type Shop = {
  id: string;
  name: string;
  owner: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  balance: number;
  totalProducts: number;
  createdAt: Date;
};

export const dummyShops: Shop[] = [
  { id: "shop-001", name: "Toko Hijau Nusantara", owner: "Budi Santoso", email: "budi@mail.com", status: "APPROVED", balance: 3500000, totalProducts: 24, createdAt: new Date(2026, 0, 1) },
  { id: "shop-002", name: "EcoStore Indonesia", owner: "Siti Rahayu", email: "siti@mail.com", status: "APPROVED", balance: 1200000, totalProducts: 15, createdAt: new Date(2026, 0, 3) },
  { id: "shop-003", name: "Green Life Shop", owner: "Ahmad Fauzi", email: "ahmad@mail.com", status: "SUSPENDED", balance: 0, totalProducts: 8, createdAt: new Date(2026, 0, 5) },
  { id: "shop-004", name: "Natural Goods", owner: "Dewi Lestari", email: "dewi@mail.com", status: "PENDING", balance: 0, totalProducts: 0, createdAt: new Date(2026, 0, 7) },
  { id: "shop-005", name: "Organic World", owner: "Rizky Pratama", email: "rizky@mail.com", status: "APPROVED", balance: 5800000, totalProducts: 42, createdAt: new Date(2026, 0, 9) },
  { id: "shop-006", name: "Bumi Lestari", owner: "Rina Wulandari", email: "rina@mail.com", status: "REJECTED", balance: 0, totalProducts: 0, createdAt: new Date(2026, 0, 11) },
  { id: "shop-007", name: "Daun Hijau Store", owner: "Hendra Gunawan", email: "hendra@mail.com", status: "APPROVED", balance: 2100000, totalProducts: 18, createdAt: new Date(2026, 0, 13) },
  { id: "shop-008", name: "Alam Segar", owner: "Maya Sari", email: "maya@mail.com", status: "PENDING", balance: 0, totalProducts: 0, createdAt: new Date(2026, 0, 15) },
  { id: "shop-009", name: "Eco Friendly Shop", owner: "Doni Kusuma", email: "doni@mail.com", status: "APPROVED", balance: 950000, totalProducts: 11, createdAt: new Date(2026, 0, 17) },
  { id: "shop-010", name: "Hijau Bersama", owner: "Fitri Handayani", email: "fitri@mail.com", status: "SUSPENDED", balance: 300000, totalProducts: 6, createdAt: new Date(2026, 0, 19) },
  { id: "shop-011", name: "Rempah Organik", owner: "Agus Setiawan", email: "agus@mail.com", status: "APPROVED", balance: 4200000, totalProducts: 33, createdAt: new Date(2026, 0, 21) },
  { id: "shop-012", name: "Segar Alami", owner: "Lina Marlina", email: "lina@mail.com", status: "PENDING", balance: 0, totalProducts: 0, createdAt: new Date(2026, 0, 23) },
];
