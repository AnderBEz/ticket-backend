import { Request, Response } from "express";
import  AuthController  from "../../controllers/auth/auth.controller.js";
import { Router } from "express";
import { otpMiddleware } from "../../middlewares/auth/otpMiddleware.js";

const router = Router();

router.post("/send-otp", async (req: Request, res: Response) => {
    await AuthController.sendTotp(req, res);
});

router.post("/verify-otp", otpMiddleware, async (req: Request, res: Response) => {
    await AuthController.verifyTotp(req, res);
})

router.post("/complete-register", otpMiddleware, async (req: Request, res: Response) => {
    await AuthController.completeRegister(req, res);
})

export default router;