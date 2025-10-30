import type { Request, Response } from "express";
import { prisma } from "../db";
import Send from "../utils/response.utils";


class CreatorController {
  // Apply as creator (create application)
  static apply = async (req: Request, res: Response) => {
    const {
      // Basic Information
      full_name,
      phone_number,
      // Creator Profile
      creator_handle,
      bio,
      wallet,
      profile_picture,
      category,
      custom_category,
      // Influence Metrics
      engagement_metrics,
      // Token Launch Details
      token_name,
      token_symbol,
      ico_supply,
      funding_goal,
      token_pitch,
      // Compliance
      content_ownership_declared,
      // Social Media Links
      social_links,
      // Government ID
      government_id_url,
    } = req.body;
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    try {
      // Check if user already has an application
      const existingApplication = await prisma.creator_applications.findFirst({
        where: { user_id: Number(userId) },
      });

      if (existingApplication) {
        return Send.error(
          res,
          null,
          "You have already submitted a creator application"
        );
      }

      // Check if creator_handle is already taken
      const existingHandle = await prisma.creator_profiles.findFirst({
        where: { creator_handle },
      });

      if (existingHandle) {
        return Send.error(
          res,
          null,
          "Creator handle is already taken. Please choose another one."
        );
      }

      // Check if token_symbol is already taken
      const existingSymbol = await prisma.creator_profiles.findFirst({
        where: { token_symbol },
      });

      if (existingSymbol) {
        return Send.error(
          res,
          null,
          "Token symbol is already taken. Please choose another one."
        );
      }

      // Create profile, application, social links, and government ID in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create creator profile
        const profile = await tx.creator_profiles.create({
          data: {
            user_id: Number(userId),
            full_name,
            phone_number,
            creator_handle,
            bio,
            wallet,
            profile_picture,
            category,
            custom_category: category === "Other" ? custom_category : null,
            engagement_metrics,
            token_name,
            token_symbol,
            ico_supply,
            funding_goal,
            token_pitch,
            status: "inactive",
          },
        });

        // Create application
        const application = await tx.creator_applications.create({
          data: {
            user_id: Number(userId),
            state: "pending_submission",
            content_ownership_declared,
          },
        });

        // Create social links
        const createdSocialLinks = await Promise.all(
          social_links.map((link: any) =>
            tx.creator_social_links.create({
              data: {
                user_id: Number(userId),
                platform: link.platform,
                handle: link.handle,
                url: link.url,
                follower_count: link.follower_count,
                verified: false,
              },
            })
          )
        );

        // Create government ID document
        const governmentIdDoc = await tx.creator_documents.create({
          data: {
            user_id: Number(userId),
            type: "government_id",
            file_url: government_id_url,
            status: "pending",
          },
        });

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: Number(userId),
            action: "application_submitted",
            actor: userId.toString(),
            metadata: {
              creator_handle,
              token_symbol,
              category,
              social_links_count: social_links.length,
            },
          },
        });

        return {
          profile,
          application,
          social_links: createdSocialLinks,
          government_id: governmentIdDoc,
        };
      });

      return Send.success(res, result, "Application submitted successfully");
    } catch (error) {
      console.error("Creator application error:", error);
      return Send.error(res, null, "Failed to submit application");
    }
  };

  // Get application by ID
  static getApplication = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    if (!id) {
      return Send.badRequest(res, null, "Application ID is required");
    }

    try {
      const application = await prisma.creator_applications.findUnique({
        where: { id: id as string },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!application) {
        return Send.notFound(res, null, "Application not found");
      }

      // Users can only view their own applications (unless admin - check role)
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
      });

      if (application.user_id !== Number(userId) && user?.role !== "admin") {
        return Send.forbidden(res, null, "Forbidden");
      }

      return Send.success(res, application);
    } catch (error) {
      console.error("Get application error:", error);
      return Send.error(res, null, "Failed to retrieve application");
    }
  };

  // Update application state (admin only)
  static updateApplication = async (
    req: Request,
    res: Response
  ) => {
    const { id } = req.params;
    const { state, rejection_reason } = req.body;
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    if (!id) {
      return Send.badRequest(res, null, "Application ID is required");
    }

    try {
      // Check if user is admin
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return Send.forbidden(res, null, "Admin only");
      }

      // Get current application
      const currentApplication = await prisma.creator_applications.findUnique({
        where: { id: id as string },
      });

      if (!currentApplication) {
        return Send.notFound(res, null, "Application not found");
      }

      // Update application in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update application
        const application = await tx.creator_applications.update({
          where: { id: id as string },
          data: {
            state,
            rejection_reason,
            ...(state === "approved" && { approved_at: new Date() }),
            ...(state === "under_review" && { reviewed_at: new Date() }),
          },
        });

        // If approved, activate creator profile
        if (state === "approved") {
          await tx.creator_profiles.updateMany({
            where: { user_id: currentApplication.user_id },
            data: { status: "active" },
          });

          // Update user role to creator
          await tx.users.update({
            where: { id: currentApplication.user_id },
            data: { role: "creator" },
          });
        }

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: currentApplication.user_id,
            action: "state_changed",
            actor: userId.toString(),
            metadata: {
              old_state: currentApplication.state,
              new_state: state,
              rejection_reason,
            },
          },
        });

        return application;
      });

      return Send.success(res, result, "Application updated successfully");
    } catch (error) {
      console.error("Update application error:", error);
      return Send.error(res, null, "Failed to update application");
    }
  };

  // Update creator profile
  static updateProfile = async (req: Request, res: Response) => {
    const {
      full_name,
      phone_number,
      creator_handle,
      bio,
      profile_picture,
      category,
      custom_category,
      engagement_metrics,
      token_name,
      token_pitch,
      funding_goal,
    } = req.body;
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    try {
      // Check if user has a creator profile
      const profile = await prisma.creator_profiles.findUnique({
        where: { user_id: Number(userId) },
      });

      if (!profile) {
        return Send.notFound(res, null, "Creator profile not found");
      }

      // If updating creator_handle, check if it's already taken
      if (creator_handle && creator_handle !== profile.creator_handle) {
        const existingHandle = await prisma.creator_profiles.findFirst({
          where: {
            creator_handle,
            user_id: { not: Number(userId) },
          },
        });

        if (existingHandle) {
          return Send.error(
            res,
            null,
            "Creator handle is already taken. Please choose another one."
          );
        }
      }

      // Update profile
      const updatedProfile = await prisma.$transaction(async (tx) => {
        const updated = await tx.creator_profiles.update({
          where: { user_id: Number(userId) },
          data: {
            ...(full_name && { full_name }),
            ...(phone_number !== undefined && { phone_number }),
            ...(creator_handle && { creator_handle }),
            ...(bio && { bio }),
            ...(profile_picture !== undefined && { profile_picture }),
            ...(category && { category }),
            ...(custom_category !== undefined && { custom_category }),
            ...(engagement_metrics !== undefined && { engagement_metrics }),
            ...(token_name && { token_name }),
            ...(token_pitch && { token_pitch }),
            ...(funding_goal !== undefined && { funding_goal }),
          },
        });

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: Number(userId),
            action: "profile_updated",
            actor: userId.toString(),
            metadata: req.body,
          },
        });

        return updated;
      });

      return Send.success(
        res,
        updatedProfile,
        "Profile updated successfully"
      );
    } catch (error) {
      console.error("Update profile error:", error);
      return Send.error(res, null, "Failed to update profile");
    }
  };

  // Add social link
  static addSocialLink = async (req: Request, res: Response) => {
    const { platform, handle, url, follower_count } = req.body;
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    try {
      // Check if user has a creator profile
      const profile = await prisma.creator_profiles.findUnique({
        where: { user_id: Number(userId) },
      });

      if (!profile) {
        return Send.notFound(res, null, "Creator profile not found");
      }

      // Create social link
      const socialLink = await prisma.creator_social_links.create({
        data: {
          user_id: Number(userId),
          platform,
          handle,
          url,
          follower_count,
          verified: false,
        },
      });

      return Send.success(res, socialLink, "Social link added successfully");
    } catch (error) {
      console.error("Add social link error:", error);
      return Send.error(res, null, "Failed to add social link");
    }
  };

  // Upload document
  static uploadDocument = async (req: Request, res: Response) => {
    const { type, file_url, notes } = req.body;
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    try {
      // Check if user has a creator application
      const application = await prisma.creator_applications.findFirst({
        where: { user_id: Number(userId) },
      });

      if (!application) {
        return Send.badRequest(
          res,
          null,
          "You must submit an application first"
        );
      }

      // Create document
      const document = await prisma.$transaction(async (tx) => {
        const doc = await tx.creator_documents.create({
          data: {
            user_id: Number(userId),
            type,
            file_url,
            notes,
            status: "pending",
          },
        });

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: Number(userId),
            action: "document_uploaded",
            actor: userId.toString(),
            metadata: {
              document_type: type,
            },
          },
        });

        return doc;
      });

      return Send.success(res, document, "Document uploaded successfully");
    } catch (error) {
      console.error("Upload document error:", error);
      return Send.error(res, null, "Failed to upload document");
    }
  };

  // Update document status (admin only)
  static updateDocumentStatus = async (
    req: Request,
    res: Response
  ) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    if (!id) {
      return Send.badRequest(res, null, "Document ID is required");
    }

    try {
      // Check if user is admin
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return Send.forbidden(res, null, "Admin only");
      }

      // Get current document
      const currentDocument = await prisma.creator_documents.findUnique({
        where: { id: id as string },
      });

      if (!currentDocument) {
        return Send.notFound(res, null, "Document not found");
      }

      // Update document
      const document = await prisma.$transaction(async (tx) => {
        const updated = await tx.creator_documents.update({
          where: { id: id as string },
          data: {
            status,
            ...(notes !== undefined && { notes }),
          },
        });

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: currentDocument.user_id,
            action: "document_status_changed",
            actor: userId.toString(),
            metadata: {
              document_id: id,
              old_status: currentDocument.status,
              new_status: status,
              notes,
            },
          },
        });

        return updated;
      });

      return Send.success(
        res,
        document,
        "Document status updated successfully"
      );
    } catch (error) {
      console.error("Update document status error:", error);
      return Send.error(res, null, "Failed to update document status");
    }
  };

  // Get my application (current user)
  static getMyApplication = async (
    req: Request,
    res: Response
  ) => {
    const userId = req.userId;

    if (!userId) {
      return Send.unauthorized(res, null, "Unauthorized");
    }

    try {
      const application = await prisma.creator_applications.findFirst({
        where: { user_id: Number(userId) },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              creator_profile: true,
              creator_documents: {
                orderBy: { created_at: "desc" },
              },
              creator_social_links: true,
            },
          },
        },
      });

      if (!application) {
        return Send.notFound(res, null, "No application found");
      }

      return Send.success(res, application);
    } catch (error) {
      console.error("Get my application error:", error);
      return Send.error(res, null, "Failed to retrieve application");
    }
  };
}

export default CreatorController;
