import ValidationMiddleware from "../middlewares/validation.middleware.js";
import BaseRouter, { type RouteConfig } from "./router.js";
import {
  applyCreatorSchema,
  updateProfileSchema,
  addSocialLinkSchema,
  updateApplicationSchema,
  uploadDocumentSchema,
  updateDocumentStatusSchema,
  getApplicationSchema,
} from "../validations/creator.schema.js";
import CreatorController from "../controllers/creator.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

class CreatorRouter extends BaseRouter {
  protected routes(): RouteConfig[] {
    return [
      // Creator application endpoints
      {
        method: "post",
        path: "/apply",
        middlewares: [
          AuthMiddleware.authenticateUser,
          ValidationMiddleware.validateBody(applyCreatorSchema.shape.body),
        ],
        handler: CreatorController.apply,
      },
      {
        method: "get",
        path: "/application",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: CreatorController.getMyApplication,
      },
      {
        method: "get",
        path: "/applications/:id",
        middlewares: [AuthMiddleware.authenticateUser],
        handler: CreatorController.getApplication,
      },
      {
        method: "patch",
        path: "/applications/:id",
        middlewares: [
          AuthMiddleware.authenticateUser,
          ValidationMiddleware.validateBody(
            updateApplicationSchema.shape.body
          ),
        ],
        handler: CreatorController.updateApplication,
      },

      // Creator profile endpoints
      {
        method: "patch",
        path: "/profile",
        middlewares: [
          AuthMiddleware.authenticateUser,
          ValidationMiddleware.validateBody(updateProfileSchema.shape.body),
        ],
        handler: CreatorController.updateProfile,
      },

      // Social links endpoints
      {
        method: "post",
        path: "/social-links",
        middlewares: [
          AuthMiddleware.authenticateUser,
          ValidationMiddleware.validateBody(addSocialLinkSchema.shape.body),
        ],
        handler: CreatorController.addSocialLink,
      },

      // Document endpoints
      {
        method: "post",
        path: "/documents",
        middlewares: [
          AuthMiddleware.authenticateUser,
          ValidationMiddleware.validateBody(uploadDocumentSchema.shape.body),
        ],
        handler: CreatorController.uploadDocument,
      },
      {
        method: "patch",
        path: "/documents/:id",
        middlewares: [
          AuthMiddleware.authenticateUser,
          ValidationMiddleware.validateBody(
            updateDocumentStatusSchema.shape.body
          ),
        ],
        handler: CreatorController.updateDocumentStatus,
      },
    ];
  }
}

export default new CreatorRouter().router;
