import { NextFunction, Request, Response } from "express";
import { verifyOtpToken } from "./createJWT.js";
import { OtpTokenPayload } from "../../interfaces/user.interface.js";

declare global {
    namespace Express {
        interface Request {
            user?: { userId: number; email: string; } | OtpTokenPayload;
        }
    }
}

export const otpMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token requerido" });
    }

    try {
        const payload = verifyOtpToken(token);

        if (!payload.email || !payload.secret) {
            return res.status(401).json({ message: "Token inválido" });
        }

        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};