-- AlterTable
ALTER TABLE `songs` ADD COLUMN `rejection_reason` VARCHAR(191) NULL,
    ADD COLUMN `reviewed_at` DATETIME(3) NULL,
    ADD COLUMN `reviewed_by` INTEGER NULL,
    ADD COLUMN `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `user_oauth_accounts` MODIFY `access_token` TEXT NULL,
    MODIFY `refresh_token` TEXT NULL;
