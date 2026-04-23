export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING_VERIFICATION";
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
};

export const dummyCustomers: Customer[] = [
  { id: "cust-001", fullName: "Budi Santoso", email: "budi@mail.com", phone: "0812-0001-0001", status: "ACTIVE", totalOrders: 12, totalSpent: 1850000, createdAt: new Date(2026, 0, 1) },
  { id: "cust-002", fullName: "Siti Rahayu", email: "siti@mail.com", phone: "0812-0001-0002", status: "ACTIVE", totalOrders: 8, totalSpent: 920000, createdAt: new Date(2026, 0, 2) },
  { id: "cust-003", fullName: "Ahmad Fauzi", email: "ahmad@mail.com", phone: "0812-0001-0003", status: "SUSPENDED", totalOrders: 3, totalSpent: 450000, createdAt: new Date(2026, 0, 3) },
  { id: "cust-004", fullName: "Dewi Lestari", email: "dewi@mail.com", phone: "0812-0001-0004", status: "PENDING_VERIFICATION", totalOrders: 0, totalSpent: 0, createdAt: new Date(2026, 0, 4) },
  { id: "cust-005", fullName: "Rizky Pratama", email: "rizky@mail.com", phone: "0812-0001-0005", status: "ACTIVE", totalOrders: 25, totalSpent: 4200000, createdAt: new Date(2026, 0, 5) },
  { id: "cust-006", fullName: "Rina Wulandari", email: "rina@mail.com", phone: "0812-0001-0006", status: "BANNED", totalOrders: 1, totalSpent: 125000, createdAt: new Date(2026, 0, 6) },
  { id: "cust-007", fullName: "Hendra Gunawan", email: "hendra@mail.com", phone: "0812-0001-0007", status: "ACTIVE", totalOrders: 17, totalSpent: 2750000, createdAt: new Date(2026, 0, 7) },
  { id: "cust-008", fullName: "Maya Sari", email: "maya@mail.com", phone: "0812-0001-0008", status: "PENDING_VERIFICATION", totalOrders: 0, totalSpent: 0, createdAt: new Date(2026, 0, 8) },
  { id: "cust-009", fullName: "Doni Kusuma", email: "doni@mail.com", phone: "0812-0001-0009", status: "ACTIVE", totalOrders: 6, totalSpent: 780000, createdAt: new Date(2026, 0, 9) },
  { id: "cust-010", fullName: "Fitri Handayani", email: "fitri@mail.com", phone: "0812-0001-0010", status: "SUSPENDED", totalOrders: 4, totalSpent: 560000, createdAt: new Date(2026, 0, 10) },
  { id: "cust-011", fullName: "Agus Setiawan", email: "agus@mail.com", phone: "0812-0001-0011", status: "ACTIVE", totalOrders: 31, totalSpent: 5100000, createdAt: new Date(2026, 0, 11) },
  { id: "cust-012", fullName: "Lina Marlina", email: "lina@mail.com", phone: "0812-0001-0012", status: "ACTIVE", totalOrders: 9, totalSpent: 1100000, createdAt: new Date(2026, 0, 12) },
];
