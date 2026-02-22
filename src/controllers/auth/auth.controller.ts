import { Request, Response } from "express";
import { sendOtpSchema } from "../../validators/auth/auth.validators.js";
import { sendOtp } from "../../services/auth/sendotp.service.js";
import { generateSecret, generate, verify, generateURI } from "otplib";
import { generateOtpToken } from "../../middlewares/auth/createJWT.js";


export class AuthController {
    async sendTotp(req: Request, res: Response) {
        const result = sendOtpSchema.safeParse(req.body); 
        const secret = generateSecret();
        const totp = await generate({secret, period: 300, digits: 6}); 

        if (!result.success){
            return res.status(400).json({"message": "Datos invalidos"})
        }

        try {
            await sendOtp(totp, result.data.email);

            const otpToken = generateOtpToken({email: result.data.email, secret});

            return res.status(200).json({
                "message": "Correo enviado.",
                "otp_token": otpToken
            });
        } catch (error) {
            console.error("Error al enviar el OTP:", error);
            return res.status(500).json({"message": "Error al enviar el OTP"});
        }
    }
}

export default new AuthController();