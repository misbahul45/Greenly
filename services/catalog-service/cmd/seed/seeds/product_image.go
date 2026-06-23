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

    // Menggunakan URL Real Unsplash dengan parameter optimasi image (?q=80&w=800)
    imageDefs := []productImageDef{
        // 0: Botol Stainless
        {Alt: "Botol stainless thermos", Files: []string{"https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1544910355-3253b23c21a4?q=80&w=800&auto=format&fit=crop"}},
        // 1: Tumbler Bambu
        {Alt: "Tumbler bambu", Files: []string{"https://images.unsplash.com/photo-1590740924976-5085e4922119?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1596752002360-61ba4f1fc4cc?q=80&w=800&auto=format&fit=crop"}},
        // 2: Tas Kanvas
        {Alt: "Tas kanvas organik", Files: []string{"https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop"}},
        // 3: Tas Bambu
        {Alt: "Tas bambu artisanal", Files: []string{"https://images.unsplash.com/photo-1621510444391-729f12eb22eb?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop"}},
        // 4: Sedotan Stainless
        {Alt: "Sedotan stainless", Files: []string{"https://images.unsplash.com/photo-1586034679984-75485ea7cc7f?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1590059283084-255d614e2d3d?q=80&w=800&auto=format&fit=crop"}},
        // 5: Alat Makan Bambu
        {Alt: "Alat makan bambu", Files: []string{"https://images.unsplash.com/photo-1603525281561-1ffb4715f3ba?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1581452292070-07e3bd2cf6c4?q=80&w=800&auto=format&fit=crop"}},
        // 6: Lilin Soy Wax
        {Alt: "Lilin soy wax", Files: []string{"https://images.unsplash.com/photo-1603006905393-ee049581eb08?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1572413289063-45f8f90dd0f1?q=80&w=800&auto=format&fit=crop"}},
        // 7: Lap Microfiber (Alternatif kain alami)
        {Alt: "Lap dapur reusable", Files: []string{"https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1613214149922-f181977beae4?q=80&w=800&auto=format&fit=crop"}},
        // 8: Rak Bambu
        {Alt: "Rak bambu minimalis", Files: []string{"https://images.unsplash.com/photo-1592336688582-841f3e098a51?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop"}},
        // 9: Spons Loofah (TAMBAHAN)
        {Alt: "Spons Loofah alami", Files: []string{"https://images.unsplash.com/photo-1605364121650-70588ea7b7db?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1585507421251-7fbd69317b2b?q=80&w=800&auto=format&fit=crop"}},

        // 10: Kaos Katun Organik
        {Alt: "Kaos katun organik", Files: []string{"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop"}},
        // 11: Celana Linen
        {Alt: "Celana linen natural", Files: []string{"https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1604136172384-b2e9c43271ec?q=80&w=800&auto=format&fit=crop"}},
        // 12: Jaket Hemp
        {Alt: "Jaket serat hemp", Files: []string{"https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop"}},
        // 13: Topi Bambu
        {Alt: "Topi anyaman bambu", Files: []string{"https://images.unsplash.com/photo-1533596773281-2292f7e7fdf1?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1583344605995-1f654b9d31bd?q=80&w=800&auto=format&fit=crop"}},
        // 14: Dompet Cork
        {Alt: "Dompet vegan cork", Files: []string{"https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"}},
        // 15: Kacamata Bambu
        {Alt: "Kacamata frame bambu", Files: []string{"https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=800&auto=format&fit=crop"}},
        // 16: Kaos Kaki Bambu (TAMBAHAN)
        {Alt: "Kaos kaki bambu", Files: []string{"https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1601646700676-e13d969eb2db?q=80&w=800&auto=format&fit=crop"}},

        // 17: Beras Organik
        {Alt: "Beras organik", Files: []string{"https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=800&auto=format&fit=crop"}},
        // 18: Teh Hijau Organik
        {Alt: "Teh hijau organik", Files: []string{"https://images.unsplash.com/photo-1627492275811-9a74479e0007?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop"}},
        // 19: Madu Hutan
        {Alt: "Madu hutan murni", Files: []string{"https://images.unsplash.com/photo-1587049352847-4d4b1ed738d2?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1587049352851-8d4e89134a6a?q=80&w=800&auto=format&fit=crop"}},
        // 20: Granola
        {Alt: "Granola organik", Files: []string{"https://images.unsplash.com/photo-1517445582451-b8471e410b37?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1634591461975-4fc1da93f357?q=80&w=800&auto=format&fit=crop"}},
        // 21: Kopi Organik
        {Alt: "Biji kopi organik", Files: []string{"https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=800&auto=format&fit=crop"}},
        // 22: Kit Hidroponik
        {Alt: "Kit hidroponik", Files: []string{"https://images.unsplash.com/photo-1530836369250-ef71a3f5e9da?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop"}},
        // 23: Pupuk Organik
        {Alt: "Pupuk tanaman", Files: []string{"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=800&auto=format&fit=crop"}},
        // 24: Gula Aren (TAMBAHAN)
        {Alt: "Gula aren organik", Files: []string{"https://images.unsplash.com/photo-1621317762646-4a41bd27d2bf?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1518063080076-200c8227b29a?q=80&w=800&auto=format&fit=crop"}},

        // 25: Serum Rosehip
        {Alt: "Serum rosehip", Files: []string{"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop"}},
        // 26: Pelembab Shea
        {Alt: "Pelembab wajah natural", Files: []string{"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1615397323136-2ee2a3e895ec?q=80&w=800&auto=format&fit=crop"}},
        // 27: Toner Rose
        {Alt: "Toner wajah natural", Files: []string{"https://images.unsplash.com/photo-1556228720-1c2773d726b2?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?q=80&w=800&auto=format&fit=crop"}},
        // 28: Sunscreen Mineral
        {Alt: "Sunscreen ramah lingkungan", Files: []string{"https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1526045612212-70caf35c14df?q=80&w=800&auto=format&fit=crop"}},
        // 29: Sikat Bambu
        {Alt: "Sikat gigi bambu", Files: []string{"https://images.unsplash.com/photo-1607613009820-a29f4bb19718?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1596434452174-89c090680dce?q=80&w=800&auto=format&fit=crop"}},
        // 30: Sabun Lavender
        {Alt: "Sabun batang organik", Files: []string{"https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1584824388147-38e945530ec3?q=80&w=800&auto=format&fit=crop"}},
        // 31: Sampo Padat
        {Alt: "Sampo padat", Files: []string{"https://images.unsplash.com/photo-1611078512140-52a16c7b3997?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=800&auto=format&fit=crop"}},
        // 32: Deodoran (TAMBAHAN)
        {Alt: "Deodoran natural", Files: []string{"https://images.unsplash.com/photo-1608248593842-8021c324e9cb?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1615397323062-811c7d23d8c3?q=80&w=800&auto=format&fit=crop"}},

        // 33: Panel Surya
        {Alt: "Panel surya", Files: []string{"https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=800&auto=format&fit=crop"}},
        // 34: Lampu Smart
        {Alt: "Lampu LED smart", Files: []string{"https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?q=80&w=800&auto=format&fit=crop"}},
        // 35: Powerbank Surya (TAMBAHAN)
        {Alt: "Powerbank tenaga surya", Files: []string{"https://images.unsplash.com/photo-1610488425257-21a4be463d42?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop"}},
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

// Fungsi helper diperbarui agar langsung mengembalikan URL jika formatnya HTTP/HTTPS
func buildCatalogProductImageURL(fileName string) string {
    // Cek apakah string sudah berbentuk link eksternal penuh
    if strings.HasPrefix(fileName, "http://") || strings.HasPrefix(fileName, "https://") {
        return fileName
    }

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

// Sisa fungsi `ensureProductImageIndexes` dan `cleanupLegacyRandomProductImages` biarkan sama seperti aslinya

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
