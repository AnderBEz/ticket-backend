import { Request, Response } from "express";
import { completeRegisterSchema, sendOtpSchema, verifyOtpSchema } from "../../validators/auth/auth.validators.js";
import { sendOtp } from "../../services/auth/sendotp.service.js";
import { generateSecret, generate, verify, generateURI } from "otplib";
import { generateAcccessToken, generateOtpToken, verifyOtpToken } from "../../middlewares/auth/createJWT.js";
import  AuthService from "../../services/auth/auth.service.js";
import { OtpTokenPayload } from "../../interfaces/user.interface.js";
import { AccessTokenPayload } from "../../interfaces/user.interface.js";


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

    async verifyTotp(req: Request, res: Response) {
    const result = verifyOtpSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ message: "Datos invalidos" });
    }

    const payload = req.user as OtpTokenPayload;

    const otpResult = await verify({ token: result.data.otp_code, secret: payload.secret, period: 300 });

    if (!otpResult.valid) {
        return res.status(401).json({ message: "OTP inválido" });
    }

    const user = await AuthService.findUserByEmail(payload.email);

    if (!user) {
        return res.status(200).json({
            message: "OTP verificado. Completa tu registro.",
            is_new_user: true,
        });
    }

    return res.status(200).json({
        message: "OTP verificado. Bienvenido de nuevo.",
        is_new_user: false,
        access_token: generateAcccessToken({ user_id: user.id })
    });
    }

    async completeRegister(req: Request, res: Response) {
        const result = completeRegisterSchema.safeParse(req.body);
        
        if (!result.success) {
            return res.status(400).json({ message: "Datos invalidos" });
        }

        const payload = req.user as OtpTokenPayload;

        const exists = await AuthService.findUserByEmail(payload.email)

        if (exists) {
            return res.status(400).json({ message: "Usuario ya registrado" });
        }

        try {
            const newUser = await AuthService.completeRegister({
                email: payload.email,
                curp: result.data.curp,
                full_name: result.data.full_name,
                estado: result.data.estado
            })

            return res.status(201).json({
                message: "Registro completado",
                access_token: generateAcccessToken({ user_id: newUser.id })
            });
        } catch (error) {
            console.error("Error al completar el registro:", error);
            return res.status(500).json({ message: "Error al completar el registro" });
        }
    }

    async getMe(req: Request, res: Response) {
        const payload = req.user as AccessTokenPayload;

        const user = await AuthService.findUserById(payload.user_id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        return res.status(200).json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            created_at: user.created_at,
        });
    }


}

export default new AuthController();