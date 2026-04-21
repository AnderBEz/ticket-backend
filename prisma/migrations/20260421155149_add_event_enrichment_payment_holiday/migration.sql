-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('TRADITIONAL', 'VIP', 'IMAX', '4DX', 'MACRO_XE', 'PLUUS', 'JUNIOR', 'VR', 'SCREEN_X');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEBIT', 'CREDIT', 'PAYPAL');

-- AlterTable
ALTER TABLE "tik_events" ADD COLUMN     "access_restrictions" TEXT,
ADD COLUMN     "backdrop_url" TEXT,
ADD COLUMN     "classification" TEXT,
ADD COLUMN     "dress_code" TEXT,
ADD COLUMN     "max_per_user" INTEGER,
ADD COLUMN     "poster_url" TEXT,
ADD COLUMN     "restrictions" TEXT[],
ADD COLUMN     "tmdb_id" INTEGER,
ADD COLUMN     "vote_average" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tik_seats" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "section" TEXT;

-- AlterTable
ALTER TABLE "tik_showtimes" ADD COLUMN     "service_type" "ServiceType" NOT NULL DEFAULT 'TRADITIONAL';

-- CreateTable
CREATE TABLE "tik_payment_methods" (
    "id" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "card_number" TEXT,
    "cardholder" TEXT,
    "paypal_email" TEXT,
    "order_id" TEXT NOT NULL,

    CONSTRAINT "tik_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tik_holidays" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "tik_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tik_payment_methods_order_id_key" ON "tik_payment_methods"("order_id");

-- AddForeignKey
ALTER TABLE "tik_payment_methods" ADD CONSTRAINT "tik_payment_methods_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "tik_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
