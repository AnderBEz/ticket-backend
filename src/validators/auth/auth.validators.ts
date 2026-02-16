import { z } from "zod";

export const sendOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
    full_name: z.string().min(2, "Full name must be at least 2 characters long").max(60, "Full name must be less than 60 characters"),
});  