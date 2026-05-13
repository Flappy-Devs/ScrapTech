import "react-native-reanimated";
import "@/src/i18n/config";

import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment } from "react";

import { useAuth } from "@/src/features/auth";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function RootLayout() {
	useAuth();
	const { isLoading } = useAuthStore();

	if (isLoading) return null;

	return (
		<Fragment>
			<Slot />
			<StatusBar style="auto" />
		</Fragment>
	);
}
