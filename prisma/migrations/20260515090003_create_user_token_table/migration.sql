/*
  Warnings:

  - A unique constraint covering the columns `[user_id,device_type]` on the table `user_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user_tokens` ADD COLUMN `device_type` VARCHAR(20) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_tokens_user_id_device_type_key` ON `user_tokens`(`user_id`, `device_type`);
