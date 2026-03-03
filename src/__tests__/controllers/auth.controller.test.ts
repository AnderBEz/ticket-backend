import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth/auth.controller.js';
import { OtpTokenPayload, AccessTokenPayload } from '../../interfaces/user.interface.js';

// ── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('../../services/auth/sendotp.service.js', () => ({
    sendOtp: jest.fn(),
}));

jest.mock('otplib', () => ({
    generateSecret: jest.fn(() => 'mock-secret'),
    generate: jest.fn(async () => '123456'),
    verify: jest.fn(() => true),
    generateURI: jest.fn(),
}));

jest.mock('../../middlewares/auth/createJWT.js', () => ({
    generateAcccessToken: jest.fn(() => 'mock-access-token'),
    generateOtpToken: jest.fn(() => 'mock-otp-token'),
    verifyOtpToken: jest.fn(),
    verifyAccessToken: jest.fn(),
}));

jest.mock('../../services/auth/auth.service.js', () => ({
    __esModule: true,
    default: {
        findUserByEmail: jest.fn(),
        findUserById: jest.fn(),
        completeRegister: jest.fn(),
    },
}));

// ── Imports después de mocks ─────────────────────────────────────────────────
import { sendOtp } from '../../services/auth/sendotp.service.js';
import * as otplib from 'otplib';
import * as createJWT from '../../middlewares/auth/createJWT.js';
import AuthService from '../../services/auth/auth.service.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
    body: {},
    headers: {},
    user: undefined,
    ...overrides,
});

const mockRes = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// ── Tests ────────────────────────────────────────────────────────────────────
describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(() => {
        controller = new AuthController();
        jest.clearAllMocks();
    });

    // ── sendTotp ────────────────────────────────────────────────────────────
    describe('sendTotp', () => {
        it('retorna 400 si el body es inválido', async () => {
            const req = mockReq({ body: { email: 'no-es-email' } });
            const res = mockRes();

            await controller.sendTotp(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Datos invalidos' });
        });

        it('retorna 200 y otp_token cuando el correo se envía correctamente', async () => {
            (sendOtp as jest.Mock).mockResolvedValue(undefined);

            const req = mockReq({ body: { email: 'usuario@ejemplo.com' } });
            const res = mockRes();

            await controller.sendTotp(req as Request, res as Response);

            expect(sendOtp).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Correo enviado.',
                otp_token: 'mock-otp-token',
            });
        });

        it('retorna 500 si sendOtp lanza un error', async () => {
            (sendOtp as jest.Mock).mockRejectedValue(new Error('SMTP error'));

            const req = mockReq({ body: { email: 'usuario@ejemplo.com' } });
            const res = mockRes();

            await controller.sendTotp(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al enviar el OTP' });
        });
    });

    // ── verifyTotp ──────────────────────────────────────────────────────────
    describe('verifyTotp', () => {
        const otpPayload: OtpTokenPayload = { email: 'usuario@ejemplo.com', secret: 'SECRETO' };

        it('retorna 400 si el body es inválido', async () => {
            const req = mockReq({ body: { otp_code: '12' }, user: otpPayload });
            const res = mockRes();

            await controller.verifyTotp(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('retorna 401 si el OTP es incorrecto', async () => {
            (otplib.verify as jest.Mock).mockReturnValue(false);

            const req = mockReq({ body: { otp_code: '654321' }, user: otpPayload });
            const res = mockRes();

            await controller.verifyTotp(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'OTP inválido' });
        });

        it('retorna 200 con is_new_user=true si el usuario no existe', async () => {
            (otplib.verify as jest.Mock).mockReturnValue(true);
            (AuthService.findUserByEmail as jest.Mock).mockResolvedValue(null);

            const req = mockReq({ body: { otp_code: '123456' }, user: otpPayload });
            const res = mockRes();

            await controller.verifyTotp(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'OTP verificado. Completa tu registro.',
                is_new_user: true,
            });
        });

        it('retorna 200 con access_token si el usuario ya existe', async () => {
            (otplib.verify as jest.Mock).mockReturnValue(true);
            const fakeUser = { id: 'uuid-1', email: otpPayload.email };
            (AuthService.findUserByEmail as jest.Mock).mockResolvedValue(fakeUser);

            const req = mockReq({ body: { otp_code: '123456' }, user: otpPayload });
            const res = mockRes();

            await controller.verifyTotp(req as Request, res as Response);

            expect(createJWT.generateAcccessToken).toHaveBeenCalledWith({ user_id: fakeUser.id });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'OTP verificado. Bienvenido de nuevo.',
                is_new_user: false,
                access_token: 'mock-access-token',
            });
        });
    });

    // ── completeRegister ────────────────────────────────────────────────────
    describe('completeRegister', () => {
        const otpPayload: OtpTokenPayload = { email: 'nuevo@ejemplo.com', secret: 'SECRETO' };
        const validBody = { curp: 'ABCD123456HDFXXX01', full_name: 'Ana López', estado: 'DF' };

        it('retorna 400 si el body es inválido', async () => {
            const req = mockReq({ body: { curp: 'CORTA' }, user: otpPayload });
            const res = mockRes();

            await controller.completeRegister(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Datos invalidos' });
        });

        it('retorna 400 si el usuario ya está registrado', async () => {
            (AuthService.findUserByEmail as jest.Mock).mockResolvedValue({ id: 'uuid-exist' });

            const req = mockReq({ body: validBody, user: otpPayload });
            const res = mockRes();

            await controller.completeRegister(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario ya registrado' });
        });

        it('retorna 201 y access_token al completar el registro', async () => {
            (AuthService.findUserByEmail as jest.Mock).mockResolvedValue(null);
            const newUser = { id: 'uuid-new' };
            (AuthService.completeRegister as jest.Mock).mockResolvedValue(newUser);

            const req = mockReq({ body: validBody, user: otpPayload });
            const res = mockRes();

            await controller.completeRegister(req as Request, res as Response);

            expect(AuthService.completeRegister).toHaveBeenCalledWith({
                email: otpPayload.email,
                curp: validBody.curp,
                full_name: validBody.full_name,
                estado: validBody.estado,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Registro completado',
                access_token: 'mock-access-token',
            });
        });

        it('retorna 500 si ocurre un error al crear el usuario', async () => {
            (AuthService.findUserByEmail as jest.Mock).mockResolvedValue(null);
            (AuthService.completeRegister as jest.Mock).mockRejectedValue(new Error('DB error'));

            const req = mockReq({ body: validBody, user: otpPayload });
            const res = mockRes();

            await controller.completeRegister(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al completar el registro' });
        });
    });

    // ── getMe ───────────────────────────────────────────────────────────────
    describe('getMe', () => {
        const accessPayload: AccessTokenPayload = { user_id: 'uuid-1' };

        it('retorna 404 si el usuario no existe', async () => {
            (AuthService.findUserById as jest.Mock).mockResolvedValue(null);

            const req = mockReq({ user: accessPayload });
            const res = mockRes();

            await controller.getMe(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
        });

        it('retorna 200 con los datos del usuario', async () => {
            const fakeUser = {
                id: 'uuid-1',
                full_name: 'Juan Pérez',
                email: 'juan@ejemplo.com',
                created_at: new Date('2024-01-01'),
            };
            (AuthService.findUserById as jest.Mock).mockResolvedValue(fakeUser);

            const req = mockReq({ user: accessPayload });
            const res = mockRes();

            await controller.getMe(req as Request, res as Response);

            expect(AuthService.findUserById).toHaveBeenCalledWith(accessPayload.user_id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: fakeUser.id,
                full_name: fakeUser.full_name,
                email: fakeUser.email,
                created_at: fakeUser.created_at,
            });
        });
    });
});
