import { Router } from "express";
import EventsController from "../../controllers/events/events.controller.js";

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Lista eventos, opcionalmente filtrados por tipo
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [cine, teatro, museos]
 *         description: Filtra por categoría
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Máximo de resultados
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
router.get("/", async (req, res) => {
    await EventsController.getEvents(req, res);
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Detalle de un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento encontrado
 *       404:
 *         description: Evento no encontrado
 */
router.get("/:id", async (req, res) => {
    await EventsController.getEventById(req, res);
});

/**
 * @swagger
 * /events/{id}/showtimes:
 *   get:
 *     summary: Funciones disponibles para un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de funciones
 *       404:
 *         description: Evento no encontrado
 */
router.get("/:id/showtimes", async (req, res) => {
    await EventsController.getShowtimes(req, res);
});

router.get("/:id/showtimes/:showtimeId/seats", async (req, res) => {
    await EventsController.getSeats(req, res);
});

export default router;
