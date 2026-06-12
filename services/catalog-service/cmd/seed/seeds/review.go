package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedProductReviews(ctx context.Context, db *mongo.Database, productIDs []string, shopIDs []string, userIDs []string) []string {
	col := db.Collection("product_reviews")
	now := time.Now()

	type reviewDef struct {
		rating  int
		title   string
		comment string
	}

	reviewData := []reviewDef{
		{5, "Produk eco terbaik!", "Sangat suka dengan produk ini! Kualitas bagus dan ramah lingkungan. Packaging zero waste. Benar-benar berkontribusi untuk bumi. Highly recommended!"},
		{5, "Pilihan terbaik untuk bumi!", "Bangga bisa berkontribusi untuk lingkungan dengan produk bersertifikat ini. Kualitas melebihi ekspektasi, dan seller sangat responsif."},
		{4, "Bagus dan eco-friendly", "Produk sesuai deskripsi, bahan alami certified. Packaging juga minimal dan ramah lingkungan. Pengiriman cepat dan aman."},
		{5, "Zero waste impact beneran!", "Beralih ke produk ini adalah keputusan terbaik. Kualitas premium certified eco-friendly, tidak kalah dari produk konvensional."},
		{4, "Puas dengan pilihan hijau ini", "Produk ramah lingkungan dengan kualitas tidak kalah dari produk biasa. Seller responsif dan sangat informatif soal bahan."},
		{3, "Bagus tapi ada kekurangan minor", "Produk oke dan ramah lingkungan, tapi packaging bisa lebih rapi. Kualitas bahan masih sangat baik dan natural."},
		{5, "Luar biasa, eco-friendly banget!", "Produk terbaik untuk gaya hidup berkelanjutan. Tidak ada bahan sintetis sama sekali. Sangat puas dan akan beli lagi!"},
		{4, "Sustainable dan berkualitas tinggi", "Kualitas bagus, harga terjangkau untuk produk certified organik. Akan repeat order untuk mendukung eco lifestyle."},
		{5, "Certified organic terpercaya!", "Seller terpercaya dengan produk organik asli bersertifikat. Packaging biodegradable. Tidak ada yang bisa dikomplain. 5 bintang!"},
		{4, "Bahan alami premium berkualitas", "Material alami berkualitas tinggi dan ramah lingkungan. Sedikit lebih mahal tapi worthit untuk kesehatan dan bumi."},
		{5, "Sangat memuaskan, 100% alami", "Produk persis seperti foto, kualitas premium dari bahan alami certified. Seller ramah, fast respon, dan packaging eco."},
		{3, "Cukup baik untuk eco-living", "Produk standar eco, tidak ada yang super spesial tapi tidak mengecewakan. Bagus untuk pilihan gaya hidup hijau."},
		{5, "Beli lagi pasti! Zero waste life!", "Sudah pakai sebulan, kualitas tetap bagus dan terjaga. Sangat direkomendasikan untuk siapa pun yang ingin eco lifestyle!"},
		{4, "Oke banget, ramah lingkungan", "Produk sesuai deskripsi eco-friendly, dikemas dengan paper packaging. Puas dengan pembelian hijau ini."},
		{5, "Keren, dukung sustainable living!", "Desain bagus, kualitas premium, bahan alami bersertifikat. Seller terbaik untuk produk eco di platform ini!"},
		{4, "Produk organik recommended!", "Produk organik asli bersertifikat dan berkualitas. Pengiriman cepat dengan packaging eco-friendly minimal."},
		{5, "Terbaik untuk bumi dan kesehatan!", "Tidak menyesal sama sekali. Produk asli organik, kualitas terjamin, dan sertifikasi lengkap. Lanjutkan terus!"},
		{4, "Bagus dan sangat tahan lama", "Sudah pakai sebulan lebih, masih bagus. Kualitas bahan alami organik sesuai harga yang dibayarkan."},
		{5, "Puas banget! Organik murni genuine!", "Produk organik murni premium dengan harga yang masuk akal. Seller profesional, informatif, dan ramah."},
		{3, "Biasa saja tapi eco-friendly", "Produk oke dan certified eco, tidak ada yang spesial. Pengiriman standar. Cukup untuk pilihan hijau."},
		{5, "Wajib beli untuk eco lifestyle!", "Kualitas terbaik di kelasnya untuk produk berkelanjutan. Sudah saya rekomendasikan ke semua keluarga dan teman!"},
		{4, "Memuaskan, sustainable certified", "Produk sesuai ekspektasi eco-certified, seller responsif dan pengiriman cepat dengan packaging paper."},
		{5, "Luar biasa kualitas organiknya!", "Material premium organik bersertifikat, detail rapi, packaging eco-friendly. Salah satu pembelian terbaik!"},
		{4, "Bagus, eco certified real deal", "Produk berkualitas eco dengan harga wajar. Akan repeat order untuk terus dukung gaya hidup berkelanjutan."},
		{5, "Sempurna! Eco, premium, terpercaya!", "Tidak ada yang perlu dikomplain. Produk, seller, dan pengiriman semua top dengan komitmen eco-friendly!"},
	}

	docs := make([]interface{}, 0)
	reviewIDs := make([]string, 0)

	for i, productID := range productIDs {
		numReviews := 3 + (i % 4)
		for j := 0; j < numReviews; j++ {
			rd := reviewData[(i*3+j)%len(reviewData)]
			uIdx := (i + j) % len(userIDs)
			id := NewID()
			reviewIDs = append(reviewIDs, id)
			docs = append(docs, map[string]interface{}{
				"_id":           id,
				"product_id":    productID,
				"user_id":       userIDs[uIdx],
				"rating":        rd.rating,
				"title":         rd.title,
				"comment":       rd.comment,
				"is_verified":   j%3 != 0,
				"helpful_count": j * 2,
				"created_at":    now.Add(-time.Duration(j*24) * time.Hour),
				"updated_at":    now.Add(-time.Duration(j*24) * time.Hour),
				"deleted_at":    nil,
			})
		}
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product reviews insert: %v", err)
	}
	log.Printf("✅ Product reviews seeded (%d)", len(docs))
	return reviewIDs
}

func SeedReviewReplies(ctx context.Context, db *mongo.Database, reviewIDs []string, shopIDs []string) {
	col := db.Collection("review_replies")
	now := time.Now()

	replies := []string{
		"Terima kasih atas ulasan positifnya! Kami berkomitmen untuk terus menghadirkan produk eco-friendly terbaik.",
		"Terima kasih sudah berbelanja di toko kami dan mendukung gaya hidup berkelanjutan!",
		"Maaf atas ketidaknyamanannya. Kami akan terus meningkatkan kualitas dan layanan eco kami.",
		"Terima kasih reviewnya! Setiap pembelian Anda membantu mengurangi jejak karbon bumi kita.",
		"Senang mendengar Anda puas! Bersama-sama kita bisa membuat perubahan positif untuk lingkungan.",
		"Terima kasih banyak! Kepuasan pelanggan sambil menjaga bumi adalah prioritas utama kami.",
		"Terima kasih sudah mempercayai produk eco kami. Sampai jumpa di pembelian eco berikutnya!",
	}

	docs := make([]interface{}, 0)
	for i, reviewID := range reviewIDs {
		if i%2 == 0 {
			sIdx := i % len(shopIDs)
			docs = append(docs, map[string]interface{}{
				"_id":        NewID(),
				"review_id":  reviewID,
				"shop_id":    shopIDs[sIdx],
				"message":    replies[i%len(replies)],
				"created_at": now,
				"updated_at": now,
				"deleted_at": nil,
			})
		}
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Review replies insert: %v", err)
	}
	log.Printf("✅ Review replies seeded (%d)", len(docs))
}
