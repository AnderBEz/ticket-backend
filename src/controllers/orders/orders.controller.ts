import { Request, Response } from "express";
import OrdersService from "../../services/orders/orders.service.js";
import { sendTicketEmail } from "../../services/orders/send-orderemail.service.js";
import QRCode from "qrcode";

export class OrdersController {
  async createOrder(req: Request, res: Response) {
    const { userId, showtimeId, seatIds } = req.body;

    if (
      !userId ||
      !showtimeId ||
      !Array.isArray(seatIds) ||
      seatIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "userId, showtimeId y seatIds son requeridos" });
    }

    try {
      const order = await OrdersService.createOrder(
        userId,
        showtimeId,
        seatIds,
      );
      return res.status(201).json(order);
    } catch (error: any) {
      const errors: Record<string, [number, string]> = {
        SHOWTIME_NOT_FOUND: [404, "Función no encontrada"],
        SEATS_NOT_FOUND: [404, "Uno o más asientos no encontrados"],
        SEATS_UNAVAILABLE: [409, "Uno o más asientos no están disponibles"],
        EXCEEDS_MAX_PER_USER: [400, "Excedes el máximo de boletos por usuario"],
      };
      const [status, message] = errors[error.message] ?? [
        500,
        "Error al crear la orden",
      ];
      return res.status(status).json({ message });
    }
  }

  async payOrder(req: Request, res: Response) {
    const orderId = String(req.params.id);
    const { type, card_number, cardholder, paypal_email, whatsapp_phone } =
      req.body;

    if (!type)
      return res.status(400).json({ message: "type de pago es requerido" });

    try {
      const { order, tickets, seatLabels } = await OrdersService.payOrder(
        orderId,
        {
          type,
          card_number,
          cardholder,
          paypal_email,
          whatsapp_phone,
        },
      );

      // Enviar email en background — no bloqueamos la respuesta
      const datetime = new Date(order.showtime.datetime).toLocaleString(
        "es-MX",
        {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "America/Mexico_City",
        },
      );
      const qrBuffers = await Promise.all(
    tickets.map((t) =>
        QRCode.toBuffer(JSON.stringify({
            folio: t.folio,
            asiento: t.seatId,
        }))
    )
);

      sendTicketEmail({
    to: order.user.email,
    fullName: order.user.full_name,
    eventName: order.showtime.event.name,
    venue: order.showtime.venue_name,
    datetime,
    seats: seatLabels,
    total: order.total,
    folio: tickets[0]?.folio ?? "",
    qrCodes: tickets.map((t) => t.qr_code ?? ""),
    qrBuffers,
}).catch((e) => console.error("Error enviando email:", e));

      return res.status(200).json({
        message: "Pago exitoso",
        orderId: order.id,
        tickets: tickets.map((t) => ({ folio: t.folio, seat: t.seatId })),
        total: order.total,
      });
    } catch (error: any) {
      const errors: Record<string, [number, string]> = {
        ORDER_NOT_FOUND: [404, "Orden no encontrada"],
        ORDER_NOT_PENDING: [409, "La orden ya fue procesada o cancelada"],
        ORDER_EXPIRED: [410, "La orden ha expirado"],
      };
      const [status, message] = errors[error.message] ?? [
        500,
        "Error al procesar el pago",
      ];
      return res.status(status).json({ message });
    }
  }
}

export default new OrdersController();
