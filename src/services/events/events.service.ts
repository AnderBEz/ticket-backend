import { prisma } from "../../lib/prisma.js";

export class EventsService {
    async getEvents(type?: string, limit = 8) {
        const where = type ? { eventType: { name: { equals: type, mode: "insensitive" as const } } } : {};
        return prisma.event.findMany({
            where,
            take: limit,
            orderBy: { date: "asc" },
            select: {
                id: true,
                name: true,
                description: true,
                date: true,
                location: true,
                price: true,
                poster_url: true,
                backdrop_url: true,
                vote_average: true,
                classification: true,
                eventType: { select: { name: true } },
            },
        });
    }

    async getEventById(id: string) {
        return prisma.event.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                date: true,
                location: true,
                capacity: true,
                price: true,
                poster_url: true,
                backdrop_url: true,
                vote_average: true,
                classification: true,
                restrictions: true,
                dress_code: true,
                max_per_user: true,
                access_restrictions: true,
                eventType: { select: { name: true } },
            },
        });
    }

    async getShowtimesByEvent(eventId: string) {
        const showtimes = await prisma.showtime.findMany({
            where: { eventId },
            orderBy: { datetime: "asc" },
            select: {
                id: true,
                datetime: true,
                venue_name: true,
                venue_address: true,
                lat: true,
                lng: true,
                price: true,
                available_seats: true,
                service_type: true,
            },
        });

        return showtimes.map((s) => ({
            ...s,
            service_type: s.service_type === "FOUR_DX" ? "4DX" : s.service_type,
        }));
    }
}

export default new EventsService();
