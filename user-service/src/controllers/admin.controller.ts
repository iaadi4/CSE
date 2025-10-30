import type { Request, Response } from "express";
import { prisma } from "../db";
import Send from "../utils/response.utils";
import { createSolanaToken } from "../helper/token-creation.helper";

class AdminController {
  // Get all creator applications
  static getAllApplications = async (
    req: Request,
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
    req: Request,
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
  static approveApplication = async (req: Request, res: Response) => {
    try {
      const userId = req.userId; // Admin user ID
      const { id } = req.params as { id: string }; // Application ID

      if (!userId) {
        return Send.unauthorized(res, null, "User not authenticated");
      }

      const adminUser = await prisma.users.findUnique({
        where: { id: Number(userId) },
        select: { role: true },
      });

      if (adminUser?.role !== "admin") {
        return Send.forbidden(res, null, "Admin access required");
      }

      const applicationToApprove = await prisma.creator_applications.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              creator_profile: {
                select: {
                  token_name: true,
                  token_symbol: true,
                  ico_supply: true,
                  wallet: true,
                },
              },
            },
          },
        },
      });

      if (!applicationToApprove) {
        return Send.notFound(res, null, "Application not found");
      }

      const profile = applicationToApprove.user.creator_profile;
      if (
        !profile ||
        !profile.token_name ||
        !profile.token_symbol ||
        !profile.wallet ||
        profile.ico_supply === null ||
        profile.ico_supply === undefined
      ) {
        return Send.error(
          res,
          null,
          "Creator profile is incomplete. Cannot create token without token name, symbol, supply, and wallet address."
        );
      }

      const {
        token_name,
        token_symbol,
        ico_supply,
        wallet: creatorWalletAddress,
      } = profile;
      const { user_id, state: old_state } = applicationToApprove;

      let supplyAsNumber: number;
      try {
        if (ico_supply > BigInt(Number.MAX_SAFE_INTEGER)) {
          throw new Error("ICO supply is too large to be processed safely.");
        }
        supplyAsNumber = Number(ico_supply);
      } catch (e: any) {
        console.error("Failed to convert BigInt supply:", e);
        return Send.error(res, null, e.message || "Invalid ICO supply value.");
      }

      let mintAddress: string;
      try {
        console.log(`Starting token creation for user ${user_id}...`);
        mintAddress = await createSolanaToken(
          {
            name: token_name,
            symbol: token_symbol,
            supply: supplyAsNumber,
          },
          creatorWalletAddress
        );
        console.log(`Token creation successful. Mint: ${mintAddress}`);
      } catch (e: any) {
        console.error("Solana token creation failed:", e);
        return Send.error(
          res,
          null,
          `Failed to create token on Solana: ${e.message}`
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const newToken = await tx.creator_token.create({
          data: {
            user_id: user_id,
            name: token_name,
            symbol: token_symbol,
            total_supply: ico_supply,
            mintAddress: mintAddress,
          },
        });

        const application = await tx.creator_applications.update({
          where: { id },
          data: {
            state: "approved",
            approved_at: new Date(),
            reviewed_at: new Date(),
            rejection_reason: null,
          },
        });

        await tx.creator_profiles.updateMany({
          where: { user_id: user_id },
          data: { status: "active" },
        });

        await tx.users.update({
          where: { id: user_id },
          data: { role: "creator" },
        });

        await tx.verification_logs.create({
          data: {
            user_id: user_id,
            action: "application_approved_and_token_created",
            actor: userId.toString(),
            metadata: {
              old_state: old_state,
              new_state: "approved",
              application_id: id,
              token_id: newToken.id,
              mint_address: mintAddress,
            },
          },
        });

        return application;
      });

      return Send.success(
        res,
        result,
        "Application approved and creator token created successfully"
      );
    } catch (error: any) {
      console.error("Approve application database transaction error:", error);
      return Send.error(
        res,
        null,
        "Failed to approve application in database after token was created."
      );
    }
  };

  // Reject application
  static rejectApplication = async (
    req: Request,
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
            actor: userId.toString(),
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
    req: Request,
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
            actor: userId.toString(),
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
