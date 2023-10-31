/*
  Warnings:

  - You are about to drop the column `createdat` on the `account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "account" DROP COLUMN "createdat",
ALTER COLUMN "lastseen" SET DEFAULT '',
ALTER COLUMN "lastscreenshot" SET DEFAULT '',
ALTER COLUMN "lastscreenshottakenat" SET DEFAULT '';
