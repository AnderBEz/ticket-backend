import { prisma } from "../../lib/prisma.js"

export class AuthService {
    async completeRegister(data: {email: string, curp: string, full_name: string}) {
        const { email, curp, full_name } = data;

        return prisma.user.create({
            data: {
                email,
                curp,
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

}

export default new AuthService();