/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `account` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "account" DROP CONSTRAINT "account_pkey",
ADD COLUMN     "break_time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_gold" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Offline',
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");
