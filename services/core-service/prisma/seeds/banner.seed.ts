import { PrismaClient } from "../../generated/prisma/client";

export async function seedBanners(prisma: PrismaClient, promoIds: string[]) {
    const future = new Date("2026-12-31T23:59:59Z");
    const past = new Date("2025-01-01T00:00:00Z");

    // 5 Banner Utama (Platform & Promo)
    const platformBanners = [
        {
            title: "Greenly Eco Fest — Hemat Hingga 25% untuk Produk Hijau",
            description: "Perayaan belanja produk ramah lingkungan: zero waste, organik, sustainable fashion, dan green technology.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pwIqii5F0EnHZwk9itfhKbPQzUrlByMFRoumjq", // Gambar daun/alam hijau
            promotionId: promoIds[9] ?? null,
            isActive: true,
            position: 1,
            startDate: past,
            endDate: future,
            type: "PROMO" as const,
        },
        {
            title: "Selamat Datang di Greenly — Mulai Eco Living Hari Ini",
            description: "Temukan produk eco-friendly pilihan untuk membantu gaya hidup lebih hemat, sehat, dan berkelanjutan.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pw6kdBuw5LyApYEHq3UsFjwOgGdx5oX2hzRTQ6", // Estetika tanaman dalam ruangan
            promotionId: promoIds[0] ?? null,
            isActive: true,
            position: 2,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Flash Sale Zero Waste — Diskon 20% Produk Pilihan",
            description: "Belanja tumbler, tas pakai ulang, wadah makanan, dan kebutuhan zero waste lainnya dengan harga spesial.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pw5K6td5MCYBIkcd7Lwe0PrRvG6Nj9UXnDZAzV", // Wadah kaca zero waste
            promotionId: promoIds[2] ?? null,
            isActive: true,
            position: 3,
            startDate: past,
            endDate: future,
            type: "PROMO" as const,
        },
        {
            title: "Gratis Ongkir untuk Order di Atas Rp 75.000",
            description: "Belanja produk hijau lebih hemat dengan pengiriman ramah lingkungan untuk pesanan pilihan.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pw7lccVTE4XjJqcruKHvponI78PZLGelQbDgxM", // Packaging kertas daur ulang
            promotionId: promoIds[3] ?? null,
            isActive: true,
            position: 4,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Earth Day Every Day — Pilih Produk yang Lebih Baik",
            description: "Dukung gaya hidup berkelanjutan dengan produk organik, reusable, recyclable, dan eco-certified.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pw85pFblwSmvBu1kPX4TYIRMh5aqJoCw0sDyjf", // Tangan memegang tanah & tunas
            promotionId: promoIds[4] ?? null,
            isActive: true,
            position: 5,
            startDate: past,
            endDate: future,
            type: "EVENT" as const,
        },
    ];

    for (const b of platformBanners) {
        const existing = await prisma.banner.findFirst({
            where: {
                title: b.title,
                deletedAt: null,
            },
        });

        if (existing) continue;

        await prisma.banner.create({
            data: {
                title: b.title,
                description: b.description,
                imageUrl: b.imageUrl,
                promotionId: b.promotionId,
                isActive: b.isActive,
                position: b.position,
                startDate: b.startDate,
                endDate: b.endDate,
                type: b.type,
            },
        });
    }

    // 3 Banner Spesifik Toko
    const shopBanners = [
        {
            title: "EcoWare Indonesia — Zero Waste Lifestyle Starts Here",
            description: "Produk reusable untuk hidup minim sampah: tumbler, botol stainless, tas belanja, dan wadah makanan.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pw5aLkDRMCYBIkcd7Lwe0PrRvG6Nj9UXnDZAzV", // Gelas/Tumbler reusable
            isActive: true,
            position: 6,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Bumi Hijau Fashion — Tampil Stylish, Jaga Bumi",
            description: "Koleksi sustainable fashion dari bahan organik, linen, hemp, dan material rendah dampak lingkungan.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pwfwbPv8bjG3IovPRT59QcBWEZL6U4M0aw2dzn", // Rak pakaian minimalis/natural
            isActive: true,
            position: 7,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Organik Nusantara — Dari Alam untuk Kesehatan",
            description: "Produk pangan organik dari petani lokal: sayur, buah, rempah, beras, dan kebutuhan dapur sehat.",
            imageUrl: "https://4s0138q05g.ufs.sh/f/L7c2JRqY80pwtFWK3RinbEum13KN4jh5fHDOr8GQwzqYIiBM", // Keranjang sayuran segar
            isActive: true,
            position: 8,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
    ];

    for (const b of shopBanners) {
        const existing = await prisma.banner.findFirst({
            where: {
                title: b.title,
                deletedAt: null,
            },
        });

        if (existing) continue;

        await prisma.banner.create({
            data: {
                title: b.title,
                description: b.description,
                imageUrl: b.imageUrl,
                isActive: b.isActive,
                position: b.position,
                startDate: b.startDate,
                endDate: b.endDate,
                type: b.type,
            },
        });
    }

    console.log("✅ Greenly Banners Seeded Successfully (8 items)");
}