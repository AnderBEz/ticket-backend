import { prisma } from "../../lib/prisma.js";
import QRCode from "qrcode";

export class OrdersService {
  async createOrder(userId: string, showtimeId: string, seatIds: string[]) {
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: { event: true },
    });
    if (!showtime) throw new Error("SHOWTIME_NOT_FOUND");

    // Validar que todos los asientos existen, pertenecen a la función y están disponibles
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds }, showtimeId },
    });

    if (seats.length !== seatIds.length) throw new Error("SEATS_NOT_FOUND");

    const unavailable = seats.filter((s) => s.status !== "AVAILABLE");
    if (unavailable.length > 0) throw new Error("SEATS_UNAVAILABLE");

    // Validar max_per_user del evento
    if (
      showtime.event.max_per_user &&
      seatIds.length > showtime.event.max_per_user
    ) {
      throw new Error("EXCEEDS_MAX_PER_USER");
    }

    const total = seats.reduce(
      (sum, s) => sum + (s.price ?? showtime.price),
      0,
    );
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Todo en una transacción: crear orden + reservar asientos
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          showtimeId,
          total,
          expires_at,
          seats: {
            create: seatIds.map((seatId) => ({ seatId })),
          },
        },
        include: {
          seats: { include: { seat: true } },
        },
      });

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "RESERVED" },
      });

      return order;
    });
  }

  async payOrder(
    orderId: string,
    paymentData: {
      type: "DEBIT" | "CREDIT" | "PAYPAL";
      card_number?: string;
      cardholder?: string;
      paypal_email?: string;
      whatsapp_phone?: string;
    },
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        showtime: { include: { event: true } },
        seats: { include: { seat: true } },
      },
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status !== "PENDING") throw new Error("ORDER_NOT_PENDING");
    if (new Date() > order.expires_at) throw new Error("ORDER_EXPIRED");

    const seatIds = order.seats.map((os) => os.seatId);
    const seatLabels = order.seats.map((os) => os.seat.label);

    return prisma.$transaction(async (tx) => {
      // 1. Marcar orden como pagada
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      // 2. Marcar asientos como TAKEN
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "TAKEN" },
      });

      // 3. Actualizar available_seats en la función
      await tx.showtime.update({
        where: { id: order.showtimeId },
        data: { available_seats: { decrement: seatIds.length } },
      });

      // 4. Guardar método de pago
      await tx.paymentMethod.create({
        data: {
          orderId,
          type: paymentData.type,
          card_number: paymentData.card_number ?? null,
          cardholder: paymentData.cardholder ?? null,
          paypal_email: paymentData.paypal_email ?? null,
          whatsapp_phone: paymentData.whatsapp_phone ?? null,
        },
      });

      // 5. Generar tickets con QR (uno por asiento)
      const tickets = await Promise.all(
        order.seats.map(async (os) => {
          const folio = crypto.randomUUID();

          const qrData = JSON.stringify({
            folio,
            evento: order.showtime.event.name,
            sede: order.showtime.venue_name,
            fecha: order.showtime.datetime,
            asiento: os.seat.label,
          });

          const qr_code = await QRCode.toDataURL(qrData);
          const qrBuffer = await QRCode.toBuffer(qrData);

          return tx.ticket.create({
            data: {
              folio,
              price_paid: os.seat.price ?? order.showtime.price,
              status: "PAID",
              qr_code,
              eventId: order.showtime.eventId,
              userId: order.userId,
              showtimeId: order.showtimeId,
              seatId: os.seatId,
              orderId,
            },
          });
        }),
      );

      return { order, tickets, seatLabels };
    });
  }
}

export default new OrdersService();
