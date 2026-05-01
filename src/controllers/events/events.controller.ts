import { Request, Response } from "express";
import EventsService from "../../services/events/events.service.js";

export class EventsController {
    async getEvents(req: Request, res: Response) {
        const type = req.query.type as string | undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;

        try {
            const events = await EventsService.getEvents(type, limit);
            return res.status(200).json(events);
        } catch (error) {
            console.error("Error fetching events:", error);
            return res.status(500).json({ message: "Error al obtener eventos" });
        }
    }

    async getEventById(req: Request, res: Response) {
        const id = String(req.params.id);

        try {
            const event = await EventsService.getEventById(id);
            if (!event) return res.status(404).json({ message: "Evento no encontrado" });
            return res.status(200).json(event);
        } catch (error) {
            console.error("Error fetching event:", error);
            return res.status(500).json({ message: "Error al obtener evento" });
        }
    }

    async getShowtimes(req: Request, res: Response) {
        const id = String(req.params.id);

        try {
            const event = await EventsService.getEventById(id);
            if (!event) return res.status(404).json({ message: "Evento no encontrado" });

            const showtimes = await EventsService.getShowtimesByEvent(id);
            return res.status(200).json(showtimes);
        } catch (error) {
            console.error("Error fetching showtimes:", error);
            return res.status(500).json({ message: "Error al obtener funciones" });
        }
    }

    async getSeats(req: Request, res: Response) {
    const showtimeId = String(req.params.showtimeId);

    try {
        const showtime = await EventsService.getShowtimeById(showtimeId);
        if (!showtime) return res.status(404).json({ message: "Función no encontrada" });

        const seats = await EventsService.getSeatsByShowtime(showtimeId);
        return res.status(200).json(seats);
    } catch (error) {
        console.error("Error fetching seats:", error);
        return res.status(500).json({ message: "Error al obtener asientos" });
    }
}
}

export default new EventsController();
