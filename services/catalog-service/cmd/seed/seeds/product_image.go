package seeds

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedProductImages(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("product_images")
	now := time.Now()

	ensureProductImageIndexes(ctx, col)
	cleanupLegacyRandomProductImages(ctx, col, productIDs)

	type productImageDef struct {
		Alt   string
		Files []string
	}

	imageDefs := []productImageDef{
		// 0: Botol Stainless Thermos
		{
			Alt: "Botol stainless thermos reusable untuk minuman panas dan dingin",
			Files: []string{
				"botol-stainless-thermos-01.webp",
				"botol-stainless-thermos-02.webp",
				"botol-stainless-thermos-03.webp",
			},
		},

		// 1: Tumbler Bambu
		{
			Alt: "Tumbler bambu reusable dengan desain natural untuk eco lifestyle",
			Files: []string{
				"tumbler-bambu-natural-01.webp",
				"tumbler-bambu-natural-02.webp",
				"tumbler-bambu-natural-03.webp",
			},
		},

		// 2: Tas Kanvas Organik
		{
			Alt: "Tas kanvas organik reusable untuk belanja harian ramah lingkungan",
			Files: []string{
				"tas-kanvas-organik-01.webp",
				"tas-kanvas-organik-02.webp",
				"tas-kanvas-organik-03.webp",
			},
		},

		// 3: Tas Bambu Artisanal
		{
			Alt: "Tas bambu anyam artisanal natural buatan pengrajin lokal",
			Files: []string{
				"tas-bambu-artisanal-01.webp",
				"tas-bambu-artisanal-02.webp",
				"tas-bambu-artisanal-03.webp",
			},
		},

		// 4: Set Sedotan Stainless
		{
			Alt: "Set sedotan stainless reusable untuk mengurangi plastik sekali pakai",
			Files: []string{
				"set-sedotan-stainless-01.webp",
				"set-sedotan-stainless-02.webp",
				"set-sedotan-stainless-03.webp",
			},
		},

		// 5: Peralatan Makan Bambu
		{
			Alt: "Set peralatan makan bambu reusable untuk travel dan bekal harian",
			Files: []string{
				"peralatan-makan-bambu-01.webp",
				"peralatan-makan-bambu-02.webp",
				"peralatan-makan-bambu-03.webp",
			},
		},

		// 6: Lilin Soy Wax
		{
			Alt: "Lilin soy wax aromatherapy berbahan alami dan rendah emisi",
			Files: []string{
				"lilin-soy-wax-01.webp",
				"lilin-soy-wax-02.webp",
				"lilin-soy-wax-03.webp",
			},
		},

		// 7: Lap Microfiber
		{
			Alt: "Lap microfiber reusable untuk membersihkan rumah tanpa tisu sekali pakai",
			Files: []string{
				"lap-microfiber-reusable-01.webp",
				"lap-microfiber-reusable-02.webp",
				"lap-microfiber-reusable-03.webp",
			},
		},

		// 8: Rak Bambu
		{
			Alt: "Rak bambu natural untuk penyimpanan rumah minimalis ramah lingkungan",
			Files: []string{
				"rak-bambu-natural-01.webp",
				"rak-bambu-natural-02.webp",
				"rak-bambu-natural-03.webp",
			},
		},

		// 9: Kaos Katun Organik
		{
			Alt: "Kaos katun organik basic untuk sustainable fashion harian",
			Files: []string{
				"kaos-katun-organik-01.webp",
				"kaos-katun-organik-02.webp",
				"kaos-katun-organik-03.webp",
			},
		},

		// 10: Celana Linen
		{
			Alt: "Celana linen natural breathable untuk sustainable fashion",
			Files: []string{
				"celana-linen-natural-01.webp",
				"celana-linen-natural-02.webp",
				"celana-linen-natural-03.webp",
			},
		},

		// 11: Jaket Hemp
		{
			Alt: "Jaket hemp olive berbahan serat alami untuk eco fashion",
			Files: []string{
				"jaket-hemp-olive-01.webp",
				"jaket-hemp-olive-02.webp",
				"jaket-hemp-olive-03.webp",
			},
		},

		// 12: Topi Bambu
		{
			Alt: "Topi bambu natural untuk aktivitas outdoor dan gaya hidup tropis",
			Files: []string{
				"topi-bambu-natural-01.webp",
				"topi-bambu-natural-02.webp",
				"topi-bambu-natural-03.webp",
			},
		},

		// 13: Dompet Cork
		{
			Alt: "Dompet cork vegan leather ringan dengan material terbarukan",
			Files: []string{
				"dompet-cork-natural-01.webp",
				"dompet-cork-natural-02.webp",
				"dompet-cork-natural-03.webp",
			},
		},

		// 14: Kacamata Bambu
		{
			Alt: "Kacamata bambu handcrafted dengan frame natural ramah lingkungan",
			Files: []string{
				"kacamata-bambu-01.webp",
				"kacamata-bambu-02.webp",
				"kacamata-bambu-03.webp",
			},
		},

		// 15: Beras Organik
		{
			Alt: "Beras organik lokal dari pertanian berkelanjutan",
			Files: []string{
				"beras-organik-lokal-01.webp",
				"beras-organik-lokal-02.webp",
				"beras-organik-lokal-03.webp",
			},
		},

		// 16: Teh Hijau Organik
		{
			Alt: "Teh hijau organik loose leaf dari kebun lokal",
			Files: []string{
				"teh-hijau-organik-01.webp",
				"teh-hijau-organik-02.webp",
				"teh-hijau-organik-03.webp",
			},
		},

		// 17: Madu Hutan
		{
			Alt: "Madu hutan alami dari peternak lebah lokal",
			Files: []string{
				"madu-hutan-alami-01.webp",
				"madu-hutan-alami-02.webp",
				"madu-hutan-alami-03.webp",
			},
		},

		// 18: Granola Organik
		{
			Alt: "Granola organik dengan oat, kacang, dan buah kering",
			Files: []string{
				"granola-organik-01.webp",
				"granola-organik-02.webp",
				"granola-organik-03.webp",
			},
		},

		// 19: Kopi Flores Organik
		{
			Alt: "Kopi Flores organik arabica dari petani lokal Indonesia",
			Files: []string{
				"kopi-flores-organik-01.webp",
				"kopi-flores-organik-02.webp",
				"kopi-flores-organik-03.webp",
			},
		},

		// 20: Kit Hidroponik
		{
			Alt: "Kit hidroponik rumahan untuk menanam sayur tanpa lahan luas",
			Files: []string{
				"kit-hidroponik-rumah-01.webp",
				"kit-hidroponik-rumah-02.webp",
				"kit-hidroponik-rumah-03.webp",
			},
		},

		// 21: Pupuk Organik Cair
		{
			Alt: "Pupuk organik cair untuk tanaman rumah dan kebun kecil",
			Files: []string{
				"pupuk-organik-cair-01.webp",
				"pupuk-organik-cair-02.webp",
				"pupuk-organik-cair-03.webp",
			},
		},

		// 22: Serum Rosehip
		{
			Alt: "Serum rosehip natural untuk skincare organik",
			Files: []string{
				"serum-rosehip-natural-01.webp",
				"serum-rosehip-natural-02.webp",
				"serum-rosehip-natural-03.webp",
			},
		},

		// 23: Pelembab Shea Butter
		{
			Alt: "Pelembab shea butter natural untuk kulit normal dan sensitif",
			Files: []string{
				"pelembab-shea-butter-01.webp",
				"pelembab-shea-butter-02.webp",
				"pelembab-shea-butter-03.webp",
			},
		},

		// 24: Toner Rose Water
		{
			Alt: "Toner rose water natural untuk perawatan wajah harian",
			Files: []string{
				"toner-rose-water-01.webp",
				"toner-rose-water-02.webp",
				"toner-rose-water-03.webp",
			},
		},

		// 25: Sunscreen Mineral
		{
			Alt: "Sunscreen mineral zinc oxide untuk perlindungan kulit harian",
			Files: []string{
				"sunscreen-mineral-01.webp",
				"sunscreen-mineral-02.webp",
				"sunscreen-mineral-03.webp",
			},
		},

		// 26: Sikat Gigi Bambu
		{
			Alt: "Sikat gigi bambu biodegradable untuk mengurangi plastik kamar mandi",
			Files: []string{
				"sikat-gigi-bambu-01.webp",
				"sikat-gigi-bambu-02.webp",
				"sikat-gigi-bambu-03.webp",
			},
		},

		// 27: Sabun Batang Lavender
		{
			Alt: "Sabun batang natural lavender dengan kemasan minim plastik",
			Files: []string{
				"sabun-batang-lavender-01.webp",
				"sabun-batang-lavender-02.webp",
				"sabun-batang-lavender-03.webp",
			},
		},

		// 28: Sampo Padat
		{
			Alt: "Sampo padat zero waste untuk perawatan rambut tanpa botol plastik",
			Files: []string{
				"sampo-padat-zero-waste-01.webp",
				"sampo-padat-zero-waste-02.webp",
				"sampo-padat-zero-waste-03.webp",
			},
		},

		// 29: Panel Surya Portable
		{
			Alt: "Panel surya portable untuk camping dan kebutuhan energi outdoor",
			Files: []string{
				"panel-surya-portable-01.webp",
				"panel-surya-portable-02.webp",
				"panel-surya-portable-03.webp",
			},
		},

		// 30: Lampu LED Smart
		{
			Alt: "Lampu LED smart hemat energi untuk rumah modern",
			Files: []string{
				"lampu-led-smart-hemat-energi-01.webp",
				"lampu-led-smart-hemat-energi-02.webp",
				"lampu-led-smart-hemat-energi-03.webp",
			},
		},
	}

	if len(productIDs) == 0 {
		log.Println("⚠️  Product images skipped: no product IDs provided")
		return
	}

	limit := len(productIDs)
	if len(imageDefs) < limit {
		limit = len(imageDefs)
		log.Printf(
			"⚠️  Product images warning: productIDs=%d but image definitions=%d. Extra products skipped.",
			len(productIDs),
			len(imageDefs),
		)
	}

	total := 0

	for i := 0; i < limit; i++ {
		productID := productIDs[i]
		def := imageDefs[i]

		for order, fileName := range def.Files {
			imageURL := buildCatalogProductImageURL(fileName)
			isPrimary := order == 0

			filter := bson.M{
				"product_id": productID,
				"order":      order,
				"deleted_at": nil,
			}

			update := bson.M{
				"$set": bson.M{
					"product_key": productID,
					"url":         imageURL,
					"alt":         def.Alt,
					"is_primary":  isPrimary,
					"order":       order,
					"updated_at":  now,
					"deleted_at":  nil,
				},
				"$setOnInsert": bson.M{
					"_id":        NewID(),
					"product_id": productID,
					"file_id":    NewID(),
					"created_at": now,
				},
			}

			opts := options.Update().SetUpsert(true)

			if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
				log.Printf("⚠️  Product image upsert failed product_id=%s order=%d url=%s: %v", productID, order, imageURL, err)
				continue
			}

			total++
		}
	}

	log.Printf("✅ Product images seeded/updated (%d)", total)
}

func buildCatalogProductImageURL(fileName string) string {
	baseURL := os.Getenv("PUBLIC_CATALOG_ASSET_URL")

	if baseURL == "" {
		baseURL = os.Getenv("CATALOG_ASSET_BASE_URL")
	}

	if baseURL == "" {
		baseURL = "http://localhost/api/catalog/assets"
	}

	baseURL = strings.TrimRight(baseURL, "/")
	fileName = strings.TrimLeft(fileName, "/")

	return fmt.Sprintf("%s/products/%s", baseURL, fileName)
}

func ensureProductImageIndexes(ctx context.Context, col *mongo.Collection) {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "product_id", Value: 1},
				{Key: "order", Value: 1},
			},
			Options: options.Index().
				SetName("uniq_active_product_image_order").
				SetUnique(true).
				SetPartialFilterExpression(bson.M{
					"deleted_at": nil,
				}),
		},
		{
			Keys: bson.D{
				{Key: "product_id", Value: 1},
				{Key: "is_primary", Value: 1},
			},
			Options: options.Index().
				SetName("idx_product_image_primary"),
		},
	}

	if _, err := col.Indexes().CreateMany(ctx, indexes); err != nil {
		log.Printf("⚠️  Product image index warning: %v", err)
	}
}

func cleanupLegacyRandomProductImages(ctx context.Context, col *mongo.Collection, productIDs []string) {
	if len(productIDs) == 0 {
		return
	}

	filter := bson.M{
		"product_id": bson.M{
			"$in": productIDs,
		},
		"url": bson.M{
			"$regex": "source\\.unsplash\\.com|picsum\\.photos",
		},
	}

	result, err := col.DeleteMany(ctx, filter)
	if err != nil {
		log.Printf("⚠️  Legacy random product image cleanup failed: %v", err)
		return
	}

	if result.DeletedCount > 0 {
		log.Printf("🧹 Removed legacy random product images (%d)", result.DeletedCount)
	}
}
