import { z } from "zod";

// Step 1: Basic Information
export const basicInfoSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  phone_number: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

// Step 2: Creator Profile
export const creatorProfileSchema = z
  .object({
    creator_handle: z
      .string()
      .min(3, "Handle must be at least 3 characters")
      .max(30, "Handle must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Handle can only contain letters, numbers, hyphens, and underscores"),
    bio: z
      .string()
      .min(50, "Bio must be at least 50 characters")
      .max(500, "Bio must be at most 500 characters"),
    profile_picture: z.string().url("Invalid URL").optional().or(z.literal("")),
    category: z.enum(["Musician", "Influencer", "Artist", "Filmmaker", "Gamer", "Other"], {
      message: "Please select a category",
    }),
    custom_category: z.string().max(50, "Custom category must be at most 50 characters").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.category === "Other") {
        return data.custom_category && data.custom_category.trim().length > 0;
      }
      return true;
    },
    {
      message: "Custom category is required when 'Other' is selected",
      path: ["custom_category"],
    }
  );

// Step 3: Social Media
export const socialLinkSchema = z.object({
  platform: z.enum(["youtube", "tiktok", "instagram", "twitter", "other"]),
  handle: z
    .string()
    .min(1, "Handle is required")
    .max(100, "Handle must be at most 100 characters"),
  url: z
    .string()
    .url("Invalid URL")
    .max(500, "URL must be at most 500 characters"),
  follower_count: z
    .number()
    .int()
    .min(0, "Follower count must be positive")
    .optional(),
});

export const socialMediaSchema = z.object({
  social_links: z
    .array(socialLinkSchema)
    .min(1, "At least one social media link is required")
    .max(5, "Maximum 5 social media links allowed"),
  engagement_metrics: z
    .string()
    .max(200, "Engagement metrics must be at most 200 characters")
    .optional()
    .or(z.literal("")),
});

// Step 4: Token Details
export const tokenDetailsSchema = z.object({
  token_name: z
    .string()
    .min(3, "Token name must be at least 3 characters")
    .max(50, "Token name must be at most 50 characters"),
  token_symbol: z
    .string()
    .min(3, "Token symbol must be at least 3 characters")
    .max(10, "Token symbol must be at most 10 characters")
    .regex(/^[A-Z]+$/, "Token symbol must be uppercase letters only"),
  ico_supply: z
    .number()
    .min(1000, "ICO supply must be at least 1,000 tokens")
    .positive("ICO supply must be a positive number"),
  funding_goal: z
    .number()
    .positive("Funding goal must be a positive number")
    .optional(),
  token_pitch: z
    .string()
    .min(100, "Token pitch must be at least 100 characters")
    .max(1000, "Token pitch must be at most 1000 characters"),
});

// Step 5: Verification
export const verificationSchema = z.object({
  government_id_url: z.string().url("Please upload a valid government ID"),
  content_ownership_declared: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must certify content ownership to proceed",
    }),
});

// Combined schema for final submission
export const creatorApplicationSchema = basicInfoSchema
  .merge(creatorProfileSchema)
  .merge(socialMediaSchema)
  .merge(tokenDetailsSchema)
  .merge(verificationSchema);

// Type exports
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type CreatorProfileFormData = z.infer<typeof creatorProfileSchema>;
export type SocialMediaFormData = z.infer<typeof socialMediaSchema>;
export type TokenDetailsFormData = z.infer<typeof tokenDetailsSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;
export type CreatorApplicationFormData = z.infer<typeof creatorApplicationSchema>;
