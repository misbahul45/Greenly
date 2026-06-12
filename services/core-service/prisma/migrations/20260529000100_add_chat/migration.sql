CREATE TABLE `chat_conversations` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'ASSISTANT',
  `title` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_participants` (
  `id` VARCHAR(191) NOT NULL,
  `conversationId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
  `id` VARCHAR(191) NOT NULL,
  `conversationId` VARCHAR(191) NOT NULL,
  `senderId` VARCHAR(191) NULL,
  `senderType` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `chat_participants_conversationId_userId_key` ON `chat_participants`(`conversationId`, `userId`);
CREATE INDEX `chat_participants_userId_idx` ON `chat_participants`(`userId`);
CREATE INDEX `chat_messages_conversationId_idx` ON `chat_messages`(`conversationId`);
CREATE INDEX `chat_messages_senderId_idx` ON `chat_messages`(`senderId`);
ALTER TABLE `chat_participants` ADD CONSTRAINT `chat_participants_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `chat_participants` ADD CONSTRAINT `chat_participants_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
