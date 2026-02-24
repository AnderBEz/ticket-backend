import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "./createJWT.js";
import { AccessTokenPayload } from "../../interfaces/user.interface.js";

export const accessMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token requerido" });
    }

    try {
        const payload = verifyAccessToken(token);

        if (!payload.user_id) {
            return res.status(401).json({ message: "Token inválido" });
        }

        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};