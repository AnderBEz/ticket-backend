import { Router } from "express";
import OrdersController from "../../controllers/orders/orders.controller.js";
import { accessMiddleware } from "../../middlewares/auth/accessMiddleware.js";

const router = Router();

router.post("/", accessMiddleware, async (req, res) => {
    await OrdersController.createOrder(req, res);
});

router.post("/:id/pay", accessMiddleware, async (req, res) => {
    await OrdersController.payOrder(req, res);
});

export default router;