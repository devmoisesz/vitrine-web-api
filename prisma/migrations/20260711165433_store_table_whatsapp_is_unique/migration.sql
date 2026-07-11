/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stores_whatsapp_key" ON "stores"("whatsapp");
