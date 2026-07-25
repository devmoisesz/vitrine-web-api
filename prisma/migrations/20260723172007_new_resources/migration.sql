/*
  Warnings:

  - You are about to drop the column `price_at_purchase` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `carts` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `total` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[cart_id,product_id,selected_size]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "price_at_purchase",
ADD COLUMN     "selected_size" TEXT;

-- AlterTable
ALTER TABLE "carts" DROP COLUMN "status",
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "product_image_url" TEXT,
ADD COLUMN     "selected_size" TEXT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- DropEnum
DROP TYPE "StatusCart";

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_selected_size_key" ON "cart_items"("cart_id", "product_id", "selected_size");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
