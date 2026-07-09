/*
  Warnings:

  - The values [OWNER,EMPLOYEE] on the enum `CollaboratorRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,INACTIVE] on the enum `StatusStore` will be removed. If these variants are still used in the database, this will fail.
  - The values [USER,ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CollaboratorRole_new" AS ENUM ('Proprietário', 'Funcionário');
ALTER TABLE "public"."collaborators" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "collaborators" ALTER COLUMN "role" TYPE "CollaboratorRole_new" USING ("role"::text::"CollaboratorRole_new");
ALTER TYPE "CollaboratorRole" RENAME TO "CollaboratorRole_old";
ALTER TYPE "CollaboratorRole_new" RENAME TO "CollaboratorRole";
DROP TYPE "public"."CollaboratorRole_old";
ALTER TABLE "collaborators" ALTER COLUMN "role" SET DEFAULT 'Funcionário';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusStore_new" AS ENUM ('Ativa', 'Inativa');
ALTER TABLE "public"."stores" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stores" ALTER COLUMN "status" TYPE "StatusStore_new" USING ("status"::text::"StatusStore_new");
ALTER TYPE "StatusStore" RENAME TO "StatusStore_old";
ALTER TYPE "StatusStore_new" RENAME TO "StatusStore";
DROP TYPE "public"."StatusStore_old";
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'Ativa';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('Usuário', 'Admin');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Usuário';
COMMIT;

-- AlterTable
ALTER TABLE "collaborators" ALTER COLUMN "role" SET DEFAULT 'Funcionário';

-- AlterTable
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'Ativa';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Usuário';
