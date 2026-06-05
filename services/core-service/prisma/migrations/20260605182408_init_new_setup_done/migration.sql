-- AlterTable
ALTER TABLE `payments` ADD COLUMN `paymentUrl` TEXT NULL,
    ADD COLUMN `stripeCheckoutSessionId` VARCHAR(191) NULL,
    ADD COLUMN `stripePaymentIntentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `payments_transactionId_idx` ON `payments`(`transactionId`);

-- CreateIndex
CREATE INDEX `payments_stripeCheckoutSessionId_idx` ON `payments`(`stripeCheckoutSessionId`);

-- CreateIndex
CREATE INDEX `payments_stripePaymentIntentId_idx` ON `payments`(`stripePaymentIntentId`);
