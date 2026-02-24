/*
  Warnings:

  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PAID', 'USED', 'REFUNDED', 'CANCELLED');

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "tik_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "curp" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "is_new_user" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tik_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tik_event_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tik_event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tik_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "event_type_id" TEXT NOT NULL,

    CONSTRAINT "tik_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tik_tickets" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "price_paid" DOUBLE PRECISION NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PAID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "tik_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tik_users_email_key" ON "tik_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tik_users_curp_key" ON "tik_users"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "tik_tickets_folio_key" ON "tik_tickets"("folio");

-- AddForeignKey
ALTER TABLE "tik_events" ADD CONSTRAINT "tik_events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "tik_event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_tickets" ADD CONSTRAINT "tik_tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "tik_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tik_tickets" ADD CONSTRAINT "tik_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tik_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
