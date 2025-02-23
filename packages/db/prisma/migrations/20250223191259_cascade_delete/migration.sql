-- DropForeignKey
ALTER TABLE "spaceElements" DROP CONSTRAINT "spaceElements_spaceId_fkey";

-- AddForeignKey
ALTER TABLE "spaceElements" ADD CONSTRAINT "spaceElements_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
