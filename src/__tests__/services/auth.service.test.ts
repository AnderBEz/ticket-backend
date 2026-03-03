import { AuthService } from '../../services/auth/auth.service.js';
import { prisma } from '../../lib/prisma.js';

// Mock de Prisma
jest.mock('../../lib/prisma.js', () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        service = new AuthService();
        jest.clearAllMocks();
    });

    describe('findUserByEmail', () => {
        it('retorna el usuario si existe', async () => {
            const fakeUser = { id: 'uuid-1', email: 'usuario@ejemplo.com', full_name: 'Juan', curp: 'ABCDF12345', created_at: new Date(), updated_at: new Date() };
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);

            const result = await service.findUserByEmail('usuario@ejemplo.com');

            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'usuario@ejemplo.com' } });
            expect(result).toEqual(fakeUser);
        });

        it('retorna null si el usuario no existe', async () => {
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await service.findUserByEmail('noexiste@ejemplo.com');

            expect(result).toBeNull();
        });
    });

    describe('findUserById', () => {
        it('retorna el usuario si existe', async () => {
            const fakeUser = { id: 'uuid-1', email: 'usuario@ejemplo.com', full_name: 'Juan', curp: 'ABCDF12345', created_at: new Date(), updated_at: new Date() };
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);

            const result = await service.findUserById('uuid-1');

            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
            expect(result).toEqual(fakeUser);
        });

        it('retorna null si el usuario no existe', async () => {
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await service.findUserById('uuid-inexistente');

            expect(result).toBeNull();
        });
    });

    describe('completeRegister', () => {
        it('crea un usuario concatenando curp + estado', async () => {
            const input = { email: 'nuevo@ejemplo.com', curp: 'ABCD123456HDFXXX0', full_name: 'Ana López', estado: '1' };
            const fakeUser = { id: 'uuid-new', email: input.email, full_name: input.full_name, curp: input.curp + input.estado, created_at: new Date(), updated_at: new Date() };
            (prismaMock.user.create as jest.Mock).mockResolvedValue(fakeUser);

            const result = await service.completeRegister(input);

            expect(prismaMock.user.create).toHaveBeenCalledWith({
                data: {
                    email: input.email,
                    curp: input.curp + input.estado,
                    full_name: input.full_name,
                },
            });
            expect(result).toEqual(fakeUser);
        });
    });
});
