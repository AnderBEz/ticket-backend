import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AccessTokenPayload } from "../../interfaces/user.interface.js";
import { OtpTokenPayload } from "../../interfaces/user.interface.js";
dotenv.config();


const SECRET = process.env.SECRET_KEY as string;


export const generateAcccessToken = (payload: AccessTokenPayload) => {
    return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

export const generateOtpToken = (payload: OtpTokenPayload) => {
    return jwt.sign(payload, SECRET, { expiresIn: "5m" });
}

export const verifyOtpToken = (token: string): OtpTokenPayload => {
    return jwt.verify(token, SECRET) as OtpTokenPayload;
}