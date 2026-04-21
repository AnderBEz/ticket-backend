import { Request, Response } from "express";
import TicketsService from "../../services/tickets/tickets.service.js";
import { AccessTokenPayload } from "../../interfaces/user.interface.js";

export class TicketsController {
    async getMyTickets(req: Request, res: Response) {
        const { user_id } = req.user as AccessTokenPayload;

        try {
            const tickets = await TicketsService.getTicketsByUser(user_id);
            return res.status(200).json(tickets);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            return res.status(500).json({ message: "Error al obtener boletos" });
        }
    }
}

export default new TicketsController();
