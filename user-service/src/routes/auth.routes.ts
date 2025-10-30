import ValidationMiddleware from "../middlewares/validation.middleware";
import BaseRouter, { type RouteConfig } from "./router";
import authSchema from "../validations/auth.schema";
import AuthController from "../controllers/auth.controller";
import AuthMiddleware from "../middlewares/auth.middleware";


class AuthRouter extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                method: "post",
                path: "/login",
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.login)
                ],
                handler: AuthController.login
            },
            {
                method: "post",
                path: "/register",
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.register)
                ],
                handler: AuthController.register
            },
            {
                method: "post",
                path: "/logout",
                middlewares: [
                    AuthMiddleware.authenticateUser
                ],
                handler: AuthController.logout
            },

            {
                method: "post",
                path: "/refresh-token",
                middlewares: [
                    AuthMiddleware.refreshTokenValidation
                ],
                handler: AuthController.refreshToken
            },
        ]
    }
}

export default new AuthRouter().router;