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

// Danh sách các route thuộc luồng xác thực mới (FE mẫu)
const AUTH_ROUTES = ["SplashScreen", "LoginScreen", "VerifyOtpScreen", "Onboarding1Screen", "Onboarding2Screen", "Onboarding3Screen"];

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

		const currentRoute = segments[0] as string;
		const inAuthRoute = AUTH_ROUTES.includes(currentRoute) || currentRoute === "(auth)";
		const inAppRoute = currentRoute === "(app)" || currentRoute === "MyOrdersScreen";
		const hasSession = !!session;

		if (!hasSession && !inAuthRoute) {
			// Chưa đăng nhập → vào SplashScreen (màn hình mới từ FE mẫu)
			router.replace("/SplashScreen");
		} else if (hasSession && inAuthRoute) {
			// Đã đăng nhập → vào màn hình chính
			router.replace("/MyOrdersScreen");
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
