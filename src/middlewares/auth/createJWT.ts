import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from "../../interfaces/user.interface.js";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'clave_secreta_provisional';

export const generateToken = (
    payload: JWTPayload, 
    expiresIn: SignOptions['expiresIn'] = '1h'
): string => {
    return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn });
}