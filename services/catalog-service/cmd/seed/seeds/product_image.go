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
        {Alt: "Botol stainless thermos", Files: []string{"https://images.pexels.com/photos/9209891/pexels-photo-9209891.jpeg?_gl=1*5c1vj6*_ga*MjM1NzQ2NTMzLjE3ODIyMjQ2Mjg.*_ga_8JE65Q40S6*czE3ODIyMjQ2MjckbzEkZzEkdDE3ODIyMjQ2NTUkajMyJGwwJGgw", "https://images.pexels.com/photos/6606326/pexels-photo-6606326.jpeg"}},
        // 1: Tumbler Bambu
        {Alt: "Tumbler bambu", Files: []string{"https://images.pexels.com/photos/7262724/pexels-photo-7262724.jpeg", "https://images.pexels.com/photos/7262730/pexels-photo-7262730.jpeg"}},
        // 2: Tas Kanvas
        {Alt: "Tas kanvas organik", Files: []string{"https://images.pexels.com/photos/7262872/pexels-photo-7262872.jpeg", "https://images.pexels.com/photos/4068314/pexels-photo-4068314.jpeg","https://images.pexels.com/photos/9197515/pexels-photo-9197515.jpeg"}},
        // 3: Tas Bambu
        {Alt: "Tas bambu artisanal", Files: []string{"https://images.pexels.com/photos/1621510444391-729f12eb22eb.jpeg", "https://images.pexels.com/photos/1584916201218-f4242ceb4809.jpeg"}},
        // 4: Sedotan Stainless
        {Alt: "Sedotan stainless", Files: []string{"https://images.pexels.com/photos/1586034679984-75485ea7cc7f.jpeg", "https://images.pexels.com/photos/1590059283084-255d614e2d3d.jpeg"}},
        // 5: Alat Makan Bambu
        {Alt: "Alat makan bambu", Files: []string{"https://images.pexels.com/photos/7675061/pexels-photo-7675061.jpeg", "https://images.pexels.com/photos/7879775/pexels-photo-7879775.jpeg"}},
        // 6: Lilin Soy Wax
        {Alt: "Lilin soy wax", Files: []string{"https://images.pexels.com/photos/5933780/pexels-photo-5933780.jpeg", "https://images.pexels.com/photos/6755753/pexels-photo-6755753.jpeg"}},
        // 7: Lap Microfiber (Alternatif kain alami)
        {Alt: "Lap dapur reusable", Files: []string{"https://images.pexels.com/photos/10568474/pexels-photo-10568474.jpeg", "https://www.pexels.com/photo/bag-of-pistachios-on-table-7262773/"}},
        // 8: Rak Bambu
        {Alt: "Rak bambu minimalis", Files: []string{"https://images.pexels.com/photos/27549431/pexels-photo-27549431.jpeg", "https://images.pexels.com/photos/11885892/pexels-photo-11885892.jpeg","https://images.pexels.com/photos/18037193/pexels-photo-18037193.jpeg"}},
        // 9: Spons Loofah (TAMBAHAN)
        {Alt: "Spons Loofah alami", Files: []string{"https://images.pexels.com/photos/9475410/pexels-photo-9475410.jpeg", "https://images.pexels.com/photos/5237889/pexels-photo-5237889.jpeg"}},

        // 10: Kaos Katun Organik
        {Alt: "Kaos katun organik", Files: []string{"https://images.pexels.com/photos/14428675/pexels-photo-14428675.jpeg", "https://images.pexels.com/photos/14428673/pexels-photo-14428673.jpeg"}},
        // 11: Celana Linen
        {Alt: "Celana linen natural", Files: []string{"https://images.pexels.com/photos/28518884/pexels-photo-28518884.jpeg", "https://images.pexels.com/photos/18031037/pexels-photo-18031037.jpeg"}},
        // 12: Jaket Hemp
        {Alt: "Jaket serat hemp", Files: []string{"https://images.pexels.com/photos/1551028719-00167b16eac5.jpeg", "https://images.pexels.com/photos/1591047139829-d91aecb6caea.jpeg"}},
        // 13: Topi Bambu
        {Alt: "Topi anyaman bambu", Files: []string{"https://images.pexels.com/photos/31431528/pexels-photo-31431528.jpeg", "https://images.pexels.com/photos/37877056/pexels-photo-37877056.jpeg"}},
        // 14: Dompet Cork
        {Alt: "Dompet vegan cork", Files: []string{"https://images.pexels.com/photos/9807760/pexels-photo-9807760.jpeg", "https://images.pexels.com/photos/36343445/pexels-photo-36343445.jpeg"}},
        // 15: Kacamata Bambu
        {Alt: "Kacamata frame bambu", Files: []string{"https://images.pexels.com/photos/1511499767150-a48a237f0083.jpeg", "https://images.pexels.com/photos/1473496169904-658ba7c44d8a.jpeg"}},
        // 16: Kaos Kaki Bambu (TAMBAHAN)
        {Alt: "Kaos kaki bambu", Files: []string{"https://images.pexels.com/photos/1582966772680-860e372bb558.jpeg", "https://images.pexels.com/photos/1601646700676-e13d969eb2db.jpeg"}},

        // 17: Beras Organik
        {Alt: "Beras organik", Files: []string{"https://images.pexels.com/photos/1586201375761-83865001e31c.jpeg", "https://images.pexels.com/photos/1536304993881-ff6e9eefa2a6.jpeg"}},
        // 18: Teh Hijau Organik
        {Alt: "Teh hijau organik", Files: []string{"https://images.pexels.com/photos/1627492275811-9a74479e0007.jpeg", "https://images.pexels.com/photos/1556679343-c7306c1976bc.jpeg"}},
        // 19: Madu Hutan
        {Alt: "Madu hutan murni", Files: []string{"https://images.pexels.com/photos/1587049352847-4d4b1ed738d2.jpeg", "https://images.pexels.com/photos/1587049352851-8d4e89134a6a.jpeg"}},
        // 20: Granola
        {Alt: "Granola organik", Files: []string{"https://images.pexels.com/photos/1517445582451-b8471e410b37.jpeg", "https://images.pexels.com/photos/1634591461975-4fc1da93f357.jpeg"}},
        // 21: Kopi Organik
        {Alt: "Biji kopi organik", Files: []string{"https://images.pexels.com/photos/1559525839-b184a4d698c7.jpeg", "https://images.pexels.com/photos/1611162458324-aae1eb4129a4.jpeg"}},
        // 22: Kit Hidroponik
        {Alt: "Kit hidroponik", Files: []string{"https://images.pexels.com/photos/1530836369250-ef71a3f5e9da.jpeg", "https://images.pexels.com/photos/1589923188900-85dae523342b.jpeg"}},
        // 23: Pupuk Organik
        {Alt: "Pupuk tanaman", Files: []string{"https://images.pexels.com/photos/1466692476868-aef1dfb1e735.jpeg", "https://images.pexels.com/photos/1622383563227-04401ab4e5ea.jpeg"}},
        // 24: Gula Aren (TAMBAHAN)
        {Alt: "Gula aren organik", Files: []string{"https://images.pexels.com/photos/1621317762646-4a41bd27d2bf.jpeg", "https://images.pexels.com/photos/1518063080076-200c8227b29a.jpeg"}},

        // 25: Serum Rosehip
        {Alt: "Serum rosehip", Files: []string{"https://images.pexels.com/photos/1620916566398-39f1143ab7be.jpeg", "https://images.pexels.com/photos/1608248543803-ba4f8c70ae0b.jpeg"}},
        // 26: Pelembab Shea
        {Alt: "Pelembab wajah natural", Files: []string{"https://images.pexels.com/photos/1556228578-0d85b1a4d571.jpeg", "https://images.pexels.com/photos/1615397323136-2ee2a3e895ec.jpeg"}},
        // 27: Toner Rose
        {Alt: "Toner wajah natural", Files: []string{"https://images.pexels.com/photos/1556228720-1c2773d726b2.jpeg", "https://images.pexels.com/photos/1570194065650-d99fb4b8ccb0.jpeg"}},
        // 28: Sunscreen Mineral
        {Alt: "Sunscreen ramah lingkungan", Files: []string{"https://images.pexels.com/photos/1556228453-efd6c1ff04f6.jpeg", "https://images.pexels.com/photos/1526045612212-70caf35c14df.jpeg"}},	
        // 29: Sikat Bambu
        {Alt: "Sikat gigi bambu", Files: []string{"https://images.pexels.com/photos/1607613009820-a29f4bb19718.jpeg", "https://images.pexels.com/photos/1596434452174-89c090680dce.jpeg"}},
        // 30: Sabun Lavender
        {Alt: "Sabun batang organik", Files: []string{"https://images.pexels.com/photos/1600857544200-b2f666a9a2ec.jpeg", "https://images.pexels.com/photos/1584824388147-38e945530ec3.jpeg"}},
        // 31: Sampo Padat
        {Alt: "Sampo padat", Files: []string{"https://images.pexels.com/photos/1611078512140-52a16c7b3997.jpeg", "https://images.pexels.com/photos/1590439471364-192aa70c0b53.jpeg"}},
        // 32: Deodoran (TAMBAHAN)
        {Alt: "Deodoran natural", Files: []string{"https://images.pexels.com/photos/1608248593842-8021c324e9cb.jpeg", "https://images.pexels.com/photos/1615397323062-811c7d23d8c3.jpeg"}},

        // 33: Panel Surya
        {Alt: "Panel surya", Files: []string{"https://images.pexels.com/photos/1509391366360-2e959784a276.jpeg", "https://images.pexels.com/photos/1497440001374-f26997328c1b.jpeg"}},
        // 34: Lampu Smart
        {Alt: "Lampu LED smart", Files: []string{"https://images.pexels.com/photos/1550989460-0adf9ea622e2.jpeg", "https://images.pexels.com/photos/1563461660947-507ef49e9c47.jpeg"}},
        // 35: Powerbank Surya (TAMBAHAN)
        {Alt: "Powerbank tenaga surya", Files: []string{"https://images.pexels.com/photos/1610488425257-21a4be463d42.jpeg", "https://images.pexels.com/photos/1601362840469-51e4d8d58785.jpeg"}},
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
