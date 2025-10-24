import AuthMiddleware from "../middlewares/auth.middleware.js";
import BaseRouter, { type RouteConfig } from "./router.js";
import UserController from "../controllers/user.controller.js";

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