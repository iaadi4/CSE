import type { Request, Response } from "express";
import * as z from "zod";
import { prisma } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authConfig from "../config/auth.config.js";
import type authSchema from "../validations/auth.schema.js";
import Send from "../utils/response.utils.js";

class AuthController {
    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body as z.infer<typeof authSchema.login>;
        try {
            const user = await prisma.users.findUnique({
                where: { email }
            });
            if (!user) {
                return Send.error(res, null, "Invalid credentials");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return Send.error(res, null, "Invalid credentials.");
            }

            const accessToken = jwt.sign(
                { userId: user.id },
                authConfig.secret,
                { expiresIn: authConfig.secret_expires_in as any }
            );

            const refreshToken = jwt.sign(
                { userId: user.id, },
                authConfig.refresh_secret,
                { expiresIn: authConfig.refresh_secret_expires_in as any }
            );

            await prisma.users.update({
                where: { id: user.id },
                data: { refresh_token: refreshToken }
            });

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000,
                sameSite: "strict"
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "strict"
            });

            return Send.success(res, {
                id: user.id,
                username: user.username,
                email: user.email
            });
        } catch (error) {
            console.error("Login error:", error);
            return Send.error(res, null, "Login failed");
        }
    }

    static register = async (req: Request, res: Response) => {
        const { username, email, role, password } = req.body as z.infer<typeof authSchema.register>;
        try {
            const existingUser = await prisma.users.findUnique({
                where: { email }
            });
            if (existingUser) {
                return Send.error(res, null, "Email is already registered");
            }
            
            const password_hash = await bcrypt.hash(password, 10);
            const newUser = await prisma.users.create({
                data: {
                    username,
                    email,
                    role,
                    password_hash
                }
            });

            return Send.success(res, {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            });
        } catch (error) {
            console.error("Registration error:", error);
            return Send.error(res, null, "Registration failed");
        }
    }

    static logout = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            if (userId) {
                await prisma.users.update({
                    where: { id: userId },
                    data: { refresh_tokens: null } 
                });
            }

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            return Send.success(res, null, "Logged out successfully.");

        } catch (error) {
            console.error("Logout failed:", error);
            return Send.error(res, null, "Logout failed.");
        }
    }

    static refreshToken = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;
            const refreshToken = req.cookies.refreshToken;

            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user || !user.refresh_token) {
                return Send.unauthorized(res, "Refresh token not found");
            }

            if (user.refresh_token !== refreshToken) {
                return Send.unauthorized(res, { message: "Invalid refresh token" });
            }

            const newAccessToken = jwt.sign(
                { userId: user.id },
                authConfig.secret,
                { expiresIn: authConfig.secret_expires_in as any }
            );

            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000,
                sameSite: "strict"
            });

            return Send.success(res, { message: "Access token refreshed successfully" });
        } catch (error) {
            console.error("Refresh token error:", error);
            return Send.unauthorized(res, null, "Invalid or expired refresh token");
        }
    }
}

export default AuthController;