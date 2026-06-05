package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedProductVariants(ctx context.Context, db *mongo.Database, productIDs []string) []string {
	col := db.Collection("product_variants")
	now := time.Now()

	type variantDef struct {
		name string
		sku  string
	}

	variantsByProduct := [][]variantDef{
		// 0: botol stainless thermos
		{{"500ml Hitam Matte", "VAR-BTL001-500-BLK"}, {"500ml Silver", "VAR-BTL001-500-SLV"}, {"750ml Hitam Matte", "VAR-BTL001-750-BLK"}},
		// 1: tumbler bambu
		{{"350ml Natural", "VAR-BTL002-350-NAT"}, {"500ml Natural", "VAR-BTL002-500-NAT"}},
		// 2: tas kanvas organik
		{{"Natural Cream", "VAR-TAS001-NAT"}, {"Navy Blue", "VAR-TAS001-NVY"}, {"Olive Green", "VAR-TAS001-OLV"}},
		// 3: tas bambu artisanal
		{{"Natural Medium", "VAR-TAS002-M"}, {"Natural Large", "VAR-TAS002-L"}},
		// 4: set sedotan stainless
		{{"Lurus 6pcs", "VAR-SDT001-STR"}, {"Bengkok 6pcs", "VAR-SDT001-BND"}, {"Mix Lurus+Bengkok", "VAR-SDT001-MIX"}},
		// 5: peralatan makan bambu
		{{"Set 5pcs Natural", "VAR-PMK001-5"}, {"Set 8pcs Natural", "VAR-PMK001-8"}},
		// 6: lilin soy wax
		{{"Lavender 150gr", "VAR-LLN001-LAV"}, {"Eucalyptus 150gr", "VAR-LLN001-EUC"}, {"Vanilla 150gr", "VAR-LLN001-VNL"}},
		// 7: lap microfiber
		{{"Set 5pcs", "VAR-LAP001-5"}, {"Set 10pcs", "VAR-LAP001-10"}},
		// 8: rak bambu
		{{"3 Susun Natural", "VAR-RAK001-3"}, {"4 Susun Natural", "VAR-RAK001-4"}},
		// 9: kaos katun organik
		{{"S Natural White", "VAR-KOS001-S"}, {"M Natural White", "VAR-KOS001-M"}, {"L Natural White", "VAR-KOS001-L"}, {"XL Natural White", "VAR-KOS001-XL"}},
		// 10: celana linen
		{{"S/M Natural", "VAR-CLN001-SM"}, {"L/XL Natural", "VAR-CLN001-LXL"}, {"XXL Natural", "VAR-CLN001-XXL"}},
		// 11: jaket hemp
		{{"S Olive", "VAR-JKT001-S-OLV"}, {"M Olive", "VAR-JKT001-M-OLV"}, {"L Olive", "VAR-JKT001-L-OLV"}, {"XL Olive", "VAR-JKT001-XL-OLV"}},
		// 12: topi bambu
		{{"Free Size Natural", "VAR-TOP001-FS-NAT"}, {"Free Size Cokelat", "VAR-TOP001-FS-BRN"}},
		// 13: dompet cork
		{{"Slim Horizontal Natural", "VAR-DMP001-H"}, {"Bifold Vertikal Natural", "VAR-DMP001-V"}},
		// 14: kacamata bambu
		{{"Kotak Regular", "VAR-KCM001-REG"}, {"Bulat Round", "VAR-KCM001-RND"}},
		// 15: beras organik
		{{"1kg", "VAR-BRS001-1KG"}, {"2kg", "VAR-BRS001-2KG"}, {"5kg", "VAR-BRS001-5KG"}},
		// 16: teh hijau
		{{"50gr Loose Leaf", "VAR-TEH001-50"}, {"100gr Loose Leaf", "VAR-TEH001-100"}, {"Box 20 Sachet", "VAR-TEH001-BOX"}},
		// 17: madu hutan
		{{"250gr", "VAR-MDU001-250"}, {"500gr", "VAR-MDU001-500"}, {"1000gr", "VAR-MDU001-1KG"}},
		// 18: granola
		{{"Original 300gr", "VAR-GRN001-ORI"}, {"Cokelat 300gr", "VAR-GRN001-CHC"}, {"Mixed Berry 300gr", "VAR-GRN001-BRY"}},
		// 19: kopi flores
		{{"Biji 250gr", "VAR-KPI001-BEAN-250"}, {"Bubuk 250gr", "VAR-KPI001-GRD-250"}, {"Biji 500gr", "VAR-KPI001-BEAN-500"}},
		// 20: kit hidroponik
		{{"Starter Kit", "VAR-HDP001-STR"}, {"Pro Kit", "VAR-HDP001-PRO"}},
		// 21: pupuk organik
		{{"500ml", "VAR-PPK001-500"}, {"1000ml", "VAR-PPK001-1L"}},
		// 22: serum rosehip
		{{"30ml", "VAR-SRM001-30"}, {"50ml", "VAR-SRM001-50"}},
		// 23: pelembab shea
		{{"60ml Normal Skin", "VAR-PLB001-NRM"}, {"60ml Sensitive Skin", "VAR-PLB001-SEN"}, {"100ml Normal Skin", "VAR-PLB001-NRM-100"}},
		// 24: toner rose water
		{{"100ml Travel", "VAR-TNR001-100"}, {"200ml Regular", "VAR-TNR001-200"}},
		// 25: sunscreen mineral
		{{"50ml SPF50", "VAR-SUN001-50"}, {"100ml SPF50", "VAR-SUN001-100"}, {"50ml SPF30", "VAR-SUN001-50-30"}},
		// 26: sikat gigi bambu
		{{"Soft Pack 4", "VAR-SBG001-SOFT"}, {"Medium Pack 4", "VAR-SBG001-MED"}},
		// 27: sabun batang lavender
		{{"100gr Single", "VAR-SBN001-100"}, {"200gr Twin Pack", "VAR-SBN001-TW"}, {"Rose 100gr", "VAR-SBN001-ROSE"}},
		// 28: sampo padat
		{{"60gr Normal Hair", "VAR-SMP001-NRM"}, {"60gr Oily Hair", "VAR-SMP001-OLY"}, {"60gr Dry Hair", "VAR-SMP001-DRY"}},
		// 29: panel surya portable
		{{"20W Kuning", "VAR-PSR001-YLW"}, {"20W Hitam", "VAR-PSR001-BLK"}},
		// 30: lampu LED smart
		{{"9W Warm White Set 4", "VAR-LMP001-WW"}, {"9W Cool White Set 4", "VAR-LMP001-CW"}},
	}

	docs := make([]interface{}, 0)
	variantIDs := make([]string, 0)

	for i, productID := range productIDs {
		variants := variantsByProduct[i%len(variantsByProduct)]
		for _, v := range variants {
			id := NewID()
			variantIDs = append(variantIDs, id)
			docs = append(docs, map[string]interface{}{
				"_id":        id,
				"product_id": productID,
				"name":       v.name,
				"sku":        v.sku,
				"is_active":  true,
				"created_at": now,
				"updated_at": now,
				"deleted_at": nil,
			})
		}
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product variants insert: %v", err)
	}
	log.Printf("✅ Product variants seeded (%d)", len(docs))
	return variantIDs
}
