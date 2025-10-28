import AuthMiddleware from "../middlewares/auth.middleware.js";
import BaseRouter, { type RouteConfig } from "./router.js";
import ValidationMiddleware from "../middlewares/validation.middleware.js";
import WalletController from "../controllers/wallet.controller.js";

class WalletRouter extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                method: "post",
                path: "/deposit-address",
                middlewares: [
                    AuthMiddleware.authenticateUser,
                ],
                handler: WalletController.createDepositAddress
            }
        ]
    }
}

export default new WalletRouter().router;