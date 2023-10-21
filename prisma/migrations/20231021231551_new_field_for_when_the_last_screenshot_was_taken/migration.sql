/*
  Warnings:

  - Added the required column `lastscreenshottakenat` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account" ADD COLUMN     "lastscreenshottakenat" TEXT NOT NULL;
