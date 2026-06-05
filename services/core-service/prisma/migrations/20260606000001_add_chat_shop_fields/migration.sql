ALTER TABLE `chat_conversations`
  ADD COLUMN `shopId` VARCHAR(191) NULL,
  ADD COLUMN `buyerId` VARCHAR(191) NULL,
  ADD COLUMN `metadata` JSON NULL;

CREATE INDEX `chat_conversations_shopId_idx` ON `chat_conversations`(`shopId`);
CREATE INDEX `chat_conversations_buyerId_idx` ON `chat_conversations`(`buyerId`);
