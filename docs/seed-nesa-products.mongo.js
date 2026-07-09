// Seed produk seller Nesa untuk MongoDB catalog.
// Jalankan di database catalog MongoDB Atlas yang dipakai service catalog.
//
// Contoh:
// mongosh "<MONGODB_ATLAS_URI>/<DATABASE_NAME>" docs/seed-nesa-products.mongo.js
//
// Catatan:
// - shop_id harus sama dengan shop id di docs/seed-nesa-menu.sql, yaitu "shop-nesa".
// - Script ini aman dijalankan ulang karena memakai updateOne(..., { upsert: true }).

const now = new Date();
const shopId = "shop-nesa";
const categoryId = "cat-nesa-organik";

db.categories.updateOne(
  { _id: categoryId },
  {
    $set: {
      name: "Produk Organik",
      slug: "produk-organik",
      parent_id: null,
      deleted_at: null,
      updated_at: now,
    },
    $setOnInsert: {
      _id: categoryId,
      created_at: now,
    },
  },
  { upsert: true },
);

const products = [
  {
    _id: "catalog-product-sayur",
    name: "Paket Sayur Organik",
    slug: "paket-sayur-organik",
    description: "Paket sayur segar pilihan untuk kebutuhan harian.",
    sku: "NESA-SAYUR-001",
    amount: 45000,
    stock: 32,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900",
  },
  {
    _id: "catalog-product-madu",
    name: "Madu Hutan Murni",
    slug: "madu-hutan-murni",
    description: "Madu hutan murni tanpa campuran gula.",
    sku: "NESA-MADU-001",
    amount: 95000,
    stock: 12,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=900",
  },
  {
    _id: "catalog-product-beras",
    name: "Beras Merah Premium",
    slug: "beras-merah-premium",
    description: "Beras merah premium dari petani lokal.",
    sku: "NESA-BERAS-001",
    amount: 48000,
    stock: 24,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900",
  },
  {
    _id: "catalog-product-kompos",
    name: "Kompos Organik 10kg",
    slug: "kompos-organik-10kg",
    description: "Kompos organik untuk tanaman rumah dan kebun.",
    sku: "NESA-KOMPOS-001",
    amount: 49000,
    stock: 20,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900",
  },
  {
    _id: "catalog-product-teh",
    name: "Teh Herbal Organik",
    slug: "teh-herbal-organik",
    description: "Teh herbal organik dengan aroma ringan.",
    sku: "NESA-TEH-001",
    amount: 33000,
    stock: 40,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=900",
  },
];

for (const product of products) {
  const priceId = `price-${product._id}`;
  const inventoryId = `inventory-${product._id}`;
  const imageId = `image-${product._id}`;

  db.products.updateOne(
    { _id: product._id },
    {
      $set: {
        shop_id: shopId,
        category_id: categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        sku: product.sku,
        favorite_count: 0,
        review_count: 0,
        rating_average: 4.8,
        is_active: true,
        inventory_id: inventoryId,
        price_id: priceId,
        image_ids: [imageId],
        discount_ids: [],
        deleted_at: null,
        updated_at: now,
      },
      $setOnInsert: {
        _id: product._id,
        created_at: now,
      },
    },
    { upsert: true },
  );

  db.prices.updateOne(
    { _id: priceId },
    {
      $set: {
        product_id: product._id,
        amount: product.amount,
        currency: "IDR",
        deleted_at: null,
        updated_at: now,
      },
      $setOnInsert: {
        _id: priceId,
        created_at: now,
      },
    },
    { upsert: true },
  );

  db.inventories.updateOne(
    { _id: inventoryId },
    {
      $set: {
        product_id: product._id,
        stock: product.stock,
        reserved_stock: 0,
        location: "Gudang Toko Nesa",
        deleted_at: null,
        updated_at: now,
      },
      $setOnInsert: {
        _id: inventoryId,
        created_at: now,
      },
    },
    { upsert: true },
  );

  db.product_images.updateOne(
    { _id: imageId },
    {
      $set: {
        product_id: product._id,
        product_key: product.slug,
        url: product.image,
        is_primary: true,
        order: 1,
        deleted_at: null,
        updated_at: now,
      },
      $setOnInsert: {
        _id: imageId,
        created_at: now,
      },
    },
    { upsert: true },
  );
}

print("Seed produk Nesa selesai");
printjson(db.products.find({ shop_id: shopId, deleted_at: null }).toArray());
