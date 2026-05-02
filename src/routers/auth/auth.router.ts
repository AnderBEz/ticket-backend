import { Request, Response } from "express";
import  AuthController  from "../../controllers/auth/auth.controller.js";
import { Router } from "express";
import { otpMiddleware } from "../../middlewares/auth/otpMiddleware.js";
import { accessMiddleware } from "../../middlewares/auth/accessMiddleware.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
    message: { message: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
});

//swagger documentation for auth routes
/**
 * @swagger
 * /auth/tikme/send-otp:
 *   post:
 *     summary: Envía un OTP al correo
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *     responses:
 *       200:
 *         description: OTP enviado
 *       400:
 *         description: Datos inválidos
 *
 * /auth/tikme/verify-otp:
 *   post:
 *     summary: Verifica el OTP
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp_code:
 *                 type: string
 *                 example: "349100"
 *     responses:
 *       200:
 *         description: OTP verificado
 *       401:
 *         description: Token inválido o OTP incorrecto
 *
 * /auth/tikme/complete-register:
 *   post:
 *     summary: Completa el registro del usuario
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               curp:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado
 *
 * /auth/tikme/me:
 *   get:
 *     summary: Retorna los datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: Token inválido
 */

router.post("/send-otp", loginLimiter, async (req: Request, res: Response) => {
    await AuthController.sendTotp(req, res);
});

router.post("/verify-otp", otpMiddleware, async (req: Request, res: Response) => {
    await AuthController.verifyTotp(req, res);
})

router.post("/complete-register", otpMiddleware, async (req: Request, res: Response) => {
    await AuthController.completeRegister(req, res);
})

router.get("/me", accessMiddleware, async (req: Request, res: Response) => {
    await AuthController.getMe(req, res);
});

export default router;