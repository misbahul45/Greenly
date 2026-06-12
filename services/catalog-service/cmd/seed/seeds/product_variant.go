package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedProductVariants(ctx context.Context, db *mongo.Database, productIDs []string) []string {
	col := db.Collection("product_variants")
	now := time.Now()

	ensureProductVariantIndexes(ctx, col)

	type variantDef struct {
		Name string
		SKU  string
	}

	variantsByProduct := [][]variantDef{
		// 0: Botol Stainless Thermos
		{
			{Name: "500ml Hitam Matte", SKU: "VAR-BTL001-500-BLK"},
			{Name: "500ml Silver", SKU: "VAR-BTL001-500-SLV"},
			{Name: "750ml Hitam Matte", SKU: "VAR-BTL001-750-BLK"},
		},

		// 1: Tumbler Bambu
		{
			{Name: "350ml Natural Bamboo", SKU: "VAR-BTL002-350-NAT"},
			{Name: "500ml Natural Bamboo", SKU: "VAR-BTL002-500-NAT"},
		},

		// 2: Tas Kanvas Organik
		{
			{Name: "Natural Cream", SKU: "VAR-TAS001-NAT"},
			{Name: "Navy Blue", SKU: "VAR-TAS001-NVY"},
			{Name: "Olive Green", SKU: "VAR-TAS001-OLV"},
		},

		// 3: Tas Bambu Artisanal
		{
			{Name: "Natural Medium", SKU: "VAR-TAS002-M"},
			{Name: "Natural Large", SKU: "VAR-TAS002-L"},
		},

		// 4: Set Sedotan Stainless
		{
			{Name: "Lurus 6pcs", SKU: "VAR-SDT001-STR"},
			{Name: "Bengkok 6pcs", SKU: "VAR-SDT001-BND"},
			{Name: "Mix Lurus + Bengkok 6pcs", SKU: "VAR-SDT001-MIX"},
		},

		// 5: Peralatan Makan Bambu
		{
			{Name: "Set 5pcs Natural", SKU: "VAR-PMK001-5"},
			{Name: "Set 8pcs Natural", SKU: "VAR-PMK001-8"},
		},

		// 6: Lilin Soy Wax
		{
			{Name: "Lavender 150gr", SKU: "VAR-LLN001-LAV"},
			{Name: "Eucalyptus 150gr", SKU: "VAR-LLN001-EUC"},
			{Name: "Vanilla 150gr", SKU: "VAR-LLN001-VNL"},
		},

		// 7: Lap Microfiber
		{
			{Name: "Set 5pcs", SKU: "VAR-LAP001-5"},
			{Name: "Set 10pcs", SKU: "VAR-LAP001-10"},
		},

		// 8: Rak Bambu
		{
			{Name: "3 Susun Natural", SKU: "VAR-RAK001-3"},
			{Name: "4 Susun Natural", SKU: "VAR-RAK001-4"},
		},

		// 9: Kaos Katun Organik
		{
			{Name: "S Natural White", SKU: "VAR-KOS001-S-WHT"},
			{Name: "M Natural White", SKU: "VAR-KOS001-M-WHT"},
			{Name: "L Natural White", SKU: "VAR-KOS001-L-WHT"},
			{Name: "XL Natural White", SKU: "VAR-KOS001-XL-WHT"},
		},

		// 10: Celana Linen
		{
			{Name: "S/M Natural Beige", SKU: "VAR-CLN001-SM-BGE"},
			{Name: "L/XL Natural Beige", SKU: "VAR-CLN001-LXL-BGE"},
			{Name: "XXL Natural Beige", SKU: "VAR-CLN001-XXL-BGE"},
		},

		// 11: Jaket Hemp
		{
			{Name: "S Olive", SKU: "VAR-JKT001-S-OLV"},
			{Name: "M Olive", SKU: "VAR-JKT001-M-OLV"},
			{Name: "L Olive", SKU: "VAR-JKT001-L-OLV"},
			{Name: "XL Olive", SKU: "VAR-JKT001-XL-OLV"},
		},

		// 12: Topi Bambu
		{
			{Name: "Free Size Natural", SKU: "VAR-TOP001-FS-NAT"},
			{Name: "Free Size Cokelat", SKU: "VAR-TOP001-FS-BRN"},
		},

		// 13: Dompet Cork
		{
			{Name: "Slim Horizontal Natural", SKU: "VAR-DMP001-H-NAT"},
			{Name: "Bifold Vertical Natural", SKU: "VAR-DMP001-V-NAT"},
		},

		// 14: Kacamata Bambu
		{
			{Name: "Kotak Regular", SKU: "VAR-KCM001-REG"},
			{Name: "Bulat Round", SKU: "VAR-KCM001-RND"},
		},

		// 15: Beras Organik
		{
			{Name: "1kg", SKU: "VAR-BRS001-1KG"},
			{Name: "2kg", SKU: "VAR-BRS001-2KG"},
			{Name: "5kg", SKU: "VAR-BRS001-5KG"},
		},

		// 16: Teh Hijau Organik
		{
			{Name: "50gr Loose Leaf", SKU: "VAR-TEH001-50"},
			{Name: "100gr Loose Leaf", SKU: "VAR-TEH001-100"},
			{Name: "Box 20 Sachet", SKU: "VAR-TEH001-BOX20"},
		},

		// 17: Madu Hutan
		{
			{Name: "250gr", SKU: "VAR-MDU001-250"},
			{Name: "500gr", SKU: "VAR-MDU001-500"},
			{Name: "1000gr", SKU: "VAR-MDU001-1KG"},
		},

		// 18: Granola Organik
		{
			{Name: "Original 300gr", SKU: "VAR-GRN001-ORI-300"},
			{Name: "Cokelat 300gr", SKU: "VAR-GRN001-CHC-300"},
			{Name: "Mixed Berry 300gr", SKU: "VAR-GRN001-BRY-300"},
		},

		// 19: Kopi Flores Organik
		{
			{Name: "Biji 250gr", SKU: "VAR-KPI001-BEAN-250"},
			{Name: "Bubuk 250gr", SKU: "VAR-KPI001-GRD-250"},
			{Name: "Biji 500gr", SKU: "VAR-KPI001-BEAN-500"},
		},

		// 20: Kit Hidroponik
		{
			{Name: "Starter Kit", SKU: "VAR-HDP001-STR"},
			{Name: "Pro Kit", SKU: "VAR-HDP001-PRO"},
		},

		// 21: Pupuk Organik Cair
		{
			{Name: "500ml", SKU: "VAR-PPK001-500"},
			{Name: "1000ml", SKU: "VAR-PPK001-1L"},
		},

		// 22: Serum Rosehip
		{
			{Name: "30ml", SKU: "VAR-SRM001-30"},
			{Name: "50ml", SKU: "VAR-SRM001-50"},
		},

		// 23: Pelembab Shea Butter
		{
			{Name: "60ml Normal Skin", SKU: "VAR-PLB001-NRM-60"},
			{Name: "60ml Sensitive Skin", SKU: "VAR-PLB001-SEN-60"},
			{Name: "100ml Normal Skin", SKU: "VAR-PLB001-NRM-100"},
		},

		// 24: Toner Rose Water
		{
			{Name: "100ml Travel", SKU: "VAR-TNR001-100"},
			{Name: "200ml Regular", SKU: "VAR-TNR001-200"},
		},

		// 25: Sunscreen Mineral
		{
			{Name: "50ml SPF50", SKU: "VAR-SUN001-SPF50-50"},
			{Name: "100ml SPF50", SKU: "VAR-SUN001-SPF50-100"},
			{Name: "50ml SPF30", SKU: "VAR-SUN001-SPF30-50"},
		},

		// 26: Sikat Gigi Bambu
		{
			{Name: "Soft Pack 4", SKU: "VAR-SBG001-SOFT-4"},
			{Name: "Medium Pack 4", SKU: "VAR-SBG001-MED-4"},
		},

		// 27: Sabun Batang Lavender
		{
			{Name: "Lavender 100gr Single", SKU: "VAR-SBN001-LAV-100"},
			{Name: "Lavender 200gr Twin Pack", SKU: "VAR-SBN001-LAV-TW"},
			{Name: "Rose 100gr Single", SKU: "VAR-SBN001-ROSE-100"},
		},

		// 28: Sampo Padat
		{
			{Name: "60gr Normal Hair", SKU: "VAR-SMP001-NRM-60"},
			{Name: "60gr Oily Hair", SKU: "VAR-SMP001-OLY-60"},
			{Name: "60gr Dry Hair", SKU: "VAR-SMP001-DRY-60"},
		},

		// 29: Panel Surya Portable
		{
			{Name: "20W Kuning", SKU: "VAR-PSR001-20W-YLW"},
			{Name: "20W Hitam", SKU: "VAR-PSR001-20W-BLK"},
		},

		// 30: Lampu LED Smart
		{
			{Name: "9W Warm White Set 4", SKU: "VAR-LMP001-9W-WW-4"},
			{Name: "9W Cool White Set 4", SKU: "VAR-LMP001-9W-CW-4"},
		},
	}

	if len(productIDs) == 0 {
		log.Println("⚠️  Product variants skipped: no product IDs provided")
		return []string{}
	}

	limit := len(productIDs)
	if len(variantsByProduct) < limit {
		limit = len(variantsByProduct)
		log.Printf(
			"⚠️  Product variants warning: productIDs=%d but variant definitions=%d. Extra products skipped.",
			len(productIDs),
			len(variantsByProduct),
		)
	}

	variantIDs := make([]string, 0)

	for i := 0; i < limit; i++ {
		productID := productIDs[i]
		variants := variantsByProduct[i]

		for _, v := range variants {
			generatedID := NewID()

			filter := bson.M{
				"product_id": productID,
				"sku":        v.SKU,
				"deleted_at": nil,
			}

			update := bson.M{
				"$set": bson.M{
					"name":       v.Name,
					"is_active":  true,
					"updated_at": now,
					"deleted_at": nil,
				},
				"$setOnInsert": bson.M{
					"_id":        generatedID,
					"product_id": productID,
					"sku":        v.SKU,
					"created_at": now,
				},
			}

			opts := options.FindOneAndUpdate().
				SetUpsert(true).
				SetReturnDocument(options.After)

			var result struct {
				ID string `bson:"_id"`
			}

			if err := col.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result); err != nil {
				log.Printf("⚠️  Product variant upsert failed sku=%s product_id=%s: %v", v.SKU, productID, err)
				continue
			}

			variantIDs = append(variantIDs, result.ID)
		}
	}

	log.Printf("✅ Product variants seeded/updated (%d)", len(variantIDs))
	return variantIDs
}

func ensureProductVariantIndexes(ctx context.Context, col *mongo.Collection) {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "sku", Value: 1},
			},
			Options: options.Index().
				SetName("uniq_active_product_variant_sku").
				SetUnique(true).
				SetPartialFilterExpression(bson.M{
					"deleted_at": nil,
				}),
		},
		{
			Keys: bson.D{
				{Key: "product_id", Value: 1},
				{Key: "sku", Value: 1},
			},
			Options: options.Index().
				SetName("idx_product_variant_product_sku"),
		},
	}

	if _, err := col.Indexes().CreateMany(ctx, indexes); err != nil {
		log.Printf("⚠️  Product variant index warning: %v", err)
	}
}
