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

	idElektronik    := NewID()
	idFashion       := NewID()
	idKuliner       := NewID()
	idOlahraga      := NewID()
	idKecantikan    := NewID()
	idRumahTangga   := NewID()
	idOtomotif      := NewID()
	idPendidikan    := NewID()
	idHpTablet      := NewID()
	idLaptop        := NewID()
	idAudio         := NewID()
	idKamera        := NewID()
	idPakaianWanita := NewID()
	idPakaianPria   := NewID()
	idAksesoris     := NewID()
	idSepatuWanita  := NewID()
	idSepaturPria   := NewID()
	idSkincare      := NewID()
	idMakeup        := NewID()
	idHaircare      := NewID()
	idSuplemen      := NewID()
	idFitness       := NewID()

	categories := []databases.Category{
		{Base: databases.Base{ID: idElektronik, CreatedAt: now, UpdatedAt: now}, Name: "Elektronik", Slug: "elektronik"},
		{Base: databases.Base{ID: idFashion, CreatedAt: now, UpdatedAt: now}, Name: "Fashion", Slug: "fashion"},
		{Base: databases.Base{ID: idKuliner, CreatedAt: now, UpdatedAt: now}, Name: "Kuliner", Slug: "kuliner"},
		{Base: databases.Base{ID: idOlahraga, CreatedAt: now, UpdatedAt: now}, Name: "Olahraga", Slug: "olahraga"},
		{Base: databases.Base{ID: idKecantikan, CreatedAt: now, UpdatedAt: now}, Name: "Kecantikan", Slug: "kecantikan"},
		{Base: databases.Base{ID: idRumahTangga, CreatedAt: now, UpdatedAt: now}, Name: "Rumah Tangga", Slug: "rumah-tangga"},
		{Base: databases.Base{ID: idOtomotif, CreatedAt: now, UpdatedAt: now}, Name: "Otomotif", Slug: "otomotif"},
		{Base: databases.Base{ID: idPendidikan, CreatedAt: now, UpdatedAt: now}, Name: "Pendidikan", Slug: "pendidikan"},
		{Base: databases.Base{ID: idHpTablet, CreatedAt: now, UpdatedAt: now}, Name: "HP & Tablet", Slug: "hp-tablet", ParentID: Ptr(idElektronik)},
		{Base: databases.Base{ID: idLaptop, CreatedAt: now, UpdatedAt: now}, Name: "Laptop & Komputer", Slug: "laptop-komputer", ParentID: Ptr(idElektronik)},
		{Base: databases.Base{ID: idAudio, CreatedAt: now, UpdatedAt: now}, Name: "Audio & Headphone", Slug: "audio-headphone", ParentID: Ptr(idElektronik)},
		{Base: databases.Base{ID: idKamera, CreatedAt: now, UpdatedAt: now}, Name: "Kamera & Foto", Slug: "kamera-foto", ParentID: Ptr(idElektronik)},
		{Base: databases.Base{ID: idPakaianWanita, CreatedAt: now, UpdatedAt: now}, Name: "Pakaian Wanita", Slug: "pakaian-wanita", ParentID: Ptr(idFashion)},
		{Base: databases.Base{ID: idPakaianPria, CreatedAt: now, UpdatedAt: now}, Name: "Pakaian Pria", Slug: "pakaian-pria", ParentID: Ptr(idFashion)},
		{Base: databases.Base{ID: idAksesoris, CreatedAt: now, UpdatedAt: now}, Name: "Aksesoris Fashion", Slug: "aksesoris-fashion", ParentID: Ptr(idFashion)},
		{Base: databases.Base{ID: idSepatuWanita, CreatedAt: now, UpdatedAt: now}, Name: "Sepatu Wanita", Slug: "sepatu-wanita", ParentID: Ptr(idFashion)},
		{Base: databases.Base{ID: idSepaturPria, CreatedAt: now, UpdatedAt: now}, Name: "Sepatu Pria", Slug: "sepatu-pria", ParentID: Ptr(idFashion)},
		{Base: databases.Base{ID: idSkincare, CreatedAt: now, UpdatedAt: now}, Name: "Skincare", Slug: "skincare", ParentID: Ptr(idKecantikan)},
		{Base: databases.Base{ID: idMakeup, CreatedAt: now, UpdatedAt: now}, Name: "Makeup", Slug: "makeup", ParentID: Ptr(idKecantikan)},
		{Base: databases.Base{ID: idHaircare, CreatedAt: now, UpdatedAt: now}, Name: "Haircare", Slug: "haircare", ParentID: Ptr(idKecantikan)},
		{Base: databases.Base{ID: idSuplemen, CreatedAt: now, UpdatedAt: now}, Name: "Suplemen & Vitamin", Slug: "suplemen-vitamin", ParentID: Ptr(idOlahraga)},
		{Base: databases.Base{ID: idFitness, CreatedAt: now, UpdatedAt: now}, Name: "Alat Fitness", Slug: "alat-fitness", ParentID: Ptr(idOlahraga)},
	}

	ids := map[string]string{
		"elektronik":      idElektronik,
		"fashion":         idFashion,
		"kuliner":         idKuliner,
		"olahraga":        idOlahraga,
		"kecantikan":      idKecantikan,
		"rumah-tangga":    idRumahTangga,
		"otomotif":        idOtomotif,
		"pendidikan":      idPendidikan,
		"hp-tablet":       idHpTablet,
		"laptop-komputer": idLaptop,
		"audio-headphone": idAudio,
		"kamera-foto":     idKamera,
		"pakaian-wanita":  idPakaianWanita,
		"pakaian-pria":    idPakaianPria,
		"aksesoris-fashion": idAksesoris,
		"sepatu-wanita":   idSepatuWanita,
		"sepatu-pria":     idSepaturPria,
		"skincare":        idSkincare,
		"makeup":          idMakeup,
		"haircare":        idHaircare,
		"suplemen-vitamin": idSuplemen,
		"alat-fitness":    idFitness,
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
