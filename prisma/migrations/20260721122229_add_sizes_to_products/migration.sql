-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[];
