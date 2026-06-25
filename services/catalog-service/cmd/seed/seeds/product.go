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

	shop1 := "shop_ecoware_001"
	shop3 := "shop_organik_003"

	const (
		nameShop1 = "EcoWare Indonesia"
		nameShop3 = "Organik Nusantara"
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

	// Total 54 Produk - Urutan disesuaikan persis dengan SeedProductImages terbaru
	defs := []productDef{
		// 1-15: EcoWare (Tumbler, Tas, Home Living, Fashion)
		{shop1, nameShop1, "botol-tumbler", "Botol Minum Stainless Steel Thermos 500ml", "botol-minum-stainless-thermos-500ml", "Botol minum double wall stainless, menjaga suhu panas 12 jam.", "SKU-BTL-001", 312, 134, 4.8},
		{shop1, nameShop1, "botol-tumbler", "Tumbler Bambu Premium 350ml", "tumbler-bambu-premium-350ml", "Tumbler eco-friendly dari bambu organik.", "SKU-BTL-002", 198, 87, 4.7},
		{shop1, nameShop1, "tas-eco", "Tas Kanvas Organik Belanja", "tas-kanvas-organik", "Tas belanja reusable dari bahan kanvas katun organik.", "SKU-TAS-001", 150, 45, 4.9},
		{shop1, nameShop1, "alat-makan-eco", "Set Peralatan Makan Bambu 5pcs", "set-peralatan-makan-bambu", "Set sendok, garpu, pisau dari bambu organik.", "SKU-PMK-001", 267, 115, 4.7},
		{shop1, nameShop1, "home-living", "Lilin Aromaterapi Soy Wax", "lilin-soy-wax-alami", "Lilin relaksasi dari bahan kedelai alami tanpa parafin.", "SKU-HML-001", 340, 180, 4.8},
		{shop1, nameShop1, "home-living", "Lap Dapur Reusable Serat Alami", "lap-dapur-reusable", "Pengganti tisu dapur, bisa dicuci dan dipakai ulang.", "SKU-HML-002", 210, 95, 4.7},
		{shop1, nameShop1, "home-living", "Rak Bambu Minimalis Serbaguna", "rak-bambu-minimalis", "Rak susun kokoh dari bambu untuk dekorasi atau penyimpanan.", "SKU-HML-003", 145, 55, 4.8},
		{shop1, nameShop1, "perawatan-tubuh", "Spons Loofah Alami untuk Mandi", "spons-loofah-alami", "Spons mandi organik 100% biodegradable.", "SKU-BDY-001", 520, 310, 4.9},
		{shop1, nameShop1, "pakaian-eco", "Kaos Basic Katun Organik", "kaos-katun-organik", "Kaos harian berbahan katun organik yang sejuk di kulit.", "SKU-FSH-001", 410, 120, 4.8},
		{shop1, nameShop1, "pakaian-eco", "Celana Santai Linen Natural", "celana-linen-natural", "Celana berbahan serat rami (linen) yang nyaman.", "SKU-FSH-002", 230, 85, 4.7},
		{shop1, nameShop1, "pakaian-eco", "Jaket Serat Hemp Premium", "jaket-serat-hemp", "Jaket tangguh dari serat hemp organik.", "SKU-FSH-003", 95, 30, 4.9},
		{shop1, nameShop1, "aksesoris-eco", "Topi Pantai Anyaman Bambu", "topi-anyaman-bambu", "Topi lebar berbahan bambu melindungi dari UV.", "SKU-ACC-001", 120, 40, 4.6},
		{shop1, nameShop1, "aksesoris-eco", "Dompet Pria Vegan Cork", "dompet-vegan-cork", "Dompet sintetis dari serat gabus (cork) alami.", "SKU-ACC-002", 185, 60, 4.8},
		{shop1, nameShop1, "aksesoris-eco", "Kacamata Hitam Frame Bambu", "kacamata-frame-bambu", "Kacamata stylish dengan gagang bambu ringan.", "SKU-ACC-003", 270, 90, 4.7},
		{shop1, nameShop1, "pakaian-eco", "Kaos Kaki Serat Bambu Anti Bau", "kaos-kaki-bambu", "Kaos kaki breathable dari serat bambu.", "SKU-FSH-004", 450, 210, 4.9},

		// 16-22: Organik Nusantara (Pangan & Berkebun Part 1)
		{shop3, nameShop3, "bahan-pokok", "Beras Putih Organik Premium 5Kg", "beras-putih-organik-5kg", "Beras bebas pestisida dan pupuk kimia sintesis.", "SKU-BPK-001", 620, 410, 4.9},
		{shop3, nameShop3, "minuman-sehat", "Daun Teh Hijau Organik Pilihan", "teh-hijau-organik", "Teh hijau murni dari perkebunan dataran tinggi.", "SKU-MNM-001", 340, 150, 4.8},
		{shop3, nameShop3, "bahan-pokok", "Madu Hutan Liar Murni 500ml", "madu-hutan-murni", "Madu mentah tanpa proses pemanasan berlebih.", "SKU-BPK-002", 890, 520, 4.9},
		{shop3, nameShop3, "makanan-sehat", "Granola Organik Mix Berries", "granola-organik-mix", "Sarapan sehat dari oat organik dan buah berry.", "SKU-MKH-001", 430, 210, 4.8},
		{shop3, nameShop3, "minuman-sehat", "Biji Kopi Arabika Organik 250g", "biji-kopi-organik", "Biji kopi single origin ditanam secara organik.", "SKU-MNM-002", 560, 310, 4.9},
		{shop3, nameShop3, "berkebun", "Starter Kit Hidroponik Pemula", "kit-hidroponik-pemula", "Set lengkap menanam sayur hidroponik di rumah.", "SKU-GRD-001", 210, 80, 4.7},
		{shop3, nameShop3, "bahan-pokok", "Gula Aren Kristal Organik 500g", "gula-aren-kristal-organik", "Pemanis alami dengan indeks glikemik rendah.", "SKU-BPK-003", 480, 230, 4.9},

		// 23-29: EcoWare (Perawatan Tubuh & Elektronik Eco)
		{shop1, nameShop1, "perawatan-tubuh", "Serum Wajah Rosehip Alami", "serum-rosehip-alami", "Serum anti-aging dari ekstrak rosehip cold-pressed.", "SKU-BDY-002", 290, 140, 4.8},
		{shop1, nameShop1, "perawatan-tubuh", "Pelembab Wajah Natural Aloe Vera", "pelembab-wajah-natural", "Krim wajah tanpa paraben dan bahan kimia.", "SKU-BDY-003", 310, 160, 4.7},
		{shop1, nameShop1, "perawatan-tubuh", "Sunscreen Ramah Terumbu Karang", "sunscreen-ramah-lingkungan", "Tabir surya aman untuk laut dan bebas oxybenzone.", "SKU-BDY-004", 420, 190, 4.9},
		{shop1, nameShop1, "perawatan-tubuh", "Deodoran Balm Natural Tawas", "deodoran-natural", "Deodoran aman tanpa aluminium klorohidrat.", "SKU-BDY-005", 380, 150, 4.7},
		{shop1, nameShop1, "elektronik-eco", "Mini Panel Surya Portable", "panel-surya-portable", "Panel surya 10W untuk gadget saat outdoor.", "SKU-ELC-001", 120, 45, 4.6},
		{shop1, nameShop1, "elektronik-eco", "Lampu Bohlam LED Smart Hemat", "lampu-led-smart", "Lampu hemat daya yang diatur via smartphone.", "SKU-ELC-002", 340, 160, 4.8},
		{shop1, nameShop1, "elektronik-eco", "Powerbank Tenaga Surya 10000mAh", "powerbank-tenaga-surya", "Powerbank pengisian darurat tenaga surya.", "SKU-ELC-003", 210, 85, 4.7},

		// 30-54: Organik Nusantara (Bibit, Sayur, Buah & Bumbu)
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Cabai Rawit Organik", "bibit-cabai-organik", "Bibit unggul tahan hama penyakit.", "SKU-BBT-001", 520, 180, 4.9},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Tomat Ceri Organik", "bibit-tomat-organik", "Bibit tomat ceri manis cocok untuk pot.", "SKU-BBT-002", 410, 150, 4.8},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Selada Hidroponik", "bibit-selada-hidroponik", "Pertumbuhan cepat, tekstur renyah.", "SKU-BBT-003", 630, 240, 4.9},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Kangkung Organik", "bibit-kangkung-organik", "Kangkung darat mudah ditanam di rumah.", "SKU-BBT-004", 720, 310, 4.9},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Pakcoy Organik", "bibit-pakcoy-organik", "Sawi pakcoy tebal bernutrisi tinggi.", "SKU-BBT-005", 480, 190, 4.8},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Bayam Hijau Super", "bibit-bayam-hijau", "Tumbuh rimbun dengan perawatan minim.", "SKU-BBT-006", 550, 210, 4.8},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Terong Ungu", "bibit-terong-ungu", "Varietas terong panjang berdaging tebal.", "SKU-BBT-007", 340, 110, 4.7},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Mentimun Organik", "bibit-mentimun-organik", "Timun lalap renyah tahan virus.", "SKU-BBT-008", 420, 160, 4.8},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Melon Premium", "bibit-melon-premium", "Melon manis berair segar.", "SKU-BBT-009", 290, 95, 4.7},
		{shop3, nameShop3, "bibit-tanaman", "Benih Bibit Semangka Merah Organik", "bibit-semangka-organik", "Semangka tanpa biji varietas unggul.", "SKU-BBT-010", 310, 105, 4.8},
		{shop3, nameShop3, "sayur-segar", "Paket Mix Sayur Hijau Organik", "sayur-organik-mix-pack", "Sayuran potong segar panen hari ini.", "SKU-SYR-001", 850, 420, 4.9},
		{shop3, nameShop3, "buah-segar", "Buah Naga Merah Organik 1Kg", "buah-naga-organik", "Buah naga manis langsung dari petani lokal.", "SKU-BUA-001", 620, 280, 4.8},
		{shop3, nameShop3, "buah-segar", "Alpukat Mentega Organik 1Kg", "alpukat-organik", "Alpukat pulen super legit.", "SKU-BUA-002", 940, 510, 4.9},
		{shop3, nameShop3, "buah-segar", "Jeruk Peras Manis Organik 1Kg", "jeruk-organik", "Kaya vitamin C, dibudidayakan secara alami.", "SKU-BUA-003", 530, 230, 4.8},
		{shop3, nameShop3, "buah-segar", "Pisang Cavendish Organik 1 Sisir", "pisang-organik", "Pisang mulus matang sempurna di pohon.", "SKU-BUA-004", 760, 340, 4.9},
		{shop3, nameShop3, "cemilan-sehat", "Keripik Pisang Gurih UMKM", "keripik-pisang-umkm", "Cemilan keripik pisang asli tanpa pengawet.", "SKU-CML-001", 410, 180, 4.8},
		{shop3, nameShop3, "sayur-segar", "Singkong Organik Segar 1Kg", "singkong-organik", "Singkong empuk siap rebus atau goreng.", "SKU-SYR-003", 320, 130, 4.7},
		{shop3, nameShop3, "cemilan-sehat", "Keripik Singkong Pedas Manis", "keripik-singkong", "Keripik singkong renyah bumbu rempah asli.", "SKU-CML-002", 480, 210, 4.8},
		{shop3, nameShop3, "bahan-pokok", "Selai Stroberi Homemade Organik", "selai-stroberi-organik", "Selai buah stroberi murni.", "SKU-BPK-004", 290, 125, 4.8},
		{shop3, nameShop3, "buah-segar", "Nanas Madu Organik", "nanas-organik", "Nanas madu tanpa rasa gatal di lidah.", "SKU-BUA-005", 340, 145, 4.7},
		{shop3, nameShop3, "buah-segar", "Kelapa Muda Segar Kupas", "kelapa-muda", "Kelapa muda segar tinggi elektrolit.", "SKU-BUA-006", 520, 260, 4.9},
		{shop3, nameShop3, "bahan-pokok", "Gula Aren Cair Premium 250ml", "gula-aren-cair-premium", "Ekstrak nira murni praktis untuk minuman.", "SKU-BPK-005", 410, 180, 4.8},
		{shop3, nameShop3, "bumbu-dapur", "Jahe Merah Segar Organik 500g", "jahe-organik", "Rimpang jahe merah penghangat tubuh.", "SKU-BMB-001", 380, 160, 4.8},
		{shop3, nameShop3, "bumbu-dapur", "Kunyit Kuning Segar Organik 500g", "kunyit-organik", "Kunyit empu kaya antioksidan dan kurkumin.", "SKU-BMB-002", 290, 120, 4.7},
		{shop3, nameShop3, "sayur-segar", "Jagung Manis Organik 1Kg", "jagung-organik", "Jagung manis bebas pestisida untuk direbus.", "SKU-SYR-002", 180, 120, 4.8},
	}

	products := make([]databases.Product, len(defs))
	ids := make([]string, len(defs))
	for i, d := range defs {
		id := NewID() // Pastikan fungsi NewID() tersedia di package yang sama
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