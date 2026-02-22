import { generateSecret, generate, verify, generateURI } from "otplib";

export const generateTotp = () => {
    const secret = generateSecret();
    const totp = generate({secret, period: 300, digits: 6});

    return { secret, totp };
}