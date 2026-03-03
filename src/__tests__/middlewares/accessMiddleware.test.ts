import { Request, Response, NextFunction } from 'express';
import { accessMiddleware } from '../../middlewares/auth/accessMiddleware.js';
import * as createJWT from '../../middlewares/auth/createJWT.js';

process.env.SECRET_KEY = 'test-secret-key';

// Helper para crear objetos mock de Request/Response
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

describe('accessMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retorna 401 si no hay header Authorization', () => {
        const req = mockReq({ headers: {} });
        const res = mockRes();

        accessMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('retorna 401 si el header no empieza con "Bearer "', () => {
        const req = mockReq({ headers: { authorization: 'Basic token123' } });
        const res = mockRes();

        accessMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
    });

    it('retorna 401 si el token es inválido', () => {
        jest.spyOn(createJWT, 'verifyAccessToken').mockImplementation(() => {
            throw new Error('jwt malformed');
        });

        const req = mockReq({ headers: { authorization: 'Bearer token.invalido' } });
        const res = mockRes();

        accessMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado' });
    });

    it('retorna 401 si el payload no contiene user_id', () => {
        jest.spyOn(createJWT, 'verifyAccessToken').mockReturnValue({ user_id: '' });

        const req = mockReq({ headers: { authorization: 'Bearer token.valido' } });
        const res = mockRes();

        accessMiddleware(req as Request, res as Response, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    });

    it('llama a next() y asigna req.user con un token válido', () => {
        const fakePayload = { user_id: 'user-abc' };
        jest.spyOn(createJWT, 'verifyAccessToken').mockReturnValue(fakePayload);

        const req = mockReq({ headers: { authorization: 'Bearer token.valido' } }) as Request;
        const res = mockRes();

        accessMiddleware(req, res as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(req.user).toEqual(fakePayload);
    });
});
