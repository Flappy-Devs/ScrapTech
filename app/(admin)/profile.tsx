import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMyProfile } from "@/src/features/profile/profile.hooks";
import { useAuth } from "@/src/hooks/useAuth";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function AdminProfileScreen() {
	const colors = useThemeColors();
	const { session, signOut } = useAuth();
	const { data: profile, isLoading } = useMyProfile();

	const [isSigningOut, setIsSigningOut] = useState(false);

	const displayName =
		profile?.full_name?.trim() || "Quản trị viên ScrapTech";

	const phone =
		profile?.phone ??
		session?.user.phone ??
		null;

	function handleLogout() {
		Alert.alert(
			"Đăng xuất",
			"Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?",
			[
				{
					text: "Hủy",
					style: "cancel",
				},
				{
					text: "Đăng xuất",
					style: "destructive",
					onPress: async () => {
						try {
							setIsSigningOut(true);
							await signOut();
						} catch (error) {
							const message =
								error instanceof Error
									? error.message
									: "Không thể đăng xuất.";

							Alert.alert(
								"Đăng xuất thất bại",
								message
							);
						} finally {
							setIsSigningOut(false);
						}
					},
				},
			]
		);
	}

	return (
		<SafeAreaView
			style={[
				styles.safeArea,
				{
					backgroundColor:
						colors.neutral.light.lightest,
				},
			]}
		>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.screenLabel}>Admin Profile</Text>

				<View style={styles.profileCard}>
					<View
						style={[
							styles.avatar,
							{
								backgroundColor:
									colors.highlight.lightest,
							},
						]}
					>
						<Ionicons
							name="shield-checkmark"
							size={34}
							color={colors.highlight.medium}
						/>
					</View>

					<Text style={styles.name}>
						{isLoading ? "Đang tải..." : displayName}
					</Text>

					<Text style={styles.phone}>
						{formatPhoneNumber(phone)}
					</Text>

					<View style={styles.roleBadge}>
						<Text style={styles.roleText}>
							Quản trị viên / Collector
						</Text>
					</View>
				</View>

				<View style={styles.menuCard}>
					<Pressable
						style={styles.menuRow}
						onPress={handleLogout}
					>
						<View style={styles.logoutIconWrap}>
							<Ionicons
								name="log-out-outline"
								size={20}
								color="#DC2626"
							/>
						</View>

						<Text style={styles.logoutText}>
							Đăng xuất
						</Text>

						{isSigningOut ? (
							<ActivityIndicator
								size="small"
								color="#DC2626"
							/>
						) : (
							<Ionicons
								name="chevron-forward"
								size={18}
								color="#F87171"
							/>
						)}
					</Pressable>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function formatPhoneNumber(value: string | null) {
	if (!value) return "Chưa cập nhật";

	const normalized = value.startsWith("+84")
		? `0${value.slice(3)}`
		: value;

	const digits = normalized.replace(/\D/g, "");

	if (digits.length === 10) {
		return `${digits.slice(0, 3)} ${digits.slice(
			3,
			6
		)} ${digits.slice(6)}`;
	}

	return normalized;
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		padding: 20,
		paddingBottom: 120,
	},
	screenLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: "#71727A",
		marginBottom: 10,
	},
	profileCard: {
		alignItems: "center",
		paddingVertical: 28,
		paddingHorizontal: 16,
		borderRadius: 22,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	avatar: {
		width: 62,
		height: 62,
		borderRadius: 31,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	name: {
		fontSize: 18,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	phone: {
		marginTop: 6,
		fontSize: 12,
		fontWeight: "600",
		color: "#71727A",
	},
	roleBadge: {
		marginTop: 14,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#DCFCE7",
	},
	roleText: {
		fontSize: 12,
		fontWeight: "900",
		color: "#15803D",
	},
	menuCard: {
		marginTop: 18,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	menuRow: {
		minHeight: 72,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	logoutIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
		backgroundColor: "#FEE2E2",
	},
	logoutText: {
		flex: 1,
		fontSize: 14,
		fontWeight: "900",
		color: "#DC2626",
	},
});