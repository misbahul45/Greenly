import {PrismaClient} from "../../generated/prisma/client";

const bannerImage = (fileName: string) => {
    const baseUrl = process.env.PUBLIC_ASSET_URL ?? "http://localhost:3000";
    return `${baseUrl}/banners/${fileName}`;
};

export async function seedBanners(prisma: PrismaClient, promoIds: string[]) {
    const future = new Date("2026-12-31T23:59:59Z");
    const past = new Date("2025-01-01T00:00:00Z");

    const platformBanners = [
        {
            title: "Greenly Eco Fest — Hemat Hingga 25% untuk Produk Hijau",
            description:
                "Perayaan belanja produk ramah lingkungan: zero waste, organik, sustainable fashion, dan green technology.",
            imageUrl: bannerImage("greenly-eco-fest.webp"),
            promotionId: promoIds[9] ?? null,
            isActive: true,
            position: 1,
            startDate: past,
            endDate: future,
            type: "PROMO" as const,
        },
        {
            title: "Selamat Datang di Greenly — Mulai Eco Living Hari Ini",
            description:
                "Temukan produk eco-friendly pilihan untuk membantu gaya hidup lebih hemat, sehat, dan berkelanjutan.",
            imageUrl: bannerImage("greenly-welcome.webp"),
            promotionId: promoIds[0] ?? null,
            isActive: true,
            position: 2,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Flash Sale Zero Waste — Diskon 20% Produk Pilihan",
            description:
                "Belanja tumbler, tas pakai ulang, wadah makanan, dan kebutuhan zero waste lainnya dengan harga spesial.",
            imageUrl: bannerImage("greenly-zero-waste-sale.webp"),
            promotionId: promoIds[2] ?? null,
            isActive: true,
            position: 3,
            startDate: past,
            endDate: future,
            type: "PROMO" as const,
        },
        {
            title: "Gratis Ongkir untuk Order di Atas Rp 75.000",
            description:
                "Belanja produk hijau lebih hemat dengan pengiriman ramah lingkungan untuk pesanan pilihan.",
            imageUrl: bannerImage("greenly-free-shipping.webp"),
            promotionId: promoIds[3] ?? null,
            isActive: true,
            position: 4,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Earth Day Every Day — Pilih Produk yang Lebih Baik",
            description:
                "Dukung gaya hidup berkelanjutan dengan produk organik, reusable, recyclable, dan eco-certified.",
            imageUrl: bannerImage("greenly-earth-day.webp"),
            promotionId: promoIds[4] ?? null,
            isActive: true,
            position: 5,
            startDate: past,
            endDate: future,
            type: "EVENT" as const,
        },
        {
            title: "Cashback Rp 100.000 untuk Transaksi di Atas 500K",
            description:
                "Lengkapi kebutuhan eco-living kamu dan dapatkan cashback untuk pembelian produk hijau pilihan.",
            imageUrl: bannerImage("greenly-cashback.webp"),
            promotionId: promoIds[6] ?? null,
            isActive: true,
            position: 6,
            startDate: past,
            endDate: future,
            type: "PROMO" as const,
        },
        {
            title: "Weekend Eco Sale — Belanja Hijau Setiap Akhir Pekan",
            description:
                "Nikmati promo akhir pekan untuk produk organik, sustainable fashion, dan kebutuhan rumah ramah lingkungan.",
            imageUrl: bannerImage("greenly-weekend-sale.webp"),
            promotionId: promoIds[7] ?? null,
            isActive: true,
            position: 7,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Pengguna Baru — Diskon 30% untuk Order Pertama",
            description:
                "Mulai perjalanan eco-shopping kamu dengan diskon spesial khusus pengguna baru Greenly.",
            imageUrl: bannerImage("greenly-new-user.webp"),
            promotionId: promoIds[5] ?? null,
            isActive: true,
            position: 8,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Hari Lingkungan Hidup — Promo Spesial 5 Juni",
            description:
                "Rayakan Hari Lingkungan Hidup dengan memilih produk yang lebih bertanggung jawab untuk bumi.",
            imageUrl: bannerImage("greenly-environment-day.webp"),
            promotionId: null,
            isActive: true,
            position: 9,
            startDate: new Date("2026-06-01T00:00:00Z"),
            endDate: new Date("2026-06-07T23:59:59Z"),
            type: "EVENT" as const,
        },
        {
            title: "Potongan Langsung Rp 50.000 untuk Produk Organik",
            description:
                "Belanja bahan pangan organik, skincare alami, dan kebutuhan rumah sehat dengan potongan langsung.",
            imageUrl: bannerImage("greenly-organic-discount.webp"),
            promotionId: promoIds[1] ?? null,
            isActive: true,
            position: 10,
            startDate: past,
            endDate: future,
            type: "PROMO" as const,
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

    const shopBanners = [
        {
            title: "EcoWare Indonesia — Zero Waste Lifestyle Starts Here",
            description:
                "Produk reusable untuk hidup minim sampah: tumbler, botol stainless, tas belanja, dan wadah makanan.",
            imageUrl: bannerImage("shop-ecoware.webp"),
            isActive: true,
            position: 1,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Bumi Hijau Fashion — Tampil Stylish, Jaga Bumi",
            description:
                "Koleksi sustainable fashion dari bahan organik, linen, hemp, dan material rendah dampak lingkungan.",
            imageUrl: bannerImage("shop-bumi-hijau-fashion.webp"),
            isActive: true,
            position: 1,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Organik Nusantara — Dari Alam untuk Kesehatan",
            description:
                "Produk pangan organik dari petani lokal: sayur, buah, rempah, beras, dan kebutuhan dapur sehat.",
            imageUrl: bannerImage("shop-organik-nusantara.webp"),
            isActive: true,
            position: 1,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Pure Nature Beauty — Cantik Alami, Ramah Bumi",
            description:
                "Skincare dan personal care berbahan alami, cruelty-free, dan ramah lingkungan.",
            imageUrl: bannerImage("shop-pure-nature-beauty.webp"),
            isActive: true,
            position: 1,
            startDate: past,
            endDate: future,
            type: "HOME" as const,
        },
        {
            title: "Green Tech Solutions — Teknologi untuk Masa Depan",
            description:
                "Solusi green technology seperti panel surya portable, lampu hemat energi, dan perangkat outdoor eco-friendly.",
            imageUrl: bannerImage("shop-green-tech.webp"),
            isActive: true,
            position: 1,
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

    console.log("✅ Greenly Banners Seeded Successfully");
}
