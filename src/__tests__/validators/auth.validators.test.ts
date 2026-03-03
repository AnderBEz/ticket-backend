import { sendOtpSchema, verifyOtpSchema, completeRegisterSchema } from '../../validators/auth/auth.validators.js';

describe('sendOtpSchema', () => {
    it('acepta un email válido', () => {
        const result = sendOtpSchema.safeParse({ email: 'usuario@ejemplo.com' });
        expect(result.success).toBe(true);
    });

    it('rechaza un email inválido', () => {
        const result = sendOtpSchema.safeParse({ email: 'no-es-un-email' });
        expect(result.success).toBe(false);
    });

    it('rechaza si falta el email', () => {
        const result = sendOtpSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it('rechaza campos extra (strict)', () => {
        const result = sendOtpSchema.safeParse({ email: 'usuario@ejemplo.com', extra: 'dato' });
        expect(result.success).toBe(false);
    });
});

describe('verifyOtpSchema', () => {
    it('acepta un OTP de exactamente 6 caracteres', () => {
        const result = verifyOtpSchema.safeParse({ otp_code: '123456' });
        expect(result.success).toBe(true);
    });

    it('rechaza un OTP de menos de 6 caracteres', () => {
        const result = verifyOtpSchema.safeParse({ otp_code: '123' });
        expect(result.success).toBe(false);
    });

    it('rechaza un OTP de más de 6 caracteres', () => {
        const result = verifyOtpSchema.safeParse({ otp_code: '1234567' });
        expect(result.success).toBe(false);
    });

    it('rechaza si falta el otp_code', () => {
        const result = verifyOtpSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe('completeRegisterSchema', () => {
    const validData = {
        curp: 'ABCD123456HDFXXX01',
        full_name: 'Juan Pérez',
        estado: 'DF',
    };

    it('acepta datos válidos', () => {
        const result = completeRegisterSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('rechaza CURP que no tiene exactamente 18 caracteres', () => {
        const result = completeRegisterSchema.safeParse({ ...validData, curp: 'CORTA' });
        expect(result.success).toBe(false);
    });

    it('rechaza full_name vacío', () => {
        const result = completeRegisterSchema.safeParse({ ...validData, full_name: '' });
        expect(result.success).toBe(false);
    });

    it('rechaza estado con menos de 2 caracteres', () => {
        const result = completeRegisterSchema.safeParse({ ...validData, estado: 'X' });
        expect(result.success).toBe(false);
    });

    it('rechaza si faltan campos obligatorios', () => {
        const result = completeRegisterSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});
