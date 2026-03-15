-- AlterTable
ALTER TABLE `shops` ADD COLUMN `followerCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `followingCount` INTEGER NOT NULL DEFAULT 0;
