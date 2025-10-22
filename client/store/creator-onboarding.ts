import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { SocialLink } from "@/lib/api";

interface CreatorOnboardingState {
  // Step 1: Basic Information
  full_name: string;
  phone_number: string;

  // Step 2: Creator Profile
  creator_handle: string;
  bio: string;
  profile_picture: string;
  category: string;
  custom_category: string;

  // Step 3: Social Media
  social_links: SocialLink[];
  engagement_metrics: string;

  // Step 4: Token Details
  token_name: string;
  token_symbol: string;
  ico_supply: number;
  funding_goal: number | undefined;
  token_pitch: string;

  // Step 5: Verification
  government_id_url: string;
  content_ownership_declared: boolean;

  // Progress tracking
  currentStep: number;
  completedSteps: number[];

  // Actions
  setBasicInfo: (data: { full_name: string; phone_number?: string }) => void;
  setCreatorProfile: (data: {
    creator_handle?: string;
    bio?: string;
    profile_picture?: string;
    category?: string;
    custom_category?: string;
  }) => void;
  setSocialMedia: (data: {
    social_links: SocialLink[];
    engagement_metrics?: string;
  }) => void;
  setTokenDetails: (data: {
    token_name?: string;
    token_symbol?: string;
    ico_supply?: number;
    funding_goal?: number;
    token_pitch?: string;
  }) => void;
  setVerification: (data: {
    government_id_url?: string;
    content_ownership_declared?: boolean;
  }) => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  resetOnboarding: () => void;
  getAllData: () => any;
}

const initialState = {
  full_name: "",
  phone_number: "",
  creator_handle: "",
  bio: "",
  profile_picture: "",
  category: "",
  custom_category: "",
  social_links: [],
  engagement_metrics: "",
  token_name: "",
  token_symbol: "",
  ico_supply: 0,
  funding_goal: undefined,
  token_pitch: "",
  government_id_url: "",
  content_ownership_declared: false,
  currentStep: 1,
  completedSteps: [],
};

export const useCreatorOnboardingStore = create<CreatorOnboardingState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setBasicInfo: (data) =>
          set({
            full_name: data.full_name,
            phone_number: data.phone_number,
          }),

        setCreatorProfile: (data) =>
          set((state) => ({
            creator_handle: data.creator_handle ?? state.creator_handle,
            bio: data.bio ?? state.bio,
            profile_picture: data.profile_picture ?? state.profile_picture,
            category: data.category ?? state.category,
            custom_category: data.custom_category ?? state.custom_category,
          })),

        setSocialMedia: (data) =>
          set({
            social_links: data.social_links,
            engagement_metrics: data.engagement_metrics,
          }),

        setTokenDetails: (data) =>
          set((state) => ({
            token_name: data.token_name ?? state.token_name,
            token_symbol: data.token_symbol ?? state.token_symbol,
            ico_supply: data.ico_supply ?? state.ico_supply,
            funding_goal: data.funding_goal ?? state.funding_goal,
            token_pitch: data.token_pitch ?? state.token_pitch,
          })),

        setVerification: (data) =>
          set((state) => ({
            government_id_url: data.government_id_url ?? state.government_id_url,
            content_ownership_declared: data.content_ownership_declared ?? state.content_ownership_declared,
          })),

        setCurrentStep: (step) => set({ currentStep: step }),

        markStepCompleted: (step) =>
          set((state) => ({
            completedSteps: state.completedSteps.includes(step)
              ? state.completedSteps
              : [...state.completedSteps, step],
          })),

        resetOnboarding: () => set(initialState),

        getAllData: () => {
          const state = get();
          return {
            full_name: state.full_name,
            phone_number: state.phone_number || undefined,
            creator_handle: state.creator_handle,
            bio: state.bio,
            profile_picture: state.profile_picture || undefined,
            category: state.category,
            custom_category: state.custom_category || undefined,
            social_links: state.social_links,
            engagement_metrics: state.engagement_metrics || undefined,
            token_name: state.token_name,
            token_symbol: state.token_symbol,
            ico_supply: state.ico_supply,
            funding_goal: state.funding_goal,
            token_pitch: state.token_pitch,
            government_id_url: state.government_id_url,
            content_ownership_declared: state.content_ownership_declared,
          };
        },
      }),
      {
        name: "creator-onboarding-storage",
      }
    )
  )
);
