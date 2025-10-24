import authConfig from "../config/auth.config.js";
import Send from "../utils/response.utils.js";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface DecodedToken {
    userId: number;
}

class AuthMiddleware {
    static authenticateUser = (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken;

        if (!token) {
            return Send.unauthorized(res, { message: "No access token provided" });
        }

        try {
            const decodedToken = jwt.verify(token, authConfig.secret) as DecodedToken;

            (req as any).userId = decodedToken.userId;

            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return Send.unauthorized(res, { message: "Access token expired", code: "TOKEN_EXPIRED" });
            }
            console.error("Authentication failed:", error);
            return Send.unauthorized(res, { message: "Invalid access token" });
        }
    };

    static refreshTokenValidation = (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return Send.unauthorized(res, { message: "No refresh token provided" });
        }

        try {
            const decodedToken = jwt.verify(refreshToken, authConfig.refresh_secret) as { userId: number };

            (req as any).userId = decodedToken.userId;

            next();
        } catch (error) {
            console.error("Refresh Token authentication failed:", error);

            return Send.unauthorized(res, { message: "Invalid or expired refresh token" });
        }
    };
}

export default AuthMiddleware;