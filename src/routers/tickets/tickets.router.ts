import { Request, Response, Router } from "express";
import { accessMiddleware } from "../../middlewares/auth/accessMiddleware.js";
import TicketsController from "../../controllers/tickets/tickets.controller.js";

const router = Router();

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Retorna los boletos del usuario autenticado
 *     tags: [Tickets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de boletos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   event_title:
 *                     type: string
 *                   event_date:
 *                     type: string
 *                     format: date-time
 *                   venue:
 *                     type: string
 *                   seat:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [active, used, cancelled]
 *                   qr_code:
 *                     type: string
 *       401:
 *         description: Token inválido
 */
router.get("/", accessMiddleware, async (req: Request, res: Response) => {
    await TicketsController.getMyTickets(req, res);
});

export default router;
