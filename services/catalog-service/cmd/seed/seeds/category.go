package seeds

import (
	"catalog-service/databases"
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedCategories(ctx context.Context, db *mongo.Database) map[string]string {
	col := db.Collection("categories")
	col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "slug", Value: 1}},
			Options: options.Index().SetUnique(true).SetSparse(true),
		},
	})

	now := time.Now()

	// Parent categories
	idDaurUlang       := NewID()
	idProdukOrganik   := NewID()
	idPerawatanAlami  := NewID()
	idRumahEco        := NewID()
	idFashionSustain  := NewID()
	idTeknologiHijau  := NewID()
	idTamanBerkebun   := NewID()
	idBukuEdukasi     := NewID()

	// Sub-categories
	idBotolTumbler        := NewID()
	idTasRamahLingkungan  := NewID()
	idAlatMakanEco        := NewID()
	idMakananOrganik      := NewID()
	idPertanianTanaman    := NewID()
	idSkincareAlami       := NewID()
	idSabunAlami          := NewID()
	idHaircareOrganik     := NewID()
	idPeralatanRumahEco   := NewID()
	idFurniturBambu       := NewID()
	idPakaianSustainable  := NewID()
	idAksesorisEco        := NewID()
	idPanelSurya          := NewID()
	idProdukHematEnergi   := NewID()

	categories := []databases.Category{
		{Base: databases.Base{ID: idDaurUlang,      CreatedAt: now, UpdatedAt: now}, Name: "Daur Ulang & Zero Waste",   Slug: "daur-ulang"},
		{Base: databases.Base{ID: idProdukOrganik,  CreatedAt: now, UpdatedAt: now}, Name: "Produk Organik",            Slug: "produk-organik"},
		{Base: databases.Base{ID: idPerawatanAlami, CreatedAt: now, UpdatedAt: now}, Name: "Perawatan Alami",           Slug: "perawatan-alami"},
		{Base: databases.Base{ID: idRumahEco,       CreatedAt: now, UpdatedAt: now}, Name: "Rumah Eco",                 Slug: "rumah-eco"},
		{Base: databases.Base{ID: idFashionSustain, CreatedAt: now, UpdatedAt: now}, Name: "Fashion Sustainable",       Slug: "fashion-sustainable"},
		{Base: databases.Base{ID: idTeknologiHijau, CreatedAt: now, UpdatedAt: now}, Name: "Teknologi Hijau",           Slug: "teknologi-hijau"},
		{Base: databases.Base{ID: idTamanBerkebun,  CreatedAt: now, UpdatedAt: now}, Name: "Taman & Berkebun",          Slug: "taman-berkebun"},
		{Base: databases.Base{ID: idBukuEdukasi,    CreatedAt: now, UpdatedAt: now}, Name: "Buku & Edukasi Eco",        Slug: "buku-edukasi"},
		{Base: databases.Base{ID: idBotolTumbler,       CreatedAt: now, UpdatedAt: now}, Name: "Botol & Tumbler Eco",        Slug: "botol-tumbler",         ParentID: Ptr(idDaurUlang)},
		{Base: databases.Base{ID: idTasRamahLingkungan, CreatedAt: now, UpdatedAt: now}, Name: "Tas Ramah Lingkungan",        Slug: "tas-ramah-lingkungan",  ParentID: Ptr(idDaurUlang)},
		{Base: databases.Base{ID: idAlatMakanEco,       CreatedAt: now, UpdatedAt: now}, Name: "Alat Makan Eco",              Slug: "alat-makan-eco",        ParentID: Ptr(idDaurUlang)},
		{Base: databases.Base{ID: idMakananOrganik,     CreatedAt: now, UpdatedAt: now}, Name: "Makanan & Minuman Organik",   Slug: "makanan-organik",       ParentID: Ptr(idProdukOrganik)},
		{Base: databases.Base{ID: idPertanianTanaman,   CreatedAt: now, UpdatedAt: now}, Name: "Pertanian & Tanaman",         Slug: "pertanian-tanaman",     ParentID: Ptr(idProdukOrganik)},
		{Base: databases.Base{ID: idSkincareAlami,      CreatedAt: now, UpdatedAt: now}, Name: "Skincare Alami",              Slug: "skincare-alami",        ParentID: Ptr(idPerawatanAlami)},
		{Base: databases.Base{ID: idSabunAlami,         CreatedAt: now, UpdatedAt: now}, Name: "Sabun & Pembersih Alami",     Slug: "sabun-alami",           ParentID: Ptr(idPerawatanAlami)},
		{Base: databases.Base{ID: idHaircareOrganik,    CreatedAt: now, UpdatedAt: now}, Name: "Haircare Organik",            Slug: "haircare-organik",      ParentID: Ptr(idPerawatanAlami)},
		{Base: databases.Base{ID: idPeralatanRumahEco,  CreatedAt: now, UpdatedAt: now}, Name: "Peralatan Rumah Eco",         Slug: "peralatan-rumah-eco",   ParentID: Ptr(idRumahEco)},
		{Base: databases.Base{ID: idFurniturBambu,      CreatedAt: now, UpdatedAt: now}, Name: "Furnitur & Bambu",            Slug: "furnitur-bambu",        ParentID: Ptr(idRumahEco)},
		{Base: databases.Base{ID: idPakaianSustainable, CreatedAt: now, UpdatedAt: now}, Name: "Pakaian Sustainable",         Slug: "pakaian-sustainable",   ParentID: Ptr(idFashionSustain)},
		{Base: databases.Base{ID: idAksesorisEco,       CreatedAt: now, UpdatedAt: now}, Name: "Aksesoris Eco",               Slug: "aksesoris-eco",         ParentID: Ptr(idFashionSustain)},
		{Base: databases.Base{ID: idPanelSurya,         CreatedAt: now, UpdatedAt: now}, Name: "Panel & Energi Surya",        Slug: "panel-surya",           ParentID: Ptr(idTeknologiHijau)},
		{Base: databases.Base{ID: idProdukHematEnergi,  CreatedAt: now, UpdatedAt: now}, Name: "Produk Hemat Energi",         Slug: "produk-hemat-energi",   ParentID: Ptr(idTeknologiHijau)},
	}

	ids := map[string]string{
		"daur-ulang":           idDaurUlang,
		"produk-organik":       idProdukOrganik,
		"perawatan-alami":      idPerawatanAlami,
		"rumah-eco":            idRumahEco,
		"fashion-sustainable":  idFashionSustain,
		"teknologi-hijau":      idTeknologiHijau,
		"taman-berkebun":       idTamanBerkebun,
		"buku-edukasi":         idBukuEdukasi,
		"botol-tumbler":        idBotolTumbler,
		"tas-ramah-lingkungan": idTasRamahLingkungan,
		"alat-makan-eco":       idAlatMakanEco,
		"makanan-organik":      idMakananOrganik,
		"pertanian-tanaman":    idPertanianTanaman,
		"skincare-alami":       idSkincareAlami,
		"sabun-alami":          idSabunAlami,
		"haircare-organik":     idHaircareOrganik,
		"peralatan-rumah-eco":  idPeralatanRumahEco,
		"furnitur-bambu":       idFurniturBambu,
		"pakaian-sustainable":  idPakaianSustainable,
		"aksesoris-eco":        idAksesorisEco,
		"panel-surya":          idPanelSurya,
		"produk-hemat-energi":  idProdukHematEnergi,
	}

	docs := make([]interface{}, len(categories))
	for i, c := range categories {
		docs[i] = c
	}
	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Categories insert: %v", err)
	}

	log.Printf("✅ Categories seeded (%d)", len(categories))
	return ids
}
