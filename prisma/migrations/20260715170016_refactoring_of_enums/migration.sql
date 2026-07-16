/*
  Warnings:

  - The values [Proprietário,Funcionário] on the enum `CollaboratorRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [Ativo,Concluído] on the enum `StatusCart` will be removed. If these variants are still used in the database, this will fail.
  - The values [Ativo,Inativo] on the enum `StatusProduct` will be removed. If these variants are still used in the database, this will fail.
  - The values [Ativa,Inativa] on the enum `StatusStore` will be removed. If these variants are still used in the database, this will fail.
  - The values [Usuário,Admin] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,store_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,category_id]` on the table `subcategories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,category_id]` on the table `subcategories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `subcategories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CollaboratorRole_new" AS ENUM ('PROPRIETARIO', 'FUNCIONARIO');
ALTER TABLE "collaborators" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "collaborators" ALTER COLUMN "role" TYPE "CollaboratorRole_new" USING ("role"::text::"CollaboratorRole_new");
ALTER TYPE "CollaboratorRole" RENAME TO "CollaboratorRole_old";
ALTER TYPE "CollaboratorRole_new" RENAME TO "CollaboratorRole";
DROP TYPE "CollaboratorRole_old";
ALTER TABLE "collaborators" ALTER COLUMN "role" SET DEFAULT 'FUNCIONARIO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusCart_new" AS ENUM ('ATIVO', 'CONCLUIDO');
ALTER TABLE "carts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "carts" ALTER COLUMN "status" TYPE "StatusCart_new" USING ("status"::text::"StatusCart_new");
ALTER TYPE "StatusCart" RENAME TO "StatusCart_old";
ALTER TYPE "StatusCart_new" RENAME TO "StatusCart";
DROP TYPE "StatusCart_old";
ALTER TABLE "carts" ALTER COLUMN "status" SET DEFAULT 'ATIVO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusProduct_new" AS ENUM ('ATIVO', 'INATIVO');
ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "StatusProduct_new" USING ("status"::text::"StatusProduct_new");
ALTER TYPE "StatusProduct" RENAME TO "StatusProduct_old";
ALTER TYPE "StatusProduct_new" RENAME TO "StatusProduct";
DROP TYPE "StatusProduct_old";
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'ATIVO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusStore_new" AS ENUM ('ATIVA', 'INATIVA');
ALTER TABLE "stores" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stores" ALTER COLUMN "status" TYPE "StatusStore_new" USING ("status"::text::"StatusStore_new");
ALTER TYPE "StatusStore" RENAME TO "StatusStore_old";
ALTER TYPE "StatusStore_new" RENAME TO "StatusStore";
DROP TYPE "StatusStore_old";
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'ATIVA';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropIndex
DROP INDEX "products_slug_key";

-- AlterTable
ALTER TABLE "carts" ALTER COLUMN "status" SET DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "collaborators" ALTER COLUMN "role" SET DEFAULT 'FUNCIONARIO';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category_id" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'ATIVA';

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "_ProductToTag_B_index" ON "_ProductToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_store_id_key" ON "products"("slug", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_name_category_id_key" ON "subcategories"("name", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_slug_category_id_key" ON "subcategories"("slug", "category_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD CONSTRAINT "_ProductToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD CONSTRAINT "_ProductToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
