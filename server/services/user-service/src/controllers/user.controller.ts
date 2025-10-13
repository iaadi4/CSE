import Send from "../utils/response.utils.js";
import { prisma } from "../db.js";
import type { Request, Response } from "express";

class UserController {
    static getUser = async (req: Request, res: Response) => {        
        try {
            const userId = (req as any).userId;

            const user = await prisma.users.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    created_at: true,
                }
            });

            if (!user) {
                return Send.notFound(res, {}, "User not found");
            }

            return Send.success(res, { user });
        } catch (error) {
            console.error("Error fetching user info:", error);
            return Send.error(res, {}, "Internal server error");
        }
    };
}

export default UserController;