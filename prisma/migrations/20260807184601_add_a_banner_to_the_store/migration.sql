/*
  Warnings:

  - You are about to drop the column `storage_public_id` on the `stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stores" DROP COLUMN "storage_public_id",
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "banner_public_id" TEXT,
ADD COLUMN     "logo_public_id" TEXT;
