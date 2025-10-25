import type { Request, Response } from "express";
import { prisma } from "../db.js";
import Send from "../utils/response.utils.js";

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    role: string;
  };
}

class AdminController {
  // Get all creator applications
  static getAllApplications = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return Send.unauthorized(res, null, "User not authenticated");
      }

      // Check if user is admin
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
      });

      if (user?.role !== "admin") {
        return Send.forbidden(res, null, "Admin access required");
      }

      // Fetch all applications with related data
      const applications = await prisma.creator_applications.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              creator_profile: true,
            },
          },
        },
        orderBy: {
          submitted_at: "desc",
        },
      });

      // Fetch social links for all users
      const userIds = applications.map((app: any) => app.user_id);
      const socialLinks = await prisma.creator_social_links.findMany({
        where: {
          user_id: {
            in: userIds,
          },
        },
      });

      // Transform the data to match the frontend interface
      const transformedApplications = applications.map((app: any) => {
        const profile = app.user.creator_profile;
        const userSocialLinks = socialLinks.filter(
          (link: any) => link.user_id === app.user_id
        );

        return {
          id: app.id,
          user_id: app.user_id,
          full_name: profile?.full_name || "",
          creator_handle: profile?.creator_handle || "",
          email: app.user.email,
          phone_number: profile?.phone_number || null,
          bio: profile?.bio || "",
          category: profile?.category || "",
          custom_category: profile?.custom_category || null,
          profile_picture: profile?.profile_picture || null,
          token_name: profile?.token_name || "",
          token_symbol: profile?.token_symbol || "",
          ico_supply: profile?.ico_supply || 0,
          funding_goal: profile?.funding_goal || null,
          token_pitch: profile?.token_pitch || "",
          government_id_url: "", // From creator_documents
          content_ownership_declared: app.content_ownership_declared,
          engagement_metrics: profile?.engagement_metrics || null,
          state: app.state,
          submitted_at: app.submitted_at,
          reviewed_at: app.reviewed_at,
          rejection_reason: app.rejection_reason,
          social_links: userSocialLinks.map((link: any) => ({
            platform: link.platform,
            handle: link.handle,
            url: link.url,
            follower_count: link.follower_count,
          })),
        };
      });

      return Send.success(res, transformedApplications, "Applications retrieved");
    } catch (error: any) {
      console.error("Get all applications error:", error);
      return Send.error(res, null, "Failed to retrieve applications");
    }
  };

  // Get application by ID
  static getApplicationById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
      const { id } = req.params as { id: string };

      if (!userId) {
        return Send.unauthorized(res, null, "User not authenticated");
      }

      // Check if user is admin
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
      });

      if (user?.role !== "admin") {
        return Send.forbidden(res, null, "Admin access required");
      }

      const application: any = await prisma.creator_applications.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              creator_profile: true,
            },
          },
        },
      });

      if (!application) {
        return Send.notFound(res, null, "Application not found");
      }

      // Fetch social links
      const socialLinks = await prisma.creator_social_links.findMany({
        where: {
          user_id: application.user_id,
        },
      });

      // Fetch government ID document
      const govIdDoc = await prisma.creator_documents.findFirst({
        where: {
          user_id: application.user_id,
          type: "government_id",
        },
      });

      // Transform the data
      const profile = application.user.creator_profile;
      const transformedApplication = {
        id: application.id,
        user_id: application.user_id,
        full_name: profile?.full_name || "",
        creator_handle: profile?.creator_handle || "",
        email: application.user.email,
        phone_number: profile?.phone_number || null,
        bio: profile?.bio || "",
        category: profile?.category || "",
        custom_category: profile?.custom_category || null,
        profile_picture: profile?.profile_picture || null,
        token_name: profile?.token_name || "",
        token_symbol: profile?.token_symbol || "",
        ico_supply: profile?.ico_supply || 0,
        funding_goal: profile?.funding_goal || null,
        token_pitch: profile?.token_pitch || "",
        government_id_url: govIdDoc?.file_url || "",
        content_ownership_declared: application.content_ownership_declared,
        engagement_metrics: profile?.engagement_metrics || null,
        state: application.state,
        submitted_at: application.submitted_at,
        reviewed_at: application.reviewed_at,
        rejection_reason: application.rejection_reason,
        social_links: socialLinks.map((link: any) => ({
          platform: link.platform,
          handle: link.handle,
          url: link.url,
          follower_count: link.follower_count,
        })),
      };

      return Send.success(res, transformedApplication, "Application retrieved");
    } catch (error: any) {
      console.error("Get application by ID error:", error);
      return Send.error(res, null, "Failed to retrieve application");
    }
  };

  // Approve application
  static approveApplication = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
      const { id } = req.params as { id: string };

      if (!userId) {
        return Send.unauthorized(res, null, "User not authenticated");
      }

      // Check if user is admin
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return Send.forbidden(res, null, "Admin access required");
      }

      // Get current application
      const currentApplication = await prisma.creator_applications.findUnique({
        where: { id },
      });

      if (!currentApplication) {
        return Send.notFound(res, null, "Application not found");
      }

      // Update application in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update application state to approved
        const application = await tx.creator_applications.update({
          where: { id },
          data: {
            state: "approved",
            approved_at: new Date(),
            reviewed_at: new Date(),
            rejection_reason: null,
          },
        });

        // Activate creator profile
        await tx.creator_profiles.updateMany({
          where: { user_id: currentApplication.user_id },
          data: { status: "active" },
        });

        // Update user role to creator
        await tx.users.update({
          where: { id: currentApplication.user_id },
          data: { role: "creator" },
        });

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: currentApplication.user_id,
            action: "application_approved",
            actor: userId,
            metadata: {
              old_state: currentApplication.state,
              new_state: "approved",
              application_id: id,
            },
          },
        });

        return application;
      });

      return Send.success(
        res,
        result,
        "Application approved successfully"
      );
    } catch (error: any) {
      console.error("Approve application error:", error);
      return Send.error(res, null, "Failed to approve application");
    }
  };

  // Reject application
  static rejectApplication = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
      const { id } = req.params as { id: string };
      const { reason } = req.body;

      if (!userId) {
        return Send.unauthorized(res, null, "User not authenticated");
      }

      // Check if user is admin
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return Send.forbidden(res, null, "Admin access required");
      }

      // Get current application
      const currentApplication = await prisma.creator_applications.findUnique({
        where: { id },
      });

      if (!currentApplication) {
        return Send.notFound(res, null, "Application not found");
      }

      // Update application in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update application state to rejected
        const application = await tx.creator_applications.update({
          where: { id },
          data: {
            state: "rejected",
            reviewed_at: new Date(),
            rejection_reason: reason || "Application rejected by admin",
          },
        });

        // Deactivate creator profile if it exists
        await tx.creator_profiles.updateMany({
          where: { user_id: currentApplication.user_id },
          data: { status: "inactive" },
        });

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: currentApplication.user_id,
            action: "application_rejected",
            actor: userId,
            metadata: {
              old_state: currentApplication.state,
              new_state: "rejected",
              rejection_reason: reason || "Application rejected by admin",
              application_id: id,
            },
          },
        });

        return application;
      });

      return Send.success(
        res,
        result,
        "Application rejected successfully"
      );
    } catch (error: any) {
      console.error("Reject application error:", error);
      return Send.error(res, null, "Failed to reject application");
    }
  };

  // Update application state
  static updateApplicationState = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
      const { id } = req.params as { id: string };
      const { state } = req.body;

      if (!userId) {
        return Send.unauthorized(res, null, "User not authenticated");
      }

      // Check if user is admin
      const user = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return Send.forbidden(res, null, "Admin access required");
      }

      // Get current application
      const currentApplication = await prisma.creator_applications.findUnique({
        where: { id },
      });

      if (!currentApplication) {
        return Send.notFound(res, null, "Application not found");
      }

      // Update application in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update application state
        const application = await tx.creator_applications.update({
          where: { id },
          data: {
            state,
            ...(state === "approved" && { approved_at: new Date() }),
            ...(state === "under_review" && { reviewed_at: new Date() }),
            ...(state === "rejected" && { reviewed_at: new Date() }),
          },
        });

        // Handle state-specific actions
        if (state === "approved") {
          // Activate creator profile
          await tx.creator_profiles.updateMany({
            where: { user_id: currentApplication.user_id },
            data: { status: "active" },
          });

          // Update user role to creator
          await tx.users.update({
            where: { id: currentApplication.user_id },
            data: { role: "creator" },
          });
        } else if (state === "rejected" || state === "inactive") {
          // Deactivate creator profile
          await tx.creator_profiles.updateMany({
            where: { user_id: currentApplication.user_id },
            data: { status: "inactive" },
          });
        }

        // Log the action
        await tx.verification_logs.create({
          data: {
            user_id: currentApplication.user_id,
            action: "state_changed",
            actor: userId,
            metadata: {
              old_state: currentApplication.state,
              new_state: state,
              application_id: id,
            },
          },
        });

        return application;
      });

      return Send.success(
        res,
        result,
        "Application state updated successfully"
      );
    } catch (error: any) {
      console.error("Update application state error:", error);
      return Send.error(res, null, "Failed to update application state");
    }
  };
}

export default AdminController;
