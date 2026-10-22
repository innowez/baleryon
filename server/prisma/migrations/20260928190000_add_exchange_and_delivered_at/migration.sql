-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivered_at" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('EXCHANGE', 'REFUND');

-- AlterTable
ALTER TABLE "returns" ADD COLUMN     "type" "ReturnType" NOT NULL DEFAULT 'EXCHANGE',
ADD COLUMN     "desired_variant_id" UUID,
ADD COLUMN     "admin_note" TEXT,
ADD COLUMN     "pickup_shipment_id" UUID,
ADD COLUMN     "replacement_shipment_id" UUID,
ADD COLUMN     "responded_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
