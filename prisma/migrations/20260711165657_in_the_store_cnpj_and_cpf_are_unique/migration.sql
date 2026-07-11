/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `stores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stores_cnpj_key" ON "stores"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "stores_cpf_key" ON "stores"("cpf");
