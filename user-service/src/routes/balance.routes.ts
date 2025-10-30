import AuthMiddleware from "../middlewares/auth.middleware";
import BaseRouter, { type RouteConfig } from "./router";
import BalanceController from "../controllers/balance.controller";
import type { Request, Response, NextFunction } from "express";

// Middleware that allows either JWT or service authentication
const authenticateUserOrService = (req: Request, res: Response, next: NextFunction) => {
    // Check for service API key first
    const serviceKey = req.headers['x-service-key'];
    if (serviceKey === process.env.SERVICE_API_KEY) {
        const userId = req.headers['x-user-id'];
        if (userId) {
            (req as any).userId = parseInt(userId as string);
            return next();
        }
    }
    
    // Fall back to JWT authentication
    return AuthMiddleware.authenticateUser(req, res, next);
};

class BalanceRouter extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                method: "get",
                path: "/",
                middlewares: [
                    authenticateUserOrService,
                ],
                handler: BalanceController.getBalances
            },
            {
                method: "get",
                path: "/:currency",
                middlewares: [
                    authenticateUserOrService,
                ],
                handler: BalanceController.getBalance
            },
            {
                method: "post",
                path: "/lock",
                middlewares: [
                    authenticateUserOrService,
                ],
                handler: BalanceController.lockFunds
            },
            {
                method: "post",
                path: "/unlock",
                middlewares: [
                    authenticateUserOrService,
                ],
                handler: BalanceController.unlockFunds
            },
            {
                method: "post",
                path: "/update",
                middlewares: [
                    authenticateUserOrService,
                ],
                handler: BalanceController.updateBalance
            }
        ]
    }
}

export default new BalanceRouter().router;