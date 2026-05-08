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

	shop1 := NewID()
	shop2 := NewID()
	shop3 := NewID()
	shop4 := NewID()
	shop5 := NewID()

	type productDef struct {
		shopID      string
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
		{shop1, "hp-tablet", "Samsung Galaxy A55 5G", "samsung-galaxy-a55-5g", "Smartphone flagship dengan layar Super AMOLED 6.6 inci dan kamera 50MP", "SKU-HP-001", 245, 89, 4.7},
		{shop1, "hp-tablet", "iPhone 15 Pro Max 256GB", "iphone-15-pro-max-256gb", "iPhone terbaru dengan chip A17 Pro dan kamera 48MP", "SKU-HP-002", 512, 201, 4.9},
		{shop1, "hp-tablet", "Xiaomi 14 Ultra", "xiaomi-14-ultra", "Flagship Xiaomi dengan kamera Leica dan Snapdragon 8 Gen 3", "SKU-HP-003", 189, 74, 4.6},
		{shop1, "hp-tablet", "Samsung Galaxy Tab S9 FE", "samsung-galaxy-tab-s9-fe", "Tablet premium dengan layar 10.9 inci dan S Pen", "SKU-TAB-001", 134, 52, 4.5},
		{shop1, "laptop-komputer", "ASUS ROG Zephyrus G14 2024", "asus-rog-zephyrus-g14-2024", "Laptop gaming tipis dengan AMD Ryzen 9 dan RTX 4060", "SKU-LPT-001", 321, 118, 4.8},
		{shop1, "audio-headphone", "Headphone Sony WH-1000XM5", "headphone-sony-wh1000xm5", "Headphone noise cancelling terbaik dengan battery 30 jam", "SKU-AUD-001", 178, 64, 4.9},
		{shop1, "audio-headphone", "TWS Earbuds Samsung Galaxy Buds3 Pro", "samsung-galaxy-buds3-pro", "True wireless earbuds premium dengan ANC adaptif", "SKU-AUD-002", 267, 93, 4.7},
		{shop1, "kamera-foto", "Sony Alpha A7 IV Mirrorless", "sony-alpha-a7-iv-mirrorless", "Kamera mirrorless full-frame 33MP untuk profesional", "SKU-KMR-001", 98, 41, 4.8},
		{shop2, "pakaian-wanita", "Dress Batik Modern Motif Parang", "dress-batik-modern-parang", "Dress batik modern dengan motif parang klasik, cocok untuk acara formal", "SKU-DRS-001", 156, 43, 4.5},
		{shop2, "pakaian-wanita", "Blouse Tenun Ikat NTT Premium", "blouse-tenun-ikat-ntt-premium", "Blouse tenun ikat asli NTT dengan motif tradisional", "SKU-BLS-001", 112, 38, 4.6},
		{shop2, "pakaian-wanita", "Kebaya Modern Brokat Elegan", "kebaya-modern-brokat-elegan", "Kebaya modern berbahan brokat premium untuk acara pernikahan", "SKU-KBY-001", 203, 87, 4.7},
		{shop2, "pakaian-pria", "Kemeja Flanel Premium Pria", "kemeja-flanel-premium-pria", "Kemeja flanel premium bahan katun 100% nyaman dipakai sehari-hari", "SKU-KMJ-001", 98, 37, 4.4},
		{shop2, "pakaian-pria", "Batik Pria Slim Fit Motif Kawung", "batik-pria-slim-fit-kawung", "Kemeja batik pria slim fit dengan motif kawung klasik", "SKU-BTK-001", 145, 56, 4.5},
		{shop2, "aksesoris-fashion", "Tas Kulit Wanita Handmade", "tas-kulit-wanita-handmade", "Tas kulit sapi asli handmade dengan jahitan tangan", "SKU-TAS-001", 234, 91, 4.8},
		{shop2, "sepatu-wanita", "Sepatu Heels Kulit Asli 7cm", "sepatu-heels-kulit-asli-7cm", "Sepatu heels elegan berbahan kulit asli dengan tinggi 7cm", "SKU-HLS-001", 167, 62, 4.4},
		{shop2, "sepatu-pria", "Sepatu Pantofel Kulit Oxford", "sepatu-pantofel-kulit-oxford", "Sepatu pantofel formal berbahan kulit oxford premium", "SKU-OXF-001", 89, 34, 4.6},
		{shop3, "kuliner", "Rendang Daging Sapi Premium 500gr", "rendang-daging-sapi-premium-500gr", "Rendang daging sapi asli Padang dengan bumbu rempah pilihan", "SKU-RND-001", 421, 187, 4.8},
		{shop3, "kuliner", "Kopi Arabika Gayo Aceh 250gr", "kopi-arabika-gayo-aceh-250gr", "Kopi arabika single origin dari dataran tinggi Gayo Aceh", "SKU-KPI-001", 289, 134, 4.7},
		{shop3, "kuliner", "Sambal Matah Bali Homemade 200gr", "sambal-matah-bali-homemade-200gr", "Sambal matah segar khas Bali dengan bahan pilihan", "SKU-SMB-001", 356, 142, 4.8},
		{shop3, "kuliner", "Keripik Tempe Malang Original 250gr", "keripik-tempe-malang-original-250gr", "Keripik tempe renyah khas Malang dengan bumbu original", "SKU-KRP-001", 198, 87, 4.6},
		{shop3, "kuliner", "Dodol Garut Asli 500gr", "dodol-garut-asli-500gr", "Dodol garut asli dengan cita rasa manis legit tradisional", "SKU-DDL-001", 143, 61, 4.5},
		{shop4, "olahraga", "Sepatu Running Nike Air Zoom Pegasus 41", "sepatu-running-nike-air-zoom-pegasus-41", "Sepatu lari dengan teknologi Air Zoom untuk kenyamanan maksimal", "SKU-SPT-001", 534, 221, 4.8},
		{shop4, "olahraga", "Jersey Bola Timnas Indonesia 2024", "jersey-bola-timnas-indonesia-2024", "Jersey resmi timnas Indonesia musim 2024 berbahan dri-fit", "SKU-JRS-001", 678, 312, 4.7},
		{shop4, "alat-fitness", "Dumbbell Set Adjustable 2-24kg", "dumbbell-set-adjustable-2-24kg", "Set dumbbell adjustable dengan berat 2 hingga 24kg per sisi", "SKU-DBL-001", 234, 98, 4.6},
		{shop4, "alat-fitness", "Yoga Mat Premium Anti Slip 6mm", "yoga-mat-premium-anti-slip-6mm", "Matras yoga premium anti slip ketebalan 6mm ramah lingkungan", "SKU-YGM-001", 312, 134, 4.7},
		{shop4, "suplemen-vitamin", "Whey Protein Isolate Chocolate 1kg", "whey-protein-isolate-chocolate-1kg", "Whey protein isolate rasa coklat dengan 27g protein per serving", "SKU-WPI-001", 445, 189, 4.8},
		{shop5, "skincare", "Serum Vitamin C Brightening 30ml", "serum-vitamin-c-brightening-30ml", "Serum vitamin C 20% untuk mencerahkan dan meratakan warna kulit", "SKU-SRM-001", 678, 312, 4.9},
		{shop5, "skincare", "Moisturizer Hyaluronic Acid 50ml", "moisturizer-hyaluronic-acid-50ml", "Pelembab dengan hyaluronic acid untuk kulit lembap sepanjang hari", "SKU-MST-001", 523, 241, 4.8},
		{shop5, "skincare", "Toner BHA 2% Exfoliating 200ml", "toner-bha-2-exfoliating-200ml", "Toner eksfoliasi dengan BHA 2% untuk kulit berjerawat", "SKU-TNR-001", 389, 167, 4.7},
		{shop5, "kecantikan", "Sunscreen SPF 50 PA++++ 50ml", "sunscreen-spf50-pa-plus-50ml", "Sunscreen ringan non-greasy dengan perlindungan SPF 50 PA++++", "SKU-SUN-001", 892, 445, 4.9},
		{shop5, "makeup", "Foundation Cushion Dewy Finish SPF30", "foundation-cushion-dewy-finish-spf30", "Foundation cushion dengan finish dewy dan SPF 30 tahan lama", "SKU-FND-001", 456, 198, 4.6},
		{shop5, "makeup", "Lip Tint Velvet Matte 5ml", "lip-tint-velvet-matte-5ml", "Lip tint dengan formula velvet matte tahan lama hingga 12 jam", "SKU-LPT-001", 567, 234, 4.7},
		{shop5, "haircare", "Hair Serum Argan Oil 50ml", "hair-serum-argan-oil-50ml", "Serum rambut dengan argan oil untuk rambut berkilau dan lembut", "SKU-HSR-001", 298, 123, 4.6},
		{shop5, "haircare", "Shampoo Keratin Treatment 250ml", "shampoo-keratin-treatment-250ml", "Sampo dengan keratin treatment untuk rambut rusak dan bercabang", "SKU-SHP-001", 234, 98, 4.5},
	}

	products := make([]databases.Product, len(defs))
	ids := make([]string, len(defs))
	for i, d := range defs {
		id := NewID()
		ids[i] = id
		products[i] = databases.Product{
			Base:          databases.Base{ID: id, CreatedAt: now, UpdatedAt: now},
			ShopID:        d.shopID,
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
