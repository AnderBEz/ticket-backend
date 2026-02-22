import { Request, Response } from "express";
import  AuthController  from "../../controllers/auth/auth.controller.js";
import { Router } from "express";

const router = Router();

router.post("/send-otp", async (req: Request, res: Response) => {
    await AuthController.sendTotp(req, res);
});

export default router;