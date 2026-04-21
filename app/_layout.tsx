import "react-native-reanimated";
import "@/src/i18n/config";

import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { useAuth } from "@/src/features/auth";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUIStore } from "@/src/store/useUIStore";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

export default function RootLayout() {
	useAuth();
	const { session, isLoading } = useAuthStore();

	const systemColorScheme = useColorScheme();
	const themeMode = useUIStore((s) => s.themeMode);
	const resolvedTheme = themeMode === "system" ? (systemColorScheme ?? "light") : themeMode;

	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === "(auth)";
		const hasSession = !!session;

		if (!hasSession && !inAuthGroup) {
			router.replace("/(auth)/login");
		} else if (hasSession && inAuthGroup) {
			router.replace("/(app)");
		}
	}, [session, isLoading, segments, router]);

	if (isLoading) return null;

	return (
		<ThemeProvider value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
			<Slot />
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
