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
		{{"128GB Hitam", "VAR-HP001-128-BLK"}, {"256GB Hitam", "VAR-HP001-256-BLK"}, {"256GB Putih", "VAR-HP001-256-WHT"}},
		{{"256GB Hitam Titanium", "VAR-HP002-256-BLK"}, {"512GB Hitam Titanium", "VAR-HP002-512-BLK"}, {"1TB Natural Titanium", "VAR-HP002-1T-NAT"}},
		{{"12GB/256GB Hitam", "VAR-HP003-256-BLK"}, {"16GB/512GB Putih", "VAR-HP003-512-WHT"}},
		{{"64GB Silver", "VAR-TAB001-64-SLV"}, {"128GB Graphite", "VAR-TAB001-128-GRP"}},
		{{"RTX 4060 Eclipse Gray", "VAR-LPT001-4060-GRY"}, {"RTX 4070 Eclipse Gray", "VAR-LPT001-4070-GRY"}},
		{{"Hitam", "VAR-AUD001-BLK"}, {"Putih", "VAR-AUD001-WHT"}, {"Silver", "VAR-AUD001-SLV"}},
		{{"Graphite", "VAR-AUD002-GRP"}, {"White", "VAR-AUD002-WHT"}},
		{{"Body Only", "VAR-KMR001-BODY"}, {"Kit 28-70mm", "VAR-KMR001-KIT"}},
		{{"S Merah", "VAR-DRS001-S-RED"}, {"M Merah", "VAR-DRS001-M-RED"}, {"L Biru", "VAR-DRS001-L-BLU"}, {"XL Biru", "VAR-DRS001-XL-BLU"}},
		{{"S", "VAR-BLS001-S"}, {"M", "VAR-BLS001-M"}, {"L", "VAR-BLS001-L"}, {"XL", "VAR-BLS001-XL"}},
		{{"S Krem", "VAR-KBY001-S-CRM"}, {"M Krem", "VAR-KBY001-M-CRM"}, {"L Navy", "VAR-KBY001-L-NVY"}},
		{{"S", "VAR-KMJ001-S"}, {"M", "VAR-KMJ001-M"}, {"L", "VAR-KMJ001-L"}, {"XL", "VAR-KMJ001-XL"}, {"XXL", "VAR-KMJ001-XXL"}},
		{{"S", "VAR-BTK001-S"}, {"M", "VAR-BTK001-M"}, {"L", "VAR-BTK001-L"}, {"XL", "VAR-BTK001-XL"}},
		{{"Coklat Muda", "VAR-TAS001-LBR"}, {"Coklat Tua", "VAR-TAS001-DBR"}, {"Hitam", "VAR-TAS001-BLK"}},
		{{"36 Nude", "VAR-HLS001-36-NUD"}, {"37 Nude", "VAR-HLS001-37-NUD"}, {"38 Hitam", "VAR-HLS001-38-BLK"}, {"39 Hitam", "VAR-HLS001-39-BLK"}},
		{{"39 Hitam", "VAR-OXF001-39-BLK"}, {"40 Hitam", "VAR-OXF001-40-BLK"}, {"41 Coklat", "VAR-OXF001-41-BRN"}, {"42 Coklat", "VAR-OXF001-42-BRN"}},
		{{"Original 500gr", "VAR-RND001-500"}, {"Pedas 500gr", "VAR-RND001-500-HOT"}, {"Original 1kg", "VAR-RND001-1KG"}},
		{{"Biji 250gr", "VAR-KPI001-BEAN-250"}, {"Bubuk 250gr", "VAR-KPI001-GRD-250"}, {"Biji 500gr", "VAR-KPI001-BEAN-500"}},
		{{"Original 200gr", "VAR-SMB001-200"}, {"Extra Pedas 200gr", "VAR-SMB001-200-HOT"}},
		{{"Original 250gr", "VAR-KRP001-250"}, {"Pedas 250gr", "VAR-KRP001-250-HOT"}, {"Keju 250gr", "VAR-KRP001-250-CHS"}},
		{{"Original 500gr", "VAR-DDL001-500"}, {"Wijen 500gr", "VAR-DDL001-500-SES"}},
		{{"39 Hitam", "VAR-SPT001-39-BLK"}, {"40 Hitam", "VAR-SPT001-40-BLK"}, {"41 Biru", "VAR-SPT001-41-BLU"}, {"42 Biru", "VAR-SPT001-42-BLU"}, {"43 Merah", "VAR-SPT001-43-RED"}},
		{{"S", "VAR-JRS001-S"}, {"M", "VAR-JRS001-M"}, {"L", "VAR-JRS001-L"}, {"XL", "VAR-JRS001-XL"}, {"XXL", "VAR-JRS001-XXL"}},
		{{"2-24kg Hitam", "VAR-DBL001-BLK"}, {"2-24kg Silver", "VAR-DBL001-SLV"}},
		{{"Hijau 6mm", "VAR-YGM001-GRN"}, {"Ungu 6mm", "VAR-YGM001-PRP"}, {"Biru 6mm", "VAR-YGM001-BLU"}},
		{{"Chocolate 1kg", "VAR-WPI001-CHC-1KG"}, {"Vanilla 1kg", "VAR-WPI001-VNL-1KG"}, {"Strawberry 1kg", "VAR-WPI001-STR-1KG"}},
		{{"30ml", "VAR-SRM001-30"}, {"50ml", "VAR-SRM001-50"}},
		{{"50ml Normal", "VAR-MST001-50-NRM"}, {"50ml Oily", "VAR-MST001-50-OLY"}, {"100ml Normal", "VAR-MST001-100-NRM"}},
		{{"200ml", "VAR-TNR001-200"}, {"400ml", "VAR-TNR001-400"}},
		{{"50ml SPF50", "VAR-SUN001-50"}, {"100ml SPF50", "VAR-SUN001-100"}, {"50ml SPF30", "VAR-SUN001-50-30"}},
		{{"#01 Ivory", "VAR-FND001-01"}, {"#02 Beige", "VAR-FND001-02"}, {"#03 Sand", "VAR-FND001-03"}, {"#04 Caramel", "VAR-FND001-04"}},
		{{"#01 Coral", "VAR-LPT001-01"}, {"#02 Rose", "VAR-LPT001-02"}, {"#03 Berry", "VAR-LPT001-03"}, {"#04 Brick", "VAR-LPT001-04"}},
		{{"50ml", "VAR-HSR001-50"}, {"100ml", "VAR-HSR001-100"}},
		{{"250ml Normal", "VAR-SHP001-250-NRM"}, {"250ml Oily", "VAR-SHP001-250-OLY"}, {"500ml Normal", "VAR-SHP001-500-NRM"}},
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
