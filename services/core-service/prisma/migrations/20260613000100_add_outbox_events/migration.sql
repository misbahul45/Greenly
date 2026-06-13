CREATE TABLE `outbox_events` (
  `id` VARCHAR(191) NOT NULL,
  `eventType` VARCHAR(191) NOT NULL,
  `routingKey` VARCHAR(191) NOT NULL,
  `aggregateType` VARCHAR(191) NULL,
  `aggregateId` VARCHAR(191) NULL,
  `payload` JSON NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `maxAttempts` INTEGER NOT NULL DEFAULT 10,
  `lastError` TEXT NULL,
  `nextRetryAt` DATETIME(3) NULL,
  `publishedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `outbox_events_status_nextRetryAt_idx` ON `outbox_events`(`status`, `nextRetryAt`);
CREATE INDEX `outbox_events_eventType_idx` ON `outbox_events`(`eventType`);
CREATE INDEX `outbox_events_aggregateId_idx` ON `outbox_events`(`aggregateId`);
