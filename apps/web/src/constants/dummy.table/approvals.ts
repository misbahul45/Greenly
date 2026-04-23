export type Approval = {
  id: string;
  shopName: string;
  ownerName: string;
  ownerEmail: string;
  businessType: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date;
  reviewedAt?: Date;
  note?: string;
};

export const dummyApprovals: Approval[] = [
  { id: "apv-001", shopName: "Toko Hijau Nusantara", ownerName: "Budi Santoso", ownerEmail: "budi@mail.com", businessType: "Retail", status: "PENDING", submittedAt: new Date(2026, 0, 1) },
  { id: "apv-002", shopName: "EcoStore Indonesia", ownerName: "Siti Rahayu", ownerEmail: "siti@mail.com", businessType: "Online", status: "APPROVED", submittedAt: new Date(2026, 0, 2), reviewedAt: new Date(2026, 0, 4) },
  { id: "apv-003", shopName: "Green Life Shop", ownerName: "Ahmad Fauzi", ownerEmail: "ahmad@mail.com", businessType: "Retail", status: "REJECTED", submittedAt: new Date(2026, 0, 3), reviewedAt: new Date(2026, 0, 5), note: "Dokumen tidak lengkap" },
  { id: "apv-004", shopName: "Natural Goods", ownerName: "Dewi Lestari", ownerEmail: "dewi@mail.com", businessType: "Wholesale", status: "PENDING", submittedAt: new Date(2026, 0, 6) },
  { id: "apv-005", shopName: "Organic World", ownerName: "Rizky Pratama", ownerEmail: "rizky@mail.com", businessType: "Online", status: "APPROVED", submittedAt: new Date(2026, 0, 7), reviewedAt: new Date(2026, 0, 9) },
  { id: "apv-006", shopName: "Bumi Lestari", ownerName: "Rina Wulandari", ownerEmail: "rina@mail.com", businessType: "Retail", status: "PENDING", submittedAt: new Date(2026, 0, 10) },
  { id: "apv-007", shopName: "Daun Hijau Store", ownerName: "Hendra Gunawan", ownerEmail: "hendra@mail.com", businessType: "Online", status: "REJECTED", submittedAt: new Date(2026, 0, 11), reviewedAt: new Date(2026, 0, 13), note: "Tidak memenuhi syarat" },
  { id: "apv-008", shopName: "Alam Segar", ownerName: "Maya Sari", ownerEmail: "maya@mail.com", businessType: "Wholesale", status: "PENDING", submittedAt: new Date(2026, 0, 14) },
  { id: "apv-009", shopName: "Eco Friendly Shop", ownerName: "Doni Kusuma", ownerEmail: "doni@mail.com", businessType: "Retail", status: "APPROVED", submittedAt: new Date(2026, 0, 15), reviewedAt: new Date(2026, 0, 17) },
  { id: "apv-010", shopName: "Hijau Bersama", ownerName: "Fitri Handayani", ownerEmail: "fitri@mail.com", businessType: "Online", status: "PENDING", submittedAt: new Date(2026, 0, 18) },
  { id: "apv-011", shopName: "Rempah Organik", ownerName: "Agus Setiawan", ownerEmail: "agus@mail.com", businessType: "Wholesale", status: "APPROVED", submittedAt: new Date(2026, 0, 19), reviewedAt: new Date(2026, 0, 21) },
  { id: "apv-012", shopName: "Segar Alami", ownerName: "Lina Marlina", ownerEmail: "lina@mail.com", businessType: "Retail", status: "PENDING", submittedAt: new Date(2026, 0, 22) },
];
