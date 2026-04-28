-- DropForeignKey
ALTER TABLE `promotion_products` DROP FOREIGN KEY `promotion_products_promotionId_fkey`;

-- DropForeignKey
ALTER TABLE `promotion_shops` DROP FOREIGN KEY `promotion_shops_promotionId_fkey`;

-- DropForeignKey
ALTER TABLE `promotion_shops` DROP FOREIGN KEY `promotion_shops_shopId_fkey`;

-- CreateTable
CREATE TABLE `banners` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `promotionId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `position` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `type` ENUM('HOME', 'PROMO', 'EVENT') NOT NULL DEFAULT 'HOME',

    INDEX `banners_isActive_idx`(`isActive`),
    INDEX `banners_position_idx`(`position`),
    INDEX `banners_promotionId_idx`(`promotionId`),
    INDEX `banners_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `promotion_products_productId_idx` ON `promotion_products`(`productId`);

-- AddForeignKey
ALTER TABLE `banners` ADD CONSTRAINT `banners_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_shops` ADD CONSTRAINT `promotion_shops_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_shops` ADD CONSTRAINT `promotion_shops_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `shops`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_products` ADD CONSTRAINT `promotion_products_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `promotion_shops` RENAME INDEX `promotion_shops_shopId_fkey` TO `promotion_shops_shopId_idx`;
