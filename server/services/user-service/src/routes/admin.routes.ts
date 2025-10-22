import BaseRouter, { type RouteConfig } from "./router.js";
import AdminController from "../controllers/admin.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

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
