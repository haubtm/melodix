/*
  Warnings:

  - You are about to drop the column `is_artist` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `is_artist`,
    ADD COLUMN `role` ENUM('user', 'artist', 'admin') NOT NULL DEFAULT 'user';
