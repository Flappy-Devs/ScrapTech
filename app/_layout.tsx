import "react-native-reanimated";
import "@/src/i18n/config";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useAuthBootstrap } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function RootLayout() {
	useAuthBootstrap();

	const { session, isLoading } = useAuthStore();

	if (isLoading) {
		return null;
	}

	return (
		<>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Protected guard={!session}>
					<Stack.Screen name="(auth)" />
				</Stack.Protected>

				<Stack.Protected guard={Boolean(session)}>
					<Stack.Screen name="(app)" />
				</Stack.Protected>
			</Stack>

			<StatusBar style="auto" />
		</>
	);
}