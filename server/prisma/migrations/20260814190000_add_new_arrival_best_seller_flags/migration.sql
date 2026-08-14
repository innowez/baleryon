-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_new_arrival" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_best_seller" BOOLEAN NOT NULL DEFAULT false;
