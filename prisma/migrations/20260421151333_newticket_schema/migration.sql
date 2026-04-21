/*
  Warnings:

  - A unique constraint covering the columns `[seat_id]` on the table `tik_tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'TAKEN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "tik_tickets" ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "qr_code" TEXT,
ADD COLUMN     "seat_id" TEXT,
ADD COLUMN     "showtime_id" TEXT;

-- CreateTable
CREATE TABLE "tik_showtimes" (
    "id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "venue_name" TEXT NOT NULL,
    "venue_address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "price" DOUBLE PRECISION NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "event_id" TEXT NOT NULL,

    CONSTRAINT "tik_showtimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tik_seats" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "showtime_id" TEXT NOT NULL,

    CONSTRAINT "tik_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tik_orders" (
    "id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "showtime_id" TEXT NOT NULL,

    CONSTRAINT "tik_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tik_order_seats" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "seat_id" TEXT NOT NULL,

    CONSTRAINT "tik_order_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tik_order_seats_order_id_seat_id_key" ON "tik_order_seats"("order_id", "seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "tik_tickets_seat_id_key" ON "tik_tickets"("seat_id");

-- AddForeignKey
ALTER TABLE "tik_showtimes" ADD CONSTRAINT "tik_showtimes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "tik_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_seats" ADD CONSTRAINT "tik_seats_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "tik_showtimes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_orders" ADD CONSTRAINT "tik_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tik_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_orders" ADD CONSTRAINT "tik_orders_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "tik_showtimes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_order_seats" ADD CONSTRAINT "tik_order_seats_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "tik_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_order_seats" ADD CONSTRAINT "tik_order_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "tik_seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_tickets" ADD CONSTRAINT "tik_tickets_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "tik_showtimes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_tickets" ADD CONSTRAINT "tik_tickets_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "tik_seats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_tickets" ADD CONSTRAINT "tik_tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "tik_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
