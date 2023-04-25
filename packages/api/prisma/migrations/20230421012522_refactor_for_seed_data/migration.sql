/*
  Warnings:

  - You are about to drop the column `search` on the `Book` table. All the data in the column will be lost.
  - The primary key for the `Verse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VerseTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `order` on the `Word` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "VerseTranslation" DROP CONSTRAINT "VerseTranslation_verseId_fkey";

-- DropForeignKey
ALTER TABLE "Word" DROP CONSTRAINT "Word_verseId_fkey";

-- DropIndex
DROP INDEX "Book_search_key";

-- DropIndex
DROP INDEX "Word_verseId_order_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "search";

-- AlterTable
ALTER TABLE "Verse" DROP CONSTRAINT "Verse_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Verse_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "VerseTranslation" DROP CONSTRAINT "VerseTranslation_pkey",
ALTER COLUMN "verseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "VerseTranslation_pkey" PRIMARY KEY ("verseId", "languageId");

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "order",
ALTER COLUMN "verseId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Book_name_key" ON "Book"("name");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerseTranslation" ADD CONSTRAINT "VerseTranslation_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
