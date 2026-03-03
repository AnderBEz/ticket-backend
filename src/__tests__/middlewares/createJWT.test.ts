import {
    generateAcccessToken,
    verifyAccessToken,
    generateOtpToken,
    verifyOtpToken,
} from '../../middlewares/auth/createJWT.js';

// Establece una clave secreta para los tests
process.env.SECRET_KEY = 'test-secret-key';

describe('generateAcccessToken / verifyAccessToken', () => {
    const payload = { user_id: 'user-123' };

    it('genera un token JWT y lo verifica correctamente', () => {
        const token = generateAcccessToken(payload);
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);

        const decoded = verifyAccessToken(token);
        expect(decoded.user_id).toBe(payload.user_id);
    });

    it('verifyAccessToken lanza error con un token inválido', () => {
        expect(() => verifyAccessToken('token.invalido.aqui')).toThrow();
    });

    it('verifyAccessToken lanza error con token vacío', () => {
        expect(() => verifyAccessToken('')).toThrow();
    });
});

describe('generateOtpToken / verifyOtpToken', () => {
    const payload = { email: 'usuario@ejemplo.com', secret: 'SECRETO123' };

    it('genera un OTP token JWT y lo verifica correctamente', () => {
        const token = generateOtpToken(payload);
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);

        const decoded = verifyOtpToken(token);
        expect(decoded.email).toBe(payload.email);
        expect(decoded.secret).toBe(payload.secret);
    });

    it('verifyOtpToken lanza error con un token inválido', () => {
        expect(() => verifyOtpToken('token.invalido.aqui')).toThrow();
    });
});
