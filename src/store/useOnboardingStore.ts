import { create } from "zustand";

import {
	getHasCompletedOnboarding,
	setHasCompletedOnboarding,
} from "@/src/features/onboarding/onboarding-storage";

type OnboardingStore = {
	hasCompletedOnboarding: boolean;
	isLoading: boolean;

	bootstrapOnboarding: () => Promise<void>;
	completeOnboarding: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
	hasCompletedOnboarding: false,
	isLoading: true,

	bootstrapOnboarding: async () => {
		const hasCompletedOnboarding = await getHasCompletedOnboarding();

		set({
			hasCompletedOnboarding,
			isLoading: false,
		});
	},

	completeOnboarding: async () => {
		await setHasCompletedOnboarding();

		set({
			hasCompletedOnboarding: true,
		});
	},
}));