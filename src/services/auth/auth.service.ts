import { prisma } from "../../lib/prisma.js"

export class AuthService {
    async completeRegister(data: {email: string, curp: string, full_name: string, estado: string}) {
        const { email, curp, full_name, estado } = data;

        return prisma.user.create({
            data: {
                email,
                curp: curp + estado,
                full_name
            }
        })
    }

    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async findUserById(id: string) {
        return prisma.user.findUnique({
            where: {
                id
            }
        })
    }

}

export default new AuthService();