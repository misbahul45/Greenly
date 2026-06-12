package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedActivePrices(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("active_prices")
	now := time.Now()

	finalPrices := []float64{
		130500, // botol stainless thermos (10% off)
		157250, // tumbler bambu (15% off)
		67500,  // tas kanvas organik (10% off)
		202500, // tas bambu artisanal (10% off)
		58500,  // set sedotan stainless (10% off)
		175500, // set peralatan makan bambu (10% off)
		76500,  // lilin soy wax (10% off)
		49500,  // lap microfiber (10% off)
		247500, // rak bambu desktop (10% off)
		166500, // kaos katun organik GOTS (10% off)
		220500, // celana linen natural (10% off)
		346500, // jaket hemp organik (10% off)
		139500, // topi anyaman bambu (10% off)
		175500, // dompet cork oak (10% off)
		292500, // kacamata bambu (10% off)
		40500,  // beras organik cianjur (10% off)
		58500,  // teh hijau organik (10% off)
		166500, // madu hutan kalimantan (10% off)
		67500,  // granola oat organik (10% off)
		85500,  // kopi arabika organik (10% off)
		247500, // kit hidroponik (10% off)
		49500,  // pupuk organik cair (10% off)
		131250, // serum rosehip organik (25% off)
		108750, // pelembab shea butter (25% off)
		76000,  // toner rose water (20% off)
		140250, // sunscreen mineral (15% off)
		36000,  // sikat gigi bambu (20% off)
		28000,  // sabun batang lavender (20% off)
		48400,  // sampo padat organik (12% off)
		787500, // panel surya portable (10% off)
		130500, // lampu LED smart (10% off)
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		finalPrice := finalPrices[i%len(finalPrices)]
		docs = append(docs, map[string]interface{}{
			"_id":         NewID(),
			"product_id":  productID,
			"final_price": finalPrice,
			"updated_at":  now,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Active prices insert: %v", err)
	}
	log.Printf("✅ Active prices seeded (%d)", len(docs))
}
