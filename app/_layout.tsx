import "react-native-reanimated";
import "@/src/i18n/config";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useAuthBootstrap } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useOnboardingStore } from "@/src/store/useOnboardingStore";
import { AppQueryProvider } from "@/src/providers/query-provider";

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
					guard={hasCompletedOnboarding && Boolean(session)}
				>
					<Stack.Screen name="(app)" />
				</Stack.Protected>
			</Stack>

			<StatusBar style="auto" />
		</AppQueryProvider>
	);
}