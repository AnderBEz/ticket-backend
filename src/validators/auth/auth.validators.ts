import { z } from "zod";

export const sendOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
}).strict();  

export const verifyOtpSchema = z.object({
    otp_code: z.string().length(6, "OTP code must be exactly 6 characters long"),
});

export const completeRegisterSchema = z.object({
    curp : z.string().length(18, "CURP must be exactly 18 characters long"),
    full_name: z.string().min(1, "Full name is required"),
    estado: z.string().min(2, "Estado is required"),
})