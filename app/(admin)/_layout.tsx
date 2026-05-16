import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function AdminLayout() {
	const colors = useThemeColors();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.highlight.medium,
				tabBarInactiveTintColor:
					colors.neutral.dark.lightest,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					headerShown: false,
					tabBarLabel: "Đơn hàng",
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons
							name={focused ? "clipboard" : "clipboard-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="history"
				options={{
					headerShown: false,
					tabBarLabel: "Lịch sử",
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons
							name={focused ? "time" : "time-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="prices"
				options={{
					headerShown: false,
					tabBarLabel: "Bảng giá",
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons
							name={focused ? "pricetags" : "pricetags-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					headerShown: false,
					tabBarLabel: "Hồ sơ",
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons
							name={
								focused
									? "person-circle"
									: "person-circle-outline"
							}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="orders"
				options={{
					headerShown: false,
					href: null,
				}}
			/>
		</Tabs>
	);
}