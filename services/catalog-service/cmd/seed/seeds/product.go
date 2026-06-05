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

	shop1 := NewID() // EcoWare Indonesia
	shop2 := NewID() // Bumi Hijau Fashion
	shop3 := NewID() // Organik Nusantara
	shop4 := NewID() // Pure Nature Beauty
	shop5 := NewID() // Green Tech Solutions

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
		// EcoWare Indonesia — zero waste & rumah eco
		{shop1, nameShop1, "botol-tumbler",       "Botol Minum Stainless Steel Thermos 500ml",  "botol-minum-stainless-thermos-500ml",    "Botol minum double wall stainless steel 304 food grade bebas BPA, menjaga suhu panas 12 jam dan dingin 24 jam, tidak ada rasa logam", "SKU-BTL-001", 312, 134, 4.8},
		{shop1, nameShop1, "botol-tumbler",       "Tumbler Bambu Premium 350ml",                "tumbler-bambu-premium-350ml",            "Tumbler eco-friendly dari bambu organik bersertifikat dengan lapisan food-grade, ramah lingkungan dan dapat terurai secara alami", "SKU-BTL-002", 198, 87,  4.7},
		{shop1, nameShop1, "tas-ramah-lingkungan","Tas Belanja Kanvas Organik Large",           "tas-belanja-kanvas-organik-large",       "Tas belanja dari kanvas katun organik bersertifikat GOTS, kuat menampung beban 10kg, dapat digunakan ribuan kali", "SKU-TAS-001", 256, 112, 4.8},
		{shop1, nameShop1, "tas-ramah-lingkungan","Tas Anyaman Bambu Artisanal",                "tas-anyaman-bambu-artisanal",            "Tas anyaman bambu handmade oleh pengrajin lokal Indonesia, desain unik dan estetik, 100% natural dan biodegradable", "SKU-TAS-002", 178, 76,  4.7},
		{shop1, nameShop1, "alat-makan-eco",      "Set Sedotan Stainless Steel Isi 6",          "set-sedotan-stainless-steel-isi-6",      "Set 6 sedotan stainless steel food grade 304 dengan sikat pembersih, pouch kanvas, dan gantungan kunci, pengganti sedotan plastik", "SKU-SDT-001", 445, 187, 4.9},
		{shop1, nameShop1, "alat-makan-eco",      "Set Peralatan Makan Bambu 5pcs",             "set-peralatan-makan-bambu-5pcs",         "Set lengkap peralatan makan dari bambu organik: sendok, garpu, pisau, sumpit, dan sedotan dalam pouch kanvas, bebas plastik", "SKU-PMK-001", 267, 115, 4.7},
		{shop1, nameShop1, "peralatan-rumah-eco", "Lilin Aromaterapi Soy Wax 150gr",            "lilin-aromaterapi-soy-wax-150gr",        "Lilin aromaterapi dari soy wax alami dengan sumbu kapas organik, aroma campuran lavender dan eucalyptus, tanpa paraben dan partikel mikro", "SKU-LLN-001", 189, 82,  4.8},
		{shop1, nameShop1, "peralatan-rumah-eco", "Lap Dapur Microfiber Daur Ulang Set 5",      "lap-dapur-microfiber-daur-ulang-set-5",  "Set 5 lap dapur super absorbent dari serat microfiber daur ulang, menggantikan tisu sekali pakai, dapat dicuci 300 kali", "SKU-LAP-001", 134, 58,  4.6},
		{shop1, nameShop1, "furnitur-bambu",      "Rak Mini Bambu 3 Susun Desktop",             "rak-mini-bambu-3-susun-desktop",         "Rak meja minimalis dari bambu solid organik 3 susun, diproses tanpa bahan kimia berbahaya, tahan serangga secara alami", "SKU-RAK-001", 223, 94,  4.7},

		// Bumi Hijau Fashion — sustainable fashion
		{shop2, nameShop2, "pakaian-sustainable", "Kaos Katun Organik GOTS Certified Unisex",   "kaos-katun-organik-gots-unisex",         "Kaos unisex bersertifikat GOTS dari 100% katun organik bebas pestisida, pewarna alami aman kulit, nyaman sepanjang hari", "SKU-KOS-001", 334, 143, 4.8},
		{shop2, nameShop2, "pakaian-sustainable", "Celana Linen Natural Unisex",                "celana-linen-natural-unisex",            "Celana casual dari serat linen alami breathable dan ringan, ramah lingkungan karena produksi linen butuh 20x lebih sedikit air", "SKU-CLN-001", 267, 116, 4.7},
		{shop2, nameShop2, "pakaian-sustainable", "Jaket Hemp Organik Unisex",                  "jaket-hemp-organik-unisex",              "Jaket dari serat hemp organik bersertifikat, 4x lebih kuat dari katun biasa, tahan lama untuk mengurangi fast fashion", "SKU-JKT-001", 189, 82,  4.6},
		{shop2, nameShop2, "aksesoris-eco",       "Topi Anyaman Bambu Pantai",                  "topi-anyaman-bambu-pantai",              "Topi pantai stylish dari anyaman bambu organik handmade lokal, memberikan perlindungan UV alami tanpa bahan kimia", "SKU-TOP-001", 156, 67,  4.7},
		{shop2, nameShop2, "aksesoris-eco",       "Dompet Cork Oak Vegan Leather",              "dompet-cork-oak-vegan-leather",          "Dompet slim dari kulit pohon oak (cork) vegan, ringan, tahan air alami, 100% cruelty-free, biodegradable dalam 3-5 tahun", "SKU-DMP-001", 234, 98,  4.8},
		{shop2, nameShop2, "aksesoris-eco",       "Kacamata Frame Bambu Handcrafted",           "kacamata-frame-bambu-handcrafted",       "Frame kacamata dari bambu pilihan diukir tangan, ringan hanya 15gr, kuat, dan 100% biodegradable ketika tidak terpakai", "SKU-KCM-001", 145, 62,  4.6},

		// Organik Nusantara — makanan dan pertanian organik
		{shop3, nameShop3, "makanan-organik",     "Beras Organik Premium Cianjur 1kg",          "beras-organik-premium-cianjur-1kg",      "Beras putih organik bersertifikat SNI dari petani Cianjur, tanpa pestisida dan GMO, dikemas dalam kemasan compostable", "SKU-BRS-001", 421, 178, 4.9},
		{shop3, nameShop3, "makanan-organik",     "Teh Hijau Organik Single Estate 100gr",      "teh-hijau-organik-single-estate-100gr",  "Teh hijau organik single estate dari perkebunan Jawa Barat bersertifikat, dipetik manual pagi hari, tanpa bahan kimia apapun", "SKU-TEH-001", 312, 134, 4.8},
		{shop3, nameShop3, "makanan-organik",     "Madu Hutan Kalimantan Raw 250gr",            "madu-hutan-kalimantan-raw-250gr",        "Madu hutan asli Kalimantan raw unprocessed, dipanen secara berkelanjutan oleh komunitas adat tanpa merusak ekosistem hutan", "SKU-MDU-001", 387, 165, 4.9},
		{shop3, nameShop3, "makanan-organik",     "Granola Oat Organik Homemade 300gr",         "granola-oat-organik-homemade-300gr",     "Granola dari oat organik, kacang mete, biji labu, dan buah kering tanpa pengawet, kemasan paper biodegradable", "SKU-GRN-001", 289, 124, 4.7},
		{shop3, nameShop3, "makanan-organik",     "Kopi Arabika Organik Flores 250gr",          "kopi-arabika-organik-flores-250gr",      "Kopi arabika single origin organik dari Flores bersertifikat Rainforest Alliance, dipetik manual dan diproses secara tradisional", "SKU-KPI-001", 356, 152, 4.8},
		{shop3, nameShop3, "pertanian-tanaman",   "Kit Berkebun Hidroponik Pemula Lengkap",     "kit-berkebun-hidroponik-pemula-lengkap", "Kit lengkap berkebun hidroponik indoor: wadah nutrisi, substrat organik, 5 jenis benih sayuran, dan panduan digital", "SKU-HDP-001", 198, 84,  4.7},
		{shop3, nameShop3, "pertanian-tanaman",   "Pupuk Organik Cair NPK 500ml",               "pupuk-organik-cair-npk-500ml",           "Pupuk cair organik NPK dari fermentasi limbah organik bersertifikat, aman untuk tanaman pangan dan hias tanpa residu kimia", "SKU-PPK-001", 167, 72,  4.6},

		// Pure Nature Beauty — skincare dan perawatan alami
		{shop4, nameShop4, "skincare-alami",      "Serum Rosehip Organik 30ml",                 "serum-rosehip-organik-30ml",             "Serum wajah dari minyak rosehip organik murni bersertifikat, mencerahkan kulit, memudarkan bekas luka, dan meregenerasi sel kulit", "SKU-SRM-001", 534, 226, 4.9},
		{shop4, nameShop4, "skincare-alami",      "Pelembab Shea Butter Alami Murni 60ml",      "pelembab-shea-butter-alami-60ml",        "Pelembab dari shea butter organik fair-trade, cocoa butter, dan jojoba oil murni, tanpa bahan sintetis, cocok untuk kulit sensitif", "SKU-PLB-001", 412, 175, 4.8},
		{shop4, nameShop4, "skincare-alami",      "Toner Rose Water Organik 200ml",             "toner-rose-water-organik-200ml",         "Toner dari air mawar organik murni distilasi uap tanpa alkohol, menenangkan kulit iritasi, dikemas dalam botol kaca reusable", "SKU-TNR-001", 378, 161, 4.8},
		{shop4, nameShop4, "skincare-alami",      "Sunscreen Mineral SPF50 Natural 50ml",       "sunscreen-mineral-spf50-natural-50ml",   "Sunscreen mineral SPF50 PA++++ dari zinc oxide non-nano alami, reef safe, formula ringan non-greasy, aman untuk kulit sensitif dan bayi", "SKU-SUN-001", 623, 265, 4.9},
		{shop4, nameShop4, "sabun-alami",         "Sikat Gigi Bambu Charcoal Pack 4",           "sikat-gigi-bambu-charcoal-pack-4",       "Pack 4 sikat gigi bambu organik bersertifikat dengan bulu arang aktif untuk memutihkan gigi, kemasan paper 100% biodegradable", "SKU-SBG-001", 489, 208, 4.9},
		{shop4, nameShop4, "sabun-alami",         "Sabun Batang Alami Lavender 100gr",          "sabun-batang-alami-lavender-100gr",      "Sabun cold process dari minyak kelapa organik dan lavender essential oil murni, tanpa SLS, paraben, dan pewarna buatan", "SKU-SBN-001", 356, 152, 4.8},
		{shop4, nameShop4, "haircare-organik",    "Sampo Padat Organik Zero Waste 60gr",        "sampo-padat-organik-zero-waste-60gr",    "Sampo padat zero-waste packaging dari bahan organik bersertifikat, setara 2 botol sampo cair, untuk semua jenis rambut", "SKU-SMP-001", 312, 133, 4.7},

		// Green Tech Solutions — teknologi hijau
		{shop5, nameShop5, "panel-surya",         "Panel Surya Portable 20W USB Camping",       "panel-surya-portable-20w-usb-camping",   "Panel surya lipat portable 20W efisiensi 23% dengan dual USB-A dan USB-C, ringan 700gr, tahan air IPX4 untuk outdoor", "SKU-PSR-001", 178, 76,  4.7},
		{shop5, nameShop5, "produk-hemat-energi", "Lampu LED Smart Hemat Energi 9W Set 4",      "lampu-led-smart-hemat-energi-9w-set-4",  "Set 4 lampu LED smart 9W hemat energi 80% dari bohlam biasa, umur 25.000 jam, dapat diredupkan via app, bebas merkuri", "SKU-LMP-001", 234, 98,  4.6},
	}

	products := make([]databases.Product, len(defs))
	ids := make([]string, len(defs))
	for i, d := range defs {
		id := NewID()
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
