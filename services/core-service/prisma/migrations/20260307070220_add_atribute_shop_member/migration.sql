-- AlterTable
ALTER TABLE `shop_members` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `shops` ADD COLUMN `deletedAt` DATETIME(3) NULL;
