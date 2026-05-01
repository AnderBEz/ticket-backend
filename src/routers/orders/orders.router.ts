import { Router } from "express";
import OrdersController from "../../controllers/orders/orders.controller.js";

const router = Router();

router.post("/", async (req, res) => {
    await OrdersController.createOrder(req, res);
});

router.post("/:id/pay", async (req, res) => {
    await OrdersController.payOrder(req, res);
});

export default router;