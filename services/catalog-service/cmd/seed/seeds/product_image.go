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
		{Alt: "Botol stainless thermos", Files: []string{"https://images.pexels.com/photos/9209891/pexels-photo-9209891.jpeg?_gl=1*5c1vj6*_ga*MjM1NzQ2NTMzLjE3ODIyMjQ2Mjg.*_ga_8JE65Q40S6*czE3ODIyMjQ2MjckbzEkZzEkdDE3ODIyMjQ2NTUkajMyJGwwJGgw", "https://images.pexels.com/photos/6606326/pexels-photo-6606326.jpeg"}},
		{Alt: "Tumbler bambu", Files: []string{"https://images.pexels.com/photos/7262724/pexels-photo-7262724.jpeg", "https://images.pexels.com/photos/7262730/pexels-photo-7262730.jpeg"}},
		{Alt: "Tas kanvas organik", Files: []string{"https://images.pexels.com/photos/7262872/pexels-photo-7262872.jpeg", "https://images.pexels.com/photos/4068314/pexels-photo-4068314.jpeg", "https://images.pexels.com/photos/9197515/pexels-photo-9197515.jpeg"}},
		{Alt: "Alat makan bambu", Files: []string{"https://images.pexels.com/photos/7675061/pexels-photo-7675061.jpeg", "https://images.pexels.com/photos/7879775/pexels-photo-7879775.jpeg"}},
		{Alt: "Lilin soy wax", Files: []string{"https://images.pexels.com/photos/5933780/pexels-photo-5933780.jpeg", "https://images.pexels.com/photos/6755753/pexels-photo-6755753.jpeg"}},
		{Alt: "Lap dapur reusable", Files: []string{"https://images.pexels.com/photos/10568474/pexels-photo-10568474.jpeg", "https://www.pexels.com/photo/bag-of-pistachios-on-table-7262773/"}},
		{Alt: "Rak bambu minimalis", Files: []string{"https://images.pexels.com/photos/27549431/pexels-photo-27549431.jpeg", "https://images.pexels.com/photos/11885892/pexels-photo-11885892.jpeg", "https://images.pexels.com/photos/18037193/pexels-photo-18037193.jpeg"}},
		{Alt: "Spons Loofah alami", Files: []string{"https://images.pexels.com/photos/9475410/pexels-photo-9475410.jpeg", "https://images.pexels.com/photos/5237889/pexels-photo-5237889.jpeg"}},
		{Alt: "Kaos katun organik", Files: []string{"https://images.pexels.com/photos/14428675/pexels-photo-14428675.jpeg", "https://images.pexels.com/photos/14428673/pexels-photo-14428673.jpeg"}},
		{Alt: "Celana linen natural", Files: []string{"https://images.pexels.com/photos/5175692/pexels-photo-5175692.jpeg", "https://images.pexels.com/photos/16268832/pexels-photo-16268832.jpeg", "https://images.pexels.com/photos/28518884/pexels-photo-28518884.jpeg", "https://images.pexels.com/photos/7623519/pexels-photo-7623519.jpeg"}},
		{Alt: "Jaket serat hemp", Files: []string{"https://images.pexels.com/photos/11442987/pexels-photo-11442987.jpeg", "https://images.pexels.com/photos/8216166/pexels-photo-8216166.jpeg", "https://images.pexels.com/photos/6779737/pexels-photo-6779737.jpeg", "https://images.pexels.com/photos/30907771/pexels-photo-30907771.jpeg"}},
		{Alt: "Topi anyaman bambu", Files: []string{"https://images.pexels.com/photos/31680052/pexels-photo-31680052.jpeg", "https://images.pexels.com/photos/31431528/pexels-photo-31431528.jpeg", "https://images.pexels.com/photos/37877056/pexels-photo-37877056.jpeg", "https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg"}},
		{Alt: "Dompet vegan cork", Files: []string{"https://images.pexels.com/photos/12495665/pexels-photo-12495665.jpeg", "https://images.pexels.com/photos/7680469/pexels-photo-7680469.jpeg", "https://images.pexels.com/photos/9807760/pexels-photo-9807760.jpeg", "https://images.pexels.com/photos/36343445/pexels-photo-36343445.jpeg"}},
		{Alt: "Kacamata frame bambu", Files: []string{"https://images.pexels.com/photos/10155002/pexels-photo-10155002.jpeg", "https://images.pexels.com/photos/10135767/pexels-photo-10135767.jpeg", "https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg", "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg"}},
		{Alt: "Kaos kaki bambu", Files: []string{"https://images.pexels.com/photos/9594414/pexels-photo-9594414.jpeg", "https://images.pexels.com/photos/19882183/pexels-photo-19882183.jpeg", "https://images.pexels.com/photos/11212879/pexels-photo-11212879.jpeg", "https://images.pexels.com/photos/1601646700676-e13d969eb2db.jpeg"}},
		{Alt: "Beras organik", Files: []string{"https://images.pexels.com/photos/5114289/pexels-photo-5114289.jpeg", "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg", "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg"}},
		{Alt: "Teh hijau organik", Files: []string{"https://pixabay.com/id/images/download/mirkostoedter-tea-6568547_1920.jpg", "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg", "https://pixabay.com/id/images/download/ravendasingh-tea-7378930_1920.jpg", "https://pixabay.com/id/images/download/appledeng-green-tea-3528472_1920.jpg"}},
		{Alt: "Madu hutan murni", Files: []string{"https://images.pexels.com/photos/30666803/pexels-photo-30666803.jpeg", "https://images.pexels.com/photos/9105965/pexels-photo-9105965.jpeg", "https://images.pexels.com/photos/13246534/pexels-photo-13246534.jpeg", "https://images.pexels.com/photos/10631301/pexels-photo-10631301.jpeg"}},
		{Alt: "Granola organik", Files: []string{"https://images.pexels.com/photos/19318453/pexels-photo-19318453.jpeg", "https://images.pexels.com/photos/879202/pexels-photo-879202.jpeg", "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg", "https://images.pexels.com/photos/28278532/pexels-photo-28278532.jpeg"}},
		{Alt: "Biji kopi organik", Files: []string{"https://images.pexels.com/photos/1559525839-b184a4d698c7.jpeg", "https://images.pexels.com/photos/1611162458324-aae1eb4129a4.jpeg"}},
		{Alt: "Kit hidroponik", Files: []string{"https://images.pexels.com/photos/1530836369250-ef71a3f5e9da.jpeg", "https://images.pexels.com/photos/1589923188900-85dae523342b.jpeg"}},
		{Alt: "Gula aren organik", Files: []string{"https://images.pexels.com/photos/1621317762646-4a41bd27d2bf.jpeg", "https://images.pexels.com/photos/1518063080076-200c8227b29a.jpeg"}},
		{Alt: "Serum rosehip", Files: []string{"https://images.pexels.com/photos/1620916566398-39f1143ab7be.jpeg", "https://images.pexels.com/photos/1608248543803-ba4f8c70ae0b.jpeg"}},
		{Alt: "Pelembab wajah natural", Files: []string{"https://images.pexels.com/photos/1556228578-0d85b1a4d571.jpeg", "https://images.pexels.com/photos/1615397323136-2ee2a3e895ec.jpeg"}},
		{Alt: "Sunscreen ramah lingkungan", Files: []string{"https://images.pexels.com/photos/1556228453-efd6c1ff04f6.jpeg", "https://images.pexels.com/photos/1526045612212-70caf35c14df.jpeg"}},
		{Alt: "Deodoran natural", Files: []string{"https://images.pexels.com/photos/1608248593842-8021c324e9cb.jpeg", "https://images.pexels.com/photos/1615397323062-811c7d23d8c3.jpeg"}},
		{Alt: "Panel surya", Files: []string{"https://images.pexels.com/photos/1509391366360-2e959784a276.jpeg", "https://images.pexels.com/photos/1497440001374-f26997328c1b.jpeg"}},
		{Alt: "Lampu LED smart", Files: []string{"https://images.pexels.com/photos/1550989460-0adf9ea622e2.jpeg", "https://images.pexels.com/photos/1563461660947-507ef49e9c47.jpeg"}},
		{Alt: "Powerbank tenaga surya", Files: []string{"https://images.pexels.com/photos/1610488425257-21a4be463d42.jpeg", "https://images.pexels.com/photos/1601362840469-51e4d8d58785.jpeg"}},
		{Alt: "Bibit cabai organik", Files: []string{"https://images.pexels.com/photos/16532190/pexels-photo-16532190.jpeg", "https://images.pexels.com/photos/5479386/pexels-photo-5479386.jpeg", "https://images.pexels.com/photos/17959157/pexels-photo-17959157.jpeg", "https://images.pexels.com/photos/17959157/pexels-photo-17959157.jpeg"}},
		{Alt: "Bibit tomat organik", Files: []string{"https://images.pexels.com/photos/8180575/pexels-photo-8180575.jpeg", "https://images.pexels.com/photos/8180577/pexels-photo-8180577.jpeg", "https://images.pexels.com/photos/8767747/pexels-photo-8767747.jpeg", "https://images.pexels.com/photos/18077698/pexels-photo-18077698.jpeg"}},
		{Alt: "Bibit selada hidroponik", Files: []string{"https://images.pexels.com/photos/37371168/pexels-photo-37371168.jpeg", "https://images.pexels.com/photos/36544081/pexels-photo-36544081.jpeg", "https://images.pexels.com/photos/34781893/pexels-photo-34781893.jpeg", "https://images.pexels.com/photos/348689/pexels-photo-348689.jpeg"}},
		{Alt: "Bibit kangkung organik", Files: []string{"https://images.pexels.com/photos/13768938/pexels-photo-13768938.jpeg", "https://images.pexels.com/photos/11064917/pexels-photo-11064917.jpeg", "https://images.pexels.com/photos/7728025/pexels-photo-7728025.jpeg", "https://images.pexels.com/photos/33214227/pexels-photo-33214227.jpeg"}},
		{Alt: "Bibit pakcoy organik", Files: []string{"https://images.pexels.com/photos/7457033/pexels-photo-7457033.jpeg", "https://images.pexels.com/photos/31018822/pexels-photo-31018822.jpeg", "https://images.pexels.com/photos/20280082/pexels-photo-20280082.jpeg", "https://images.pexels.com/photos/11733083/pexels-photo-11733083.jpeg"}},
		{Alt: "Bibit bayam hijau", Files: []string{"https://images.pexels.com/photos/31508558/pexels-photo-31508558.jpeg", "https://images.pexels.com/photos/37812062/pexels-photo-37812062.jpeg", "https://images.pexels.com/photos/16731602/pexels-photo-16731602.jpeg"}},
		{Alt: "Bibit terong ungu", Files: []string{"https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg", "https://images.pexels.com/photos/12572532/pexels-photo-12572532.jpeg", "https://images.pexels.com/photos/16732700/pexels-photo-16732700.jpeg", "https://images.pexels.com/photos/17975556/pexels-photo-17975556.jpeg"}},
		{Alt: "Bibit mentimun organik", Files: []string{"https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg", "https://images.pexels.com/photos/17196492/pexels-photo-17196492.jpeg", "https://images.pexels.com/photos/36727531/pexels-photo-36727531.jpeg"}},
		{Alt: "Bibit melon premium", Files: []string{"https://images.pexels.com/photos/31848991/pexels-photo-31848991.jpeg", "https://images.pexels.com/photos/4772954/pexels-photo-4772954.jpeg", "https://images.pexels.com/photos/37058359/pexels-photo-37058359.jpeg", "https://images.pexels.com/photos/17973422/pexels-photo-17973422.jpeg"}},
		{Alt: "Bibit semangka organik", Files: []string{"https://images.pexels.com/photos/7543140/pexels-photo-7543140.jpeg", "https://images.pexels.com/photos/36767003/pexels-photo-36767003.jpeg", "https://images.pexels.com/photos/33385187/pexels-photo-33385187.jpeg", "https://images.pexels.com/photos/4966362/pexels-photo-4966362.jpeg"}},
		{Alt: "Sayur organik mix pack", Files: []string{"https://images.pexels.com/photos/19938250/pexels-photo-19938250.jpeg", "https://images.pexels.com/photos/37202279/pexels-photo-37202279.jpeg", "https://images.pexels.com/photos/13047434/pexels-photo-13047434.jpeg", "https://images.pexels.com/photos/16248762/pexels-photo-16248762.jpeg"}},
		{Alt: "Buah naga organik", Files: []string{"https://images.pexels.com/photos/31252553/pexels-photo-31252553.jpeg", "https://images.pexels.com/photos/5945921/pexels-photo-5945921.jpeg", "https://images.pexels.com/photos/3691116/pexels-photo-3691116.jpeg", "https://images.pexels.com/photos/8813523/pexels-photo-8813523.jpeg"}},
		{Alt: "Alpukat organik", Files: []string{"https://images.pexels.com/photos/36998771/pexels-photo-36998771.jpeg", "https://images.pexels.com/photos/12736163/pexels-photo-12736163.jpeg", "https://images.pexels.com/photos/3850617/pexels-photo-3850617.jpeg", "https://images.pexels.com/photos/16038613/pexels-photo-16038613.jpeg"}},
		{Alt: "Jeruk organik", Files: []string{"https://images.pexels.com/photos/30530318/pexels-photo-30530318.jpeg", "https://images.pexels.com/photos/36538626/pexels-photo-36538626.jpeg", "https://images.pexels.com/photos/34900599/pexels-photo-34900599.jpeg", "https://images.pexels.com/photos/5945632/pexels-photo-5945632.jpeg"}},
		{Alt: "Pisang organik", Files: []string{"https://images.pexels.com/photos/33045683/pexels-photo-33045683.jpeg", "https://images.pexels.com/photos/30683925/pexels-photo-30683925.jpeg", "https://images.pexels.com/photos/8218185/pexels-photo-8218185.jpeg", "https://images.pexels.com/photos/36929930/pexels-photo-36929930.jpeg"}},
		{Alt: "Keripik pisang UMKM", Files: []string{"https://images.pexels.com/photos/32280801/pexels-photo-32280801.jpeg", "https://images.pexels.com/photos/17202139/pexels-photo-17202139.jpeg", "https://images.pexels.com/photos/17202142/pexels-photo-17202142.jpeg", "https://images.pexels.com/photos/7262975/pexels-photo-7262975.jpeg"}},
		{Alt: "Singkong organik", Files: []string{"https://images.pexels.com/photos/30893344/pexels-photo-30893344.jpeg", "https://images.pexels.com/photos/7543155/pexels-photo-7543155.jpeg", "https://images.pexels.com/photos/30204260/pexels-photo-30204260.jpeg", "https://images.pexels.com/photos/7543161/pexels-photo-7543161.jpeg"}},
		{Alt: "Keripik singkong", Files: []string{"https://images.pexels.com/photos/14507073/pexels-photo-14507073.jpeg", "https://images.pexels.com/photos/12118917/pexels-photo-12118917.jpeg", "https://images.pexels.com/photos/4205755/pexels-photo-4205755.jpeg"}},
		{Alt: "Selai stroberi organik", Files: []string{"https://images.pexels.com/photos/96580/pexels-photo-96580.jpeg", "https://images.pexels.com/photos/12369983/pexels-photo-12369983.jpeg", "https://images.pexels.com/photos/26727863/pexels-photo-26727863.jpeg", "https://images.pexels.com/photos/26727860/pexels-photo-26727860.jpeg"}},
		{Alt: "Nanas organik", Files: []string{"https://images.pexels.com/photos/37405731/pexels-photo-37405731.jpeg", "https://images.pexels.com/photos/36489881/pexels-photo-36489881.jpeg", "https://images.pexels.com/photos/6875371/pexels-photo-6875371.jpeg", "https://images.pexels.com/photos/7194899/pexels-photo-7194899.jpeg"}},
		{Alt: "Kelapa muda", Files: []string{"https://images.pexels.com/photos/4395019/pexels-photo-4395019.jpeg", "https://images.pexels.com/photos/7248416/pexels-photo-7248416.jpeg", "https://images.pexels.com/photos/3986706/pexels-photo-3986706.jpeg", "https://images.pexels.com/photos/4294732/pexels-photo-4294732.jpeg"}},
		{Alt: "Gula aren organik", Files: []string{"https://images.pexels.com/photos/37863448/pexels-photo-37863448.jpeg", "https://images.pexels.com/photos/37863445/pexels-photo-37863445.jpeg", "https://images.pexels.com/photos/13746810/pexels-photo-13746810.jpeg", "https://images.pexels.com/photos/13746814/pexels-photo-13746814.jpeg"}},
		{Alt: "Jahe organik", Files: []string{"https://images.pexels.com/photos/10112135/pexels-photo-10112135.jpeg", "https://images.pexels.com/photos/10112136/pexels-photo-10112136.jpeg", "https://images.pexels.com/photos/20234970/pexels-photo-20234970.jpeg", "https://images.pexels.com/photos/161556/pexels-photo-161556.jpeg"}},
		{Alt: "Kunyit organik", Files: []string{"https://images.pexels.com/photos/36075348/pexels-photo-36075348.jpeg", "https://images.pexels.com/photos/6220710/pexels-photo-6220710.jpeg", "https://images.pexels.com/photos/27097318/pexels-photo-27097318.jpeg"}},
		{Alt: "Jagung organik", Files: []string{"https://images.pexels.com/photos/32357485/pexels-photo-32357485.jpeg", "https://images.pexels.com/photos/32357486/pexels-photo-32357486.jpeg", "https://images.pexels.com/photos/18732167/pexels-photo-18732167.jpeg", "https://images.pexels.com/photos/23882450/pexels-photo-23882450.jpeg"}},
	}

	if len(productIDs) == 0 {
		log.Println("⚠️  Product images skipped: no product IDs provided")
		return
	}

	limit := len(productIDs)
	if len(imageDefs) < limit {
		limit = len(imageDefs)
		log.Printf("⚠️  Product images warning: productIDs=%d but image definitions=%d. Extra products skipped.", len(productIDs), len(imageDefs))
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
	if strings.HasPrefix(fileName, "http://") || strings.HasPrefix(fileName, "https://") {
		return fileName
	}

	baseURL := os.Getenv("PUBLIC_CATALOG_ASSET_URL")
	if baseURL == "" {
		baseURL = os.Getenv("CATALOG_ASSET_BASE_URL")
	}
	// ===============================
	// Local Docker implementation (fallback)
	// ===============================
	// if baseURL == "" {
	// 	baseURL = "http://localhost/api/catalog/assets"
	// }
	// ===============================
	// Managed Cloud: require explicit env var
	// ===============================
	if baseURL == "" {
		baseURL = "/api/catalog/assets"
	}

	baseURL = strings.TrimRight(baseURL, "/")
	fileName = strings.TrimLeft(fileName, "/")

	return fmt.Sprintf("%s/products/%s", baseURL, fileName)
}

func ensureProductImageIndexes(ctx context.Context, col *mongo.Collection) {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "product_id", Value: 1}, {Key: "order", Value: 1}},
			Options: options.Index().SetName("uniq_active_product_image_order").SetUnique(true).SetPartialFilterExpression(bson.M{"deleted_at": nil}),
		},
		{
			Keys: bson.D{{Key: "product_id", Value: 1}, {Key: "is_primary", Value: 1}},
			Options: options.Index().SetName("idx_product_image_primary"),
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
		"product_id": bson.M{"$in": productIDs},
		"url":        bson.M{"$regex": "source\\.unsplash\\.com|picsum\\.photos"},
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