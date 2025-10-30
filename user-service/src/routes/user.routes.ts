import AuthMiddleware from "../middlewares/auth.middleware";
import BaseRouter, { type RouteConfig } from "./router";
import UserController from "../controllers/user.controller";

class UserRoutes extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                method: "get",
                path: "/info",
                middlewares: [
                    AuthMiddleware.authenticateUser
                ],
                handler: UserController.getUser
            },
        ]
    }
}

export default new UserRoutes().router;