import { z } from "zod";

// Application states enum
const applicationStates = [
  "pending_submission",
  "under_review",
  "kyc_pending",
  "approved",
  "rejected",
] as const;

// Document types enum
const documentTypes = ["government_id", "tax", "residence", "other"] as const;

// Social platforms enum
const socialPlatforms = [
  "youtube",
  "tiktok",
  "instagram",
  "twitter",
  "other",
] as const;

// Creator categories
const creatorCategories = [
  "Musician",
  "Influencer",
  "Artist",
  "Filmmaker",
  "Gamer",
  "Other",
] as const;

// Apply as creator (initial submission with all required fields)
export const applyCreatorSchema = z.object({
  body: z
    .object({
      // Basic Information
      full_name: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must not exceed 100 characters"),
      phone_number: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
        .optional(),

      // Creator Profile
      creator_handle: z
        .string()
        .min(3, "Creator handle must be at least 3 characters")
        .max(30, "Creator handle must not exceed 30 characters")
        .regex(
          /^[a-zA-Z0-9_-]+$/,
          "Creator handle can only contain letters, numbers, hyphens, and underscores"
        ),
      bio: z
        .string()
        .min(50, "Bio must be at least 50 characters")
        .max(500, "Bio must not exceed 500 characters"),
      profile_picture: z
        .string()
        .url("Profile picture must be a valid URL")
        .optional(),
      category: z.enum(creatorCategories),
      custom_category: z
        .string()
        .max(50, "Custom category must not exceed 50 characters")
        .optional(),

      // Influence Metrics
      engagement_metrics: z
        .string()
        .max(200, "Engagement metrics must not exceed 200 characters")
        .optional(),

      // Token Launch Details
      token_name: z
        .string()
        .min(3, "Token name must be at least 3 characters")
        .max(50, "Token name must not exceed 50 characters"),
      token_symbol: z
        .string()
        .min(3, "Token symbol must be at least 3 characters")
        .max(10, "Token symbol must not exceed 10 characters")
        .regex(/^[A-Z]+$/, "Token symbol must be uppercase letters only"),
      ico_supply: z
        .number()
        .positive("ICO supply must be a positive number")
        .min(1000, "ICO supply must be at least 1,000 tokens"),
      funding_goal: z
        .number()
        .positive("Funding goal must be a positive number")
        .optional(),
      token_pitch: z
        .string()
        .min(100, "Token pitch must be at least 100 characters")
        .max(1000, "Token pitch must not exceed 1000 characters"),

      // Compliance
      content_ownership_declared: z
        .boolean()
        .refine((val) => val === true, {
          message: "You must declare content ownership to proceed",
        }),

      // Social Media Links (at least one required)
      social_links: z
        .array(
          z.object({
            platform: z.enum(socialPlatforms),
            handle: z
              .string()
              .min(1, "Handle is required")
              .max(100, "Handle must not exceed 100 characters"),
            url: z
              .string()
              .url("URL must be a valid URL")
              .max(500, "URL must not exceed 500 characters"),
            follower_count: z
              .number()
              .int()
              .nonnegative("Follower count must be a non-negative number")
              .optional(),
          })
        )
        .min(1, "At least one social media link is required")
        .max(5, "Maximum 5 social media links allowed"),

      // Government ID (file URL after upload)
      government_id_url: z
        .string()
        .url("Government ID must be a valid URL"),
    })
    .refine(
      (data) => {
        // If category is "Other", custom_category must be provided
        if (data.category === "Other" && !data.custom_category) {
          return false;
        }
        return true;
      },
      {
        message: "Custom category is required when category is 'Other'",
        path: ["custom_category"],
      }
    ),
});

// Update creator profile
export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must not exceed 100 characters")
      .optional(),
    phone_number: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional()
      .nullable(),
    creator_handle: z
      .string()
      .min(3, "Creator handle must be at least 3 characters")
      .max(30, "Creator handle must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Creator handle can only contain letters, numbers, hyphens, and underscores"
      )
      .optional(),
    bio: z
      .string()
      .min(50, "Bio must be at least 50 characters")
      .max(500, "Bio must not exceed 500 characters")
      .optional(),
    profile_picture: z
      .string()
      .url("Profile picture must be a valid URL")
      .optional()
      .nullable(),
    category: z.enum(creatorCategories).optional(),
    custom_category: z
      .string()
      .max(50, "Custom category must not exceed 50 characters")
      .optional()
      .nullable(),
    engagement_metrics: z
      .string()
      .max(200, "Engagement metrics must not exceed 200 characters")
      .optional()
      .nullable(),
    token_name: z
      .string()
      .min(3, "Token name must be at least 3 characters")
      .max(50, "Token name must not exceed 50 characters")
      .optional(),
    token_pitch: z
      .string()
      .min(100, "Token pitch must be at least 100 characters")
      .max(1000, "Token pitch must not exceed 1000 characters")
      .optional(),
    funding_goal: z
      .number()
      .positive("Funding goal must be a positive number")
      .optional()
      .nullable(),
  }),
});

// Add social link
export const addSocialLinkSchema = z.object({
  body: z.object({
    platform: z.enum(socialPlatforms, {
      message: `Platform must be one of: ${socialPlatforms.join(", ")}`,
    }),
    handle: z
      .string()
      .min(1, "Handle is required")
      .max(100, "Handle must not exceed 100 characters"),
    url: z
      .string()
      .url("URL must be a valid URL")
      .max(500, "URL must not exceed 500 characters"),
    follower_count: z
      .number()
      .int()
      .nonnegative("Follower count must be a non-negative number")
      .optional(),
  }),
});

// Update application (admin only)
export const updateApplicationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID"),
  }),
  body: z.object({
    state: z.enum(applicationStates, {
      message: `State must be one of: ${applicationStates.join(", ")}`,
    }),
    rejection_reason: z
      .string()
      .max(1000, "Rejection reason must not exceed 1000 characters")
      .optional(),
  }),
});

// Upload document
export const uploadDocumentSchema = z.object({
  body: z.object({
    type: z.enum(["government_id", "tax", "residence", "other"]),
    file_url: z
      .string()
      .url("File URL must be a valid URL")
      .max(500, "File URL must not exceed 500 characters"),
    notes: z
      .string()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
  }),
});

// Update document status (admin only)
export const updateDocumentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Document ID must be a valid UUID"),
  }),
  body: z.object({
    status: z.enum(["pending", "verified", "rejected"]),
    notes: z
      .string()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
  }),
});

// Get application by ID
export const getApplicationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID"),
  }),
});
