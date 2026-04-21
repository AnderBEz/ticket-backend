import { prisma } from "../../lib/prisma.js";

const STATUS_MAP = {
    PAID: "active",
    USED: "used",
    REFUNDED: "cancelled",
    CANCELLED: "cancelled",
} as const;

export class TicketsService {
    async getTicketsByUser(userId: string) {
        const tickets = await prisma.ticket.findMany({
            where: { userId },
            include: {
                event: { select: { name: true, date: true, location: true } },
                showtime: { select: { datetime: true, venue_name: true } },
                seat: { select: { label: true } },
            },
        });

        return tickets.map((t) => ({
            id: t.id,
            event_title: t.event.name,
            event_date: (t.showtime?.datetime ?? t.event.date).toISOString(),
            venue: t.showtime?.venue_name ?? t.event.location,
            seat: t.seat?.label ?? "N/A",
            status: STATUS_MAP[t.status],
            ...(t.qr_code ? { qr_code: t.qr_code } : {}),
        }));
    }
}

export default new TicketsService();
