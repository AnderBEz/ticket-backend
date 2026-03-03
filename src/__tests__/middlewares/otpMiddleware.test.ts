import { Request, Response, NextFunction } from 'express';
import { otpMiddleware } from '../../middlewares/auth/otpMiddleware.js';
import * as createJWT from '../../middlewares/auth/createJWT.js';

process.env.SECRET_KEY = 'test-secret-key';

const mockReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
    headers: {},
    ...overrides,
});

const mockRes = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

describe('otpMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retorna 401 si no hay header Authorization', () => {
        const req = mockReq({ headers: {} });
        const res = mockRes();

        otpMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('retorna 401 si el header no empieza con "Bearer "', () => {
        const req = mockReq({ headers: { authorization: 'Token abc' } });
        const res = mockRes();

        otpMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
    });

    it('retorna 401 si el token es inválido o expirado', () => {
        jest.spyOn(createJWT, 'verifyOtpToken').mockImplementation(() => {
            throw new Error('jwt expired');
        });

        const req = mockReq({ headers: { authorization: 'Bearer token.expirado' } });
        const res = mockRes();

        otpMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado' });
    });

    it('retorna 401 si el payload no contiene email o secret', () => {
        jest.spyOn(createJWT, 'verifyOtpToken').mockReturnValue({ email: '', secret: '' });

        const req = mockReq({ headers: { authorization: 'Bearer token.incompleto' } });
        const res = mockRes();

        otpMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    });

    it('llama a next() y asigna req.user con un token OTP válido', () => {
        const fakePayload = { email: 'usuario@ejemplo.com', secret: 'SECRETO123' };
        jest.spyOn(createJWT, 'verifyOtpToken').mockReturnValue(fakePayload);

        const req = mockReq({ headers: { authorization: 'Bearer token.otp.valido' } }) as Request;
        const res = mockRes();

        otpMiddleware(req, res as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(req.user).toEqual(fakePayload);
    });
});
