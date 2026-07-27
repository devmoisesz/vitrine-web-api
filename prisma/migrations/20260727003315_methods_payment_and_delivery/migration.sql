-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'DINHEIRO', 'CARTAO_ENTREGA', 'CARTAO_ONLINE');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('RETIRADA_LOJA', 'ENTREGA_PROPRIA', 'CORREIOS', 'MOTOBOY');

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "delivery_methods" "DeliveryMethod"[],
ADD COLUMN     "payment_methods" "PaymentMethod"[];
