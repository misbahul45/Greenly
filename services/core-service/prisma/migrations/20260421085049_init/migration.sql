/*
  Warnings:

  - Added the required column `name` to the `promotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `promotions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `promotionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `promotions` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `maxDiscountAmount` DECIMAL(15, 2) NULL,
    ADD COLUMN `minPurchaseAmount` DECIMAL(15, 2) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `usageLimit` INTEGER NULL,
    ADD COLUMN `usedCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `userLimit` INTEGER NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `promotion_shops` (
    `id` VARCHAR(191) NOT NULL,
    `promotionId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `promotion_shops_promotionId_shopId_key`(`promotionId`, `shopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_products` (
    `id` VARCHAR(191) NOT NULL,
    `promotionId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `promotion_products_promotionId_productId_key`(`promotionId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `promotions_code_isActive_idx` ON `promotions`(`code`, `isActive`);

-- CreateIndex
CREATE INDEX `promotions_startDate_endDate_idx` ON `promotions`(`startDate`, `endDate`);

-- CreateIndex
CREATE INDEX `promotions_deletedAt_idx` ON `promotions`(`deletedAt`);

-- CreateIndex
CREATE INDEX `shops_deletedAt_idx` ON `shops`(`deletedAt`);

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_shops` ADD CONSTRAINT `promotion_shops_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_shops` ADD CONSTRAINT `promotion_shops_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `shops`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_products` ADD CONSTRAINT `promotion_products_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
