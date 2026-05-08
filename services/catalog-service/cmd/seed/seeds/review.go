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
		{5, "Produk sangat bagus!", "Kualitas melebihi ekspektasi, pengiriman cepat dan packaging aman."},
		{5, "Recommended banget!", "Sudah beli kedua kalinya, kualitas konsisten dan seller responsif."},
		{4, "Bagus, sesuai deskripsi", "Produk sesuai foto dan deskripsi. Pengiriman agak lama tapi oke."},
		{5, "Mantap jiwa!", "Kualitas premium, worth it banget sama harganya. Pasti beli lagi."},
		{4, "Puas dengan pembelian ini", "Produk original, kondisi mulus. Seller fast response."},
		{3, "Lumayan, tapi ada kekurangan", "Produk oke tapi packaging kurang rapi. Kualitas masih bisa diterima."},
		{5, "Luar biasa!", "Produk terbaik yang pernah saya beli di kategori ini. Sangat puas!"},
		{4, "Sesuai ekspektasi", "Kualitas bagus, harga terjangkau. Akan beli lagi kalau butuh."},
		{5, "Top seller!", "Seller terpercaya, produk asli, pengiriman kilat. 5 bintang!"},
		{4, "Produk berkualitas", "Material bagus, finishing rapi. Sedikit lebih mahal tapi worth it."},
		{5, "Sangat memuaskan", "Produk persis seperti foto, kualitas premium. Seller ramah dan fast respon."},
		{3, "Cukup baik", "Produk standar, tidak ada yang istimewa tapi juga tidak mengecewakan."},
		{5, "Beli lagi pasti!", "Sudah pakai 2 minggu, kualitas tetap bagus. Sangat direkomendasikan!"},
		{4, "Oke banget", "Produk sesuai deskripsi, pengiriman aman. Puas dengan pembelian ini."},
		{5, "Keren abis!", "Desain bagus, kualitas premium, harga reasonable. Seller terbaik!"},
		{4, "Recommended", "Produk original dan berkualitas. Pengiriman cepat dan aman."},
		{5, "Terbaik!", "Tidak menyesal beli di sini. Produk asli, kualitas terjamin."},
		{4, "Bagus dan tahan lama", "Sudah pakai sebulan, masih bagus. Kualitas sesuai harga."},
		{5, "Puas banget!", "Produk premium dengan harga yang masuk akal. Seller profesional."},
		{3, "Biasa saja", "Produk oke, tidak ada yang spesial. Pengiriman standar."},
		{5, "Wajib beli!", "Kualitas terbaik di kelasnya. Sudah rekomendasikan ke teman-teman."},
		{4, "Memuaskan", "Produk sesuai ekspektasi, seller responsif dan pengiriman cepat."},
		{5, "Luar biasa kualitasnya", "Material premium, detail rapi, packaging mewah. Sangat puas!"},
		{4, "Bagus", "Produk berkualitas dengan harga yang wajar. Akan repeat order."},
		{5, "Sempurna!", "Tidak ada yang perlu dikomplain. Produk, seller, dan pengiriman semua top!"},
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
		"Terima kasih atas ulasan positifnya! Senang bisa melayani Anda dengan baik.",
		"Terima kasih sudah berbelanja di toko kami. Semoga produknya bermanfaat!",
		"Maaf atas ketidaknyamanannya. Kami akan terus meningkatkan layanan kami.",
		"Terima kasih reviewnya! Jangan lupa follow toko kami untuk promo terbaru.",
		"Senang mendengar Anda puas! Kami siap melayani pembelian berikutnya.",
		"Terima kasih banyak! Kepuasan pelanggan adalah prioritas utama kami.",
		"Terima kasih sudah mempercayai toko kami. Sampai jumpa di pembelian berikutnya!",
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
