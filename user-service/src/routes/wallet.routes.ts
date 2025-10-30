import AuthMiddleware from "../middlewares/auth.middleware";
import BaseRouter, { type RouteConfig } from "./router";
import WalletController from "../controllers/wallet.controller";

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