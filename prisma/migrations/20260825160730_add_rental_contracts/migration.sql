/*
  Warnings:

  - You are about to drop the column `property_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `rental_end_date` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `rental_start_date` on the `properties` table. All the data in the column will be lost.
  - Added the required column `contract_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_payment_property";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "fk_property_agent";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "fk_property_client";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "fk_user_role";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "property_id",
ADD COLUMN     "contract_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "client_id",
DROP COLUMN "rental_end_date",
DROP COLUMN "rental_start_date",
ADD COLUMN     "owner_id" INTEGER;

-- CreateTable
CREATE TABLE "rental_contracts" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "monthly_rent" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_contracts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "rental_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
