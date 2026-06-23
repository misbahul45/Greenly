package seeds

import (
	"catalog-service/databases"
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)


func SeedProducts(ctx context.Context, db *mongo.Database, catIDs map[string]string) []string {
    col := db.Collection("products")
    now := time.Now()

    // WAJIB pakai ID statis agar sinkron dengan database Prisma (core-service)
    shop1 := "shop_ecoware_001"
    shop2 := "shop_bumihijau_002"
    shop3 := "shop_organik_003"
    shop4 := "shop_purenature_004"
    shop5 := "shop_greentech_005"

    const (
        nameShop1 = "EcoWare Indonesia"
        nameShop2 = "Bumi Hijau Fashion"
        nameShop3 = "Organik Nusantara"
        nameShop4 = "Pure Nature Beauty"
        nameShop5 = "Green Tech Solutions"
    )

    type productDef struct {
        shopID      string
        shopName    string
        categoryKey string
        name        string
        slug        string
        description string
        sku         string
        favorite    int
        review      int
        rating      float64
    }

    defs := []productDef{
        // --- SHOP 1: EcoWare Indonesia ---
        {shop1, nameShop1, "botol-tumbler", "Botol Minum Stainless Steel Thermos 500ml", "botol-minum-stainless-thermos-500ml", "Botol minum double wall stainless, menjaga suhu panas 12 jam.", "SKU-BTL-001", 312, 134, 4.8},
        {shop1, nameShop1, "botol-tumbler", "Tumbler Bambu Premium 350ml", "tumbler-bambu-premium-350ml", "Tumbler eco-friendly dari bambu organik.", "SKU-BTL-002", 198, 87, 4.7},
        {shop1, nameShop1, "tas-ramah-lingkungan", "Tas Belanja Kanvas Organik Large", "tas-belanja-kanvas-organik-large", "Tas belanja dari kanvas katun organik, kuat menampung 10kg.", "SKU-TAS-001", 256, 112, 4.8},
        {shop1, nameShop1, "tas-ramah-lingkungan", "Tas Anyaman Bambu Artisanal", "tas-anyaman-bambu-artisanal", "Tas anyaman bambu handmade oleh pengrajin lokal.", "SKU-TAS-002", 178, 76, 4.7},
        {shop1, nameShop1, "alat-makan-eco", "Set Sedotan Stainless Steel Isi 6", "set-sedotan-stainless-steel-isi-6", "Set sedotan stainless dengan sikat pembersih.", "SKU-SDT-001", 445, 187, 4.9},
        {shop1, nameShop1, "alat-makan-eco", "Set Peralatan Makan Bambu 5pcs", "set-peralatan-makan-bambu-5pcs", "Set sendok, garpu, pisau dari bambu organik.", "SKU-PMK-001", 267, 115, 4.7},
        {shop1, nameShop1, "peralatan-rumah-eco", "Lilin Aromaterapi Soy Wax 150gr", "lilin-aromaterapi-soy-wax-150gr", "Lilin aromaterapi dari soy wax alami tanpa paraben.", "SKU-LLN-001", 189, 82, 4.8},
        {shop1, nameShop1, "peralatan-rumah-eco", "Lap Dapur Microfiber Daur Ulang Set 5", "lap-dapur-microfiber-daur-ulang-set-5", "Lap dapur super absorbent dari serat daur ulang.", "SKU-LAP-001", 134, 58, 4.6},
        {shop1, nameShop1, "furnitur-bambu", "Rak Mini Bambu 3 Susun Desktop", "rak-mini-bambu-3-susun-desktop", "Rak meja minimalis dari bambu solid organik.", "SKU-RAK-001", 223, 94, 4.7},
        {shop1, nameShop1, "peralatan-rumah-eco", "Spons Cuci Piring Loofah Alami", "spons-cuci-piring-loofah-alami", "Spons cuci piring dari gambas/loofah 100% compostable.", "SKU-SPN-001", 150, 45, 4.8}, // TAMBAHAN

        // --- SHOP 2: Bumi Hijau Fashion ---
        {shop2, nameShop2, "pakaian-sustainable", "Kaos Katun Organik GOTS Certified", "kaos-katun-organik-gots", "Kaos unisex dari 100% katun organik bebas pestisida.", "SKU-KOS-001", 334, 143, 4.8},
        {shop2, nameShop2, "pakaian-sustainable", "Celana Linen Natural Unisex", "celana-linen-natural-unisex", "Celana dari serat linen alami breathable.", "SKU-CLN-001", 267, 116, 4.7},
        {shop2, nameShop2, "pakaian-sustainable", "Jaket Hemp Organik Unisex", "jaket-hemp-organik-unisex", "Jaket serat hemp organik, 4x lebih kuat dari katun.", "SKU-JKT-001", 189, 82, 4.6},
        {shop2, nameShop2, "aksesoris-eco", "Topi Anyaman Bambu Pantai", "topi-anyaman-bambu-pantai", "Topi pantai stylish dari anyaman bambu.", "SKU-TOP-001", 156, 67, 4.7},
        {shop2, nameShop2, "aksesoris-eco", "Dompet Cork Oak Vegan Leather", "dompet-cork-oak-vegan-leather", "Dompet slim dari kulit pohon oak (cork) vegan.", "SKU-DMP-001", 234, 98, 4.8},
        {shop2, nameShop2, "aksesoris-eco", "Kacamata Frame Bambu Handcrafted", "kacamata-frame-bambu-handcrafted", "Frame kacamata dari bambu pilihan diukir tangan.", "SKU-KCM-001", 145, 62, 4.6},
        {shop2, nameShop2, "aksesoris-eco", "Kaos Kaki Serat Bambu Anti Bakteri", "kaos-kaki-serat-bambu", "Kaos kaki lembut dari serat bambu alami yang anti bau.", "SKU-KSK-001", 210, 88, 4.9}, // TAMBAHAN

        // --- SHOP 3: Organik Nusantara ---
        {shop3, nameShop3, "makanan-organik", "Beras Organik Premium Cianjur 1kg", "beras-organik-premium-cianjur", "Beras putih organik bersertifikat SNI.", "SKU-BRS-001", 421, 178, 4.9},
        {shop3, nameShop3, "makanan-organik", "Teh Hijau Organik Single Estate 100gr", "teh-hijau-organik-single-estate", "Teh hijau organik dari perkebunan Jawa Barat.", "SKU-TEH-001", 312, 134, 4.8},
        {shop3, nameShop3, "makanan-organik", "Madu Hutan Kalimantan Raw 250gr", "madu-hutan-kalimantan-raw", "Madu hutan asli Kalimantan raw unprocessed.", "SKU-MDU-001", 387, 165, 4.9},
        {shop3, nameShop3, "makanan-organik", "Granola Oat Organik Homemade 300gr", "granola-oat-organik-homemade", "Granola dari oat organik tanpa pengawet.", "SKU-GRN-001", 289, 124, 4.7},
        {shop3, nameShop3, "makanan-organik", "Kopi Arabika Organik Flores 250gr", "kopi-arabika-organik-flores", "Kopi arabika single origin organik dari Flores.", "SKU-KPI-001", 356, 152, 4.8},
        {shop3, nameShop3, "pertanian-tanaman", "Kit Berkebun Hidroponik Pemula", "kit-berkebun-hidroponik-pemula", "Kit lengkap berkebun hidroponik indoor.", "SKU-HDP-001", 198, 84, 4.7},
        {shop3, nameShop3, "pertanian-tanaman", "Pupuk Organik Cair NPK 500ml", "pupuk-organik-cair-npk", "Pupuk cair organik dari fermentasi limbah.", "SKU-PPK-001", 167, 72, 4.6},
        {shop3, nameShop3, "makanan-organik", "Gula Aren Organik Semut 250gr", "gula-aren-organik-semut", "Gula aren murni indeks glikemik rendah.", "SKU-GLA-001", 340, 110, 4.8}, // TAMBAHAN

        // --- SHOP 4: Pure Nature Beauty ---
        {shop4, nameShop4, "skincare-alami", "Serum Rosehip Organik 30ml", "serum-rosehip-organik", "Serum wajah dari minyak rosehip organik murni.", "SKU-SRM-001", 534, 226, 4.9},
        {shop4, nameShop4, "skincare-alami", "Pelembab Shea Butter Alami 60ml", "pelembab-shea-butter-alami", "Pelembab dari shea butter organik fair-trade.", "SKU-PLB-001", 412, 175, 4.8},
        {shop4, nameShop4, "skincare-alami", "Toner Rose Water Organik 200ml", "toner-rose-water-organik", "Toner dari air mawar organik murni distilasi uap.", "SKU-TNR-001", 378, 161, 4.8},
        {shop4, nameShop4, "skincare-alami", "Sunscreen Mineral SPF50 Natural", "sunscreen-mineral-spf50", "Sunscreen mineral zinc oxide non-nano alami.", "SKU-SUN-001", 623, 265, 4.9},
        {shop4, nameShop4, "sabun-alami", "Sikat Gigi Bambu Charcoal Pack 4", "sikat-gigi-bambu-charcoal", "Sikat gigi bambu dengan bulu arang aktif.", "SKU-SBG-001", 489, 208, 4.9},
        {shop4, nameShop4, "sabun-alami", "Sabun Batang Alami Lavender 100gr", "sabun-batang-alami-lavender", "Sabun cold process tanpa SLS dan paraben.", "SKU-SBN-001", 356, 152, 4.8},
        {shop4, nameShop4, "haircare-organik", "Sampo Padat Organik Zero Waste", "sampo-padat-organik-zero-waste", "Sampo padat zero-waste packaging setara 2 botol.", "SKU-SMP-001", 312, 133, 4.7},
        {shop4, nameShop4, "skincare-alami", "Deodoran Natural Tawas & Aloe Vera", "deodoran-natural-tawas", "Deodoran alami tanpa aluminium klorohidrat.", "SKU-DEO-001", 275, 95, 4.7}, // TAMBAHAN

        // --- SHOP 5: Green Tech Solutions ---
        {shop5, nameShop5, "panel-surya", "Panel Surya Portable 20W USB", "panel-surya-portable-20w", "Panel surya lipat portable untuk camping.", "SKU-PSR-001", 178, 76, 4.7},
        {shop5, nameShop5, "produk-hemat-energi", "Lampu LED Smart Hemat Energi 9W", "lampu-led-smart-hemat-energi", "Lampu LED hemat energi 80% dapat diredupkan.", "SKU-LMP-001", 234, 98, 4.6},
        {shop5, nameShop5, "produk-hemat-energi", "Powerbank Tenaga Surya 10000mAh", "powerbank-tenaga-surya", "Powerbank tangguh yang bisa di-charge dengan cahaya matahari.", "SKU-PWB-001", 185, 60, 4.8}, // TAMBAHAN
    }

    products := make([]databases.Product, len(defs))
    ids := make([]string, len(defs))
    for i, d := range defs {
        id := NewID() // ID unik produk tetap di-generate
        ids[i] = id
        products[i] = databases.Product{
            Base:          databases.Base{ID: id, CreatedAt: now, UpdatedAt: now},
            ShopID:        d.shopID,
            ShopName:      d.shopName,
            CategoryID:    catIDs[d.categoryKey],
            Name:          d.name,
            Slug:          d.slug,
            Description:   d.description,
            SKU:           d.sku,
            FavoriteCount: d.favorite,
            ReviewCount:   d.review,
            RatingAverage: d.rating,
            IsActive:      true,
        }
    }

    docs := make([]interface{}, len(products))
    for i, p := range products {
        docs[i] = p
    }
    if _, err := col.InsertMany(ctx, docs); err != nil {
        log.Printf("⚠️  Products insert: %v", err)
    }

    log.Printf("✅ Products seeded (%d)", len(products))
    return ids
}
