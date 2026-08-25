/*
  Warnings:

  - You are about to drop the column `contract_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the `rental_contracts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `property_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_contract_id_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "rental_contracts" DROP CONSTRAINT "rental_contracts_property_id_fkey";

-- DropForeignKey
ALTER TABLE "rental_contracts" DROP CONSTRAINT "rental_contracts_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "contract_id",
ADD COLUMN     "property_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "owner_id",
ADD COLUMN     "client_id" INTEGER,
ADD COLUMN     "rental_end_date" DATE,
ADD COLUMN     "rental_start_date" DATE;

-- DropTable
DROP TABLE "rental_contracts";

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_payment_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "fk_property_agent" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "fk_property_client" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_user_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
