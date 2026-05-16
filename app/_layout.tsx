import "react-native-reanimated";
import "@/src/i18n/config";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";

import { useAuthBootstrap } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useOnboardingStore } from "@/src/store/useOnboardingStore";
import { AppQueryProvider } from "@/src/providers/query-provider";
import { useMyProfile } from "@/src/features/profile/profile.hooks";

export default function RootLayout() {
	useAuthBootstrap();

	const {
		session,
		isLoading: isAuthLoading,
	} = useAuthStore();

	const {
		hasCompletedOnboarding,
		isLoading: isOnboardingLoading,
		bootstrapOnboarding,
	} = useOnboardingStore();

	useEffect(() => {
		bootstrapOnboarding();
	}, [bootstrapOnboarding]);

	if (isAuthLoading || isOnboardingLoading) {
		return null;
	}

	return (
		<AppQueryProvider>
			<RootNavigator
				session={session}
				hasCompletedOnboarding={hasCompletedOnboarding}
			/>

			<StatusBar style="auto" />
		</AppQueryProvider>
	);
}

function RootNavigator({
	session,
	hasCompletedOnboarding,
}: {
	session: Session | null;
	hasCompletedOnboarding: boolean;
}) {
	const shouldLoadProfile =
		hasCompletedOnboarding && Boolean(session);

	const {
		data: profile,
		isLoading: isProfileLoading,
	} = useMyProfile(shouldLoadProfile);

	if (
		shouldLoadProfile &&
		isProfileLoading
	) {
		return null;
	}

	const isSeller = profile?.role === "seller";
	const isAdmin = profile?.role === "admin";

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Protected guard={!hasCompletedOnboarding}>
				<Stack.Screen name="onboarding" />
			</Stack.Protected>

			<Stack.Protected
				guard={hasCompletedOnboarding && !session}
			>
				<Stack.Screen name="(auth)" />
			</Stack.Protected>

			<Stack.Protected
				guard={
					hasCompletedOnboarding &&
					Boolean(session) &&
					isSeller
				}
			>
				<Stack.Screen name="(app)" />
			</Stack.Protected>

			<Stack.Protected
				guard={
					hasCompletedOnboarding &&
					Boolean(session) &&
					isAdmin
				}
			>
				<Stack.Screen name="(admin)" />
			</Stack.Protected>
		</Stack>
	);
}
