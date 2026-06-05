package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedPrices(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("prices")
	now := time.Now()

	amounts := []float64{
		145000, // botol stainless thermos
		185000, // tumbler bambu
		75000,  // tas kanvas organik
		225000, // tas bambu artisanal
		65000,  // set sedotan stainless
		195000, // set peralatan makan bambu
		85000,  // lilin soy wax
		55000,  // lap microfiber daur ulang
		275000, // rak bambu desktop
		185000, // kaos katun organik GOTS
		245000, // celana linen natural
		385000, // jaket hemp organik
		155000, // topi anyaman bambu
		195000, // dompet cork oak
		325000, // kacamata bambu
		45000,  // beras organik cianjur
		65000,  // teh hijau organik
		185000, // madu hutan kalimantan
		75000,  // granola oat organik
		95000,  // kopi arabika organik flores
		275000, // kit hidroponik pemula
		55000,  // pupuk organik cair
		175000, // serum rosehip organik
		145000, // pelembab shea butter
		95000,  // toner rose water organik
		165000, // sunscreen mineral SPF50
		45000,  // sikat gigi bambu charcoal
		35000,  // sabun batang lavender
		55000,  // sampo padat organik
		875000, // panel surya portable 20W
		145000, // lampu LED smart set 4
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		amount := amounts[i%len(amounts)]
		docs = append(docs, map[string]interface{}{
			"_id":        NewID(),
			"product_id": productID,
			"amount":     amount,
			"currency":   "IDR",
			"created_at": now,
			"updated_at": now,
			"deleted_at": nil,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Prices insert: %v", err)
	}
	log.Printf("✅ Prices seeded (%d)", len(docs))
}
