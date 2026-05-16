import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function AppLayout() {
	const color = useThemeColors();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: color.highlight.medium,
				tabBarInactiveTintColor: color.neutral.dark.lightest,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					headerShown: false,
					tabBarLabel: "Trang chủ",
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons
							name={focused ? "home" : "home-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="order-history"
				options={{
					headerShown: false,
					tabBarLabel: "Lịch sử đơn hàng",
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons
							name={focused ? "receipt" : "receipt-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="user-info"
				options={{
					headerShown: false,
					tabBarLabel: "Thông tin người dùng",
					tabBarIcon: ({ color, size, focused }) => (
						<Ionicons
							name={focused ? "person-circle" : "person-circle-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="settings"
				options={{
					headerShown: false,
					href: null,
				}}
			/>

			<Tabs.Screen
				name="privacy-safety"
				options={{
					headerShown: false,
					href: null,
				}}
			/>

			<Tabs.Screen
				name="notifications"
				options={{
					headerShown: false,
					href: null,
				}}
			/>

			<Tabs.Screen
				name="orders"
				options={{
					href: null,
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}
