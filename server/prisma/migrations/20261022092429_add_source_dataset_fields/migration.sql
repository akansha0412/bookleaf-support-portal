/*
  Warnings:

  - A unique constraint covering the columns `[sourceId]` on the table `Author` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceId` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Made the column `sourceId` on table `Book` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "city" TEXT,
ADD COLUMN     "joinedDate" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "sourceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "authorRoyaltyPerCopy" DECIMAL(10,2),
ADD COLUMN     "availableOn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastRoyaltyPayoutDate" TIMESTAMP(3),
ADD COLUMN     "printPartner" TEXT,
ALTER COLUMN "sourceId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Author_sourceId_key" ON "Author"("sourceId");
