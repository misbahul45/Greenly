-- Seed data menu seller Nesa untuk database core Greenly.
-- Jalankan file ini di database core hosting/TiDB/MySQL, bukan di DB lokal kalau targetnya production.
--
-- Contoh:
-- mysql -h <HOST_DB_HOSTING> -P <PORT> -u <USER> -p <DATABASE_NAME> < docs/seed-nesa-menu.sql
--
-- Data yang dibuat:
-- - User Nesa jika belum ada
-- - Role SELLER/ADMIN untuk Nesa supaya endpoint seller bisa dipakai
-- - Toko Nesa berstatus APPROVED
-- - Shop application APPROVED
-- - Shop member OWNER
-- - Pesanan, item pesanan, payment sukses
-- - Ledger dan saldo toko

SET @nesa_user_id = 'user-nesa';
SET @customer_user_id = 'user-customer-budi';
SET @shop_id = 'shop-nesa';

INSERT INTO roles (id, name)
VALUES
  ('role-admin', 'ADMIN'),
  ('role-seller', 'SELLER'),
  ('role-customer', 'CUSTOMER'),
  ('role-super-admin', 'SUPER_ADMIN')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (
  id,
  email,
  passwordHash,
  emailVerified,
  status,
  isActive,
  createdAt,
  updatedAt
)
VALUES
  (
    @nesa_user_id,
    'nesa@gmail.com',
    '$2y$10$O7zC3Ux1DtP2oH7P2XUnuONt.qeJUSKAhbjftpgLjs6aDPjAJHR46',
    NOW(3),
    'ACTIVE',
    TRUE,
    NOW(3),
    NOW(3)
  ),
  (
    @customer_user_id,
    'budi.customer@gmail.com',
    '$2y$10$O7zC3Ux1DtP2oH7P2XUnuONt.qeJUSKAhbjftpgLjs6aDPjAJHR46',
    NOW(3),
    'ACTIVE',
    TRUE,
    NOW(3),
    NOW(3)
  )
ON DUPLICATE KEY UPDATE
  status = 'ACTIVE',
  isActive = TRUE,
  emailVerified = COALESCE(emailVerified, VALUES(emailVerified)),
  updatedAt = NOW(3);

SELECT id INTO @nesa_user_id FROM users WHERE email = 'nesa@gmail.com' LIMIT 1;
SELECT id INTO @customer_user_id FROM users WHERE email = 'budi.customer@gmail.com' LIMIT 1;

INSERT INTO user_profiles (
  id,
  userId,
  fullName,
  phone,
  address
)
VALUES
  ('profile-nesa', @nesa_user_id, 'Nesa', '081234567890', 'Bandung'),
  ('profile-customer-budi', @customer_user_id, 'Budi Santoso', '081200001111', 'Jakarta')
ON DUPLICATE KEY UPDATE
  fullName = VALUES(fullName),
  phone = VALUES(phone),
  address = VALUES(address);

INSERT INTO user_roles (userId, roleId)
SELECT @nesa_user_id, id FROM roles WHERE name IN ('SELLER', 'ADMIN')
ON DUPLICATE KEY UPDATE roleId = VALUES(roleId);

INSERT INTO user_roles (userId, roleId)
SELECT @customer_user_id, id FROM roles WHERE name = 'CUSTOMER'
ON DUPLICATE KEY UPDATE roleId = VALUES(roleId);

INSERT INTO carts (id, userId, updatedAt)
VALUES
  ('cart-nesa', @nesa_user_id, NOW(3)),
  ('cart-budi', @customer_user_id, NOW(3))
ON DUPLICATE KEY UPDATE updatedAt = NOW(3);

INSERT INTO shops (
  id,
  ownerId,
  name,
  description,
  status,
  balance,
  followerCount,
  createdAt,
  updatedAt,
  deletedAt
)
VALUES (
  @shop_id,
  @nesa_user_id,
  'Toko Nesa',
  'Toko produk organik dan kebutuhan ramah lingkungan.',
  'APPROVED',
  273500.00,
  18,
  NOW(3),
  NOW(3),
  NULL
)
ON DUPLICATE KEY UPDATE
  ownerId = VALUES(ownerId),
  name = VALUES(name),
  description = VALUES(description),
  status = 'APPROVED',
  balance = VALUES(balance),
  followerCount = VALUES(followerCount),
  deletedAt = NULL,
  updatedAt = NOW(3);

INSERT INTO shop_applications (
  id,
  shopId,
  idCardUrl,
  selfieUrl,
  nib,
  npwp,
  siupUrl,
  bankName,
  bankAccount,
  accountName,
  status,
  notes,
  createdAt,
  reviewedAt,
  updatedAt
)
VALUES (
  'application-nesa',
  @shop_id,
  'https://example.com/ktp-nesa.jpg',
  'https://example.com/selfie-nesa.jpg',
  'NIB-NESA-001',
  'NPWP-NESA-001',
  'https://example.com/siup-nesa.pdf',
  'BCA',
  '1234567890',
  'Nesa',
  'APPROVED',
  'Seed approved untuk data seller Nesa',
  NOW(3),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  status = 'APPROVED',
  notes = VALUES(notes),
  reviewedAt = VALUES(reviewedAt),
  bankName = VALUES(bankName),
  bankAccount = VALUES(bankAccount),
  accountName = VALUES(accountName),
  updatedAt = NOW(3);

INSERT INTO shop_members (
  id,
  shopId,
  userId,
  role,
  deletedAt,
  createdAt
)
VALUES (
  'member-nesa-owner',
  @shop_id,
  @nesa_user_id,
  'OWNER',
  NULL,
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  role = 'OWNER',
  deletedAt = NULL;

INSERT INTO orders (
  id,
  userId,
  shopId,
  shopName,
  totalAmount,
  status,
  promotionId,
  discountAmount,
  createdAt
)
VALUES
  ('order-nesa-1001', @customer_user_id, @shop_id, 'Toko Nesa', 185000.00, 'PAID', NULL, 0.00, NOW(3)),
  ('order-nesa-1002', @customer_user_id, @shop_id, 'Toko Nesa', 96000.00, 'PROCESSING', NULL, 0.00, DATE_SUB(NOW(3), INTERVAL 1 DAY)),
  ('order-nesa-1003', @customer_user_id, @shop_id, 'Toko Nesa', 245000.00, 'SHIPPED', NULL, 0.00, DATE_SUB(NOW(3), INTERVAL 2 DAY)),
  ('order-nesa-1004', @customer_user_id, @shop_id, 'Toko Nesa', 132000.00, 'COMPLETED', NULL, 0.00, DATE_SUB(NOW(3), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE
  userId = VALUES(userId),
  shopId = VALUES(shopId),
  shopName = VALUES(shopName),
  totalAmount = VALUES(totalAmount),
  status = VALUES(status),
  discountAmount = VALUES(discountAmount);

INSERT INTO order_items (
  id,
  orderId,
  productId,
  productName,
  price,
  quantity,
  createdAt
)
VALUES
  ('item-nesa-1001-1', 'order-nesa-1001', 'catalog-product-sayur', 'Paket Sayur Organik', 45000.00, 2, NOW(3)),
  ('item-nesa-1001-2', 'order-nesa-1001', 'catalog-product-madu', 'Madu Hutan Murni', 95000.00, 1, NOW(3)),
  ('item-nesa-1002-1', 'order-nesa-1002', 'catalog-product-beras', 'Beras Merah Premium', 48000.00, 2, DATE_SUB(NOW(3), INTERVAL 1 DAY)),
  ('item-nesa-1003-1', 'order-nesa-1003', 'catalog-product-kompos', 'Kompos Organik 10kg', 49000.00, 5, DATE_SUB(NOW(3), INTERVAL 2 DAY)),
  ('item-nesa-1004-1', 'order-nesa-1004', 'catalog-product-teh', 'Teh Herbal Organik', 33000.00, 4, DATE_SUB(NOW(3), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE
  productName = VALUES(productName),
  price = VALUES(price),
  quantity = VALUES(quantity);

INSERT INTO payments (
  id,
  orderId,
  grossAmount,
  gatewayFee,
  marketplaceFee,
  netAmount,
  method,
  status,
  transactionId,
  createdAt,
  paidAt,
  updatedAt
)
VALUES
  ('payment-nesa-1001', 'order-nesa-1001', 185000.00, 2500.00, 9250.00, 173250.00, 'BANK_TRANSFER', 'SUCCESS', 'TRX-NESA-1001', NOW(3), NOW(3), NOW(3)),
  ('payment-nesa-1002', 'order-nesa-1002', 96000.00, 2500.00, 4800.00, 88700.00, 'EWALLET', 'SUCCESS', 'TRX-NESA-1002', DATE_SUB(NOW(3), INTERVAL 1 DAY), DATE_SUB(NOW(3), INTERVAL 1 DAY), NOW(3)),
  ('payment-nesa-1003', 'order-nesa-1003', 245000.00, 2500.00, 12250.00, 230250.00, 'BANK_TRANSFER', 'SUCCESS', 'TRX-NESA-1003', DATE_SUB(NOW(3), INTERVAL 2 DAY), DATE_SUB(NOW(3), INTERVAL 2 DAY), NOW(3)),
  ('payment-nesa-1004', 'order-nesa-1004', 132000.00, 2500.00, 6600.00, 122900.00, 'EWALLET', 'SUCCESS', 'TRX-NESA-1004', DATE_SUB(NOW(3), INTERVAL 3 DAY), DATE_SUB(NOW(3), INTERVAL 3 DAY), NOW(3))
ON DUPLICATE KEY UPDATE
  grossAmount = VALUES(grossAmount),
  gatewayFee = VALUES(gatewayFee),
  marketplaceFee = VALUES(marketplaceFee),
  netAmount = VALUES(netAmount),
  status = VALUES(status),
  paidAt = VALUES(paidAt),
  updatedAt = NOW(3);

INSERT INTO shop_ledgers (
  id,
  shopId,
  type,
  amount,
  reference,
  description,
  createdAt
)
VALUES
  ('ledger-nesa-1001', @shop_id, 'CREDIT', 173250.00, 'order_completed:order-nesa-1001', 'Pendapatan pesanan order-nesa-1001', NOW(3)),
  ('ledger-nesa-1002', @shop_id, 'CREDIT', 88700.00, 'payment_success:order-nesa-1002', 'Pendapatan pesanan order-nesa-1002', DATE_SUB(NOW(3), INTERVAL 1 DAY)),
  ('ledger-nesa-fee-1002', @shop_id, 'DEBIT', 7500.00, 'platform_fee:order-nesa-1002', 'Biaya layanan platform', DATE_SUB(NOW(3), INTERVAL 1 DAY)),
  ('ledger-nesa-1003', @shop_id, 'CREDIT', 230250.00, 'payment_success:order-nesa-1003', 'Pendapatan pesanan order-nesa-1003', DATE_SUB(NOW(3), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE
  amount = VALUES(amount),
  type = VALUES(type),
  description = VALUES(description),
  createdAt = VALUES(createdAt);

UPDATE shops
SET balance = (
  SELECT COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END), 0)
  FROM shop_ledgers
  WHERE shopId = @shop_id
)
WHERE id = @shop_id;

SELECT 'Seed Nesa selesai' AS message;
SELECT id, email, status FROM users WHERE id IN (@nesa_user_id, @customer_user_id);
SELECT id, name, status, balance FROM shops WHERE id = @shop_id;
SELECT id, status, totalAmount FROM orders WHERE shopId = @shop_id ORDER BY createdAt DESC;
SELECT id, type, amount, reference FROM shop_ledgers WHERE shopId = @shop_id ORDER BY createdAt DESC;
