import BaseRouter, { type RouteConfig } from "./router";
import AdminController from "../controllers/admin.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

class AdminRouter extends BaseRouter {
  protected routes(): RouteConfig[] {
    return [
      {
        method: "get",
        path: "/creator-applications",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: AdminController.getAllApplications,
      },
      {
        method: "post",
        path: "/creator-applications/create-token",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: AdminController.createCreatorToken,
      },
      {
        method: "get",
        path: "/creator-applications/:id",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: AdminController.getApplicationById,
      },
      {
        method: "post",
        path: "/creator-applications/:id/approve",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: AdminController.approveApplication,
      },
      {
        method: "post",
        path: "/creator-applications/:id/reject",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: AdminController.rejectApplication,
      },
      {
        method: "patch",
        path: "/creator-applications/:id/state",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: AdminController.updateApplicationState,
      },
    ];
  }
}

export default new AdminRouter().router;
