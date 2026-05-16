import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

import { useMyLatestAddress } from "@/src/features/addresses/addresses.hooks";
import { useMyPickupOrders } from "@/src/features/orders/orders.hooks";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import { useMyProfile } from "@/src/features/profile/profile.hooks";
import { useAuth } from "@/src/hooks/useAuth";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function UserInfoScreen() {
	const colors = useThemeColors();
	const { session, signOut } = useAuth();

	const { data: profile, isLoading: isProfileLoading } = useMyProfile();
	const { data: latestAddress, isLoading: isAddressLoading } =
		useMyLatestAddress();
	const { data: orders = [], isLoading: isOrdersLoading } =
		useMyPickupOrders();

	const [isSigningOut, setIsSigningOut] = useState(false);

	const completedOrders = useMemo(
		() => orders.filter((order) => order.status === "completed"),
		[orders]
	);

	const completedOrderCount = completedOrders.length;

	const totalRevenue = useMemo(
		() =>
			completedOrders.reduce(
				(total, order) => total + (order.final_total ?? order.estimated_total ?? 0),
				0
			),
		[completedOrders]
	);

	const displayName =
		profile?.full_name?.trim() || "Người dùng ScrapTech";

	const phone =
		profile?.phone ??
		session?.user.phone ??
		null;

	const addressTitle =
		latestAddress?.label?.trim() ||
		latestAddress?.recipient_name?.trim() ||
		"Địa chỉ đã lưu";

	const addressContent = latestAddress
		? formatAddress(latestAddress)
		: "Bạn chưa lưu địa chỉ nào.";

	async function handleLogout() {
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
									: "Không thể đăng xuất. Vui lòng thử lại.";

							Alert.alert("Đăng xuất thất bại", message);
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
				{ backgroundColor: colors.neutral.light.lightest },
			]}
		>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Text
					style={[
						styles.screenLabel,
						{ color: colors.neutral.dark.light },
					]}
				>
					Profile
				</Text>

				<View style={styles.profileCard}>
					<View
						style={[
							styles.avatar,
							{ backgroundColor: colors.highlight.lightest },
						]}
					>
						<Ionicons
							name="person"
							size={34}
							color={colors.highlight.light}
						/>
					</View>

					<Text
						style={[
							styles.profileName,
							{ color: colors.neutral.dark.darkest },
						]}
					>
						{isProfileLoading ? "Đang tải..." : displayName}
					</Text>

					<Text
						style={[
							styles.profilePhone,
							{ color: colors.neutral.dark.lightest },
						]}
					>
						{formatPhoneNumber(phone)}
					</Text>
				</View>

				<View style={styles.statRow}>
					<StatCard
						title="Tổng doanh thu"
						value={
							isOrdersLoading
								? "--"
								: `${formatVndAmount(totalRevenue)}\nVND`
						}
						valueColor={colors.highlight.medium}
					/>

					<StatCard
						title="Số đơn hoàn thành"
						value={
							isOrdersLoading
								? "--"
								: `${completedOrderCount} Đơn`
						}
						valueColor={colors.neutral.dark.darkest}
					/>
				</View>

				<Text
					style={[
						styles.sectionTitle,
						{ color: colors.neutral.dark.darkest },
					]}
				>
					Địa chỉ lưu gần đây
				</Text>

				<View style={styles.addressCard}>
					<View
						style={[
							styles.addressIconWrap,
							{ backgroundColor: colors.highlight.lightest },
						]}
					>
						<Ionicons
							name="location-outline"
							size={20}
							color={colors.highlight.medium}
						/>
					</View>

					<View style={styles.addressContent}>
						<Text
							numberOfLines={1}
							style={[
								styles.addressTitle,
								{ color: colors.neutral.dark.darkest },
							]}
						>
							{isAddressLoading ? "Đang tải địa chỉ..." : addressTitle}
						</Text>

						<Text
							numberOfLines={2}
							style={[
								styles.addressDescription,
								{ color: colors.neutral.dark.lightest },
							]}
						>
							{isAddressLoading ? "Vui lòng chờ..." : addressContent}
						</Text>
					</View>

					<View style={styles.editButton}>
						<Ionicons
							name="create-outline"
							size={18}
							color={colors.neutral.dark.lightest}
						/>
					</View>
				</View>

				<Text
					style={[
						styles.sectionTitle,
						{ color: colors.neutral.dark.darkest },
					]}
				>
					Tùy chọn
				</Text>

				<View style={styles.menuCard}>
					<MenuRow
						icon="settings"
						iconColor={colors.neutral.dark.darkest}
						iconBackground="#F4F5F7"
						label="Cài đặt ứng dụng"
						onPress={() => router.push("/(app)/settings")}
					/>

					<MenuDivider />

					<MenuRow
						icon="shield-checkmark-outline"
						iconColor="#A855F7"
						iconBackground="#F7F0FF"
						label="Quyền riêng tư và an toàn"
						onPress={() => router.push("/(app)/privacy-safety")}
					/>

					<MenuDivider />

					<MenuRow
						icon="notifications-outline"
						iconColor="#C4D600"
						iconBackground="#FBFDEB"
						label="Thông báo và âm thanh"
						onPress={() => router.push("/(app)/notifications")}
					/>

					<MenuDivider />

					<MenuRow
						icon="log-out-outline"
						iconColor={colors.error.dark}
						iconBackground={colors.error.light}
						label="Đăng xuất"
						labelColor={colors.error.dark}
						chevronColor={colors.error.medium}
						onPress={handleLogout}
						isLoading={isSigningOut}
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function StatCard(props: {
	title: string;
	value: string;
	valueColor: string;
}) {
	return (
		<View style={styles.statCard}>
			<Text style={styles.statTitle}>{props.title}</Text>
			<Text style={[styles.statValue, { color: props.valueColor }]}>
				{props.value}
			</Text>
		</View>
	);
}

function MenuRow(props: {
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	iconBackground: string;
	label: string;
	labelColor?: string;
	chevronColor?: string;
	onPress: () => void;
	isLoading?: boolean;
}) {
	return (
		<Pressable style={styles.menuRow} onPress={props.onPress}>
			<View
				style={[
					styles.menuIconWrap,
					{ backgroundColor: props.iconBackground },
				]}
			>
				<Ionicons
					name={props.icon}
					size={20}
					color={props.iconColor}
				/>
			</View>

			<Text
				style={[
					styles.menuLabel,
					{ color: props.labelColor ?? "#1E1E1E" },
				]}
			>
				{props.label}
			</Text>

			{props.isLoading ? (
				<ActivityIndicator size="small" color={props.labelColor ?? "#71727A"} />
			) : (
				<Ionicons
					name="chevron-forward"
					size={18}
					color={props.chevronColor ?? "#C5C6CC"}
				/>
			)}
		</Pressable>
	);
}

function MenuDivider() {
	return <View style={styles.menuDivider} />;
}

function formatAddress(address: {
	address_line: string;
	ward: string | null;
	district: string | null;
	city: string | null;
}) {
	return [
		address.address_line,
		address.ward,
		address.district,
		address.city,
	]
		.filter(Boolean)
		.join(", ");
}

function formatPhoneNumber(value: string | null) {
	if (!value) return "Chưa cập nhật";

	const normalized = value.startsWith("+84")
		? `0${value.slice(3)}`
		: value;

	const digits = normalized.replace(/\D/g, "");

	if (digits.length === 10) {
		return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
	}

	return normalized;
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 6,
		paddingBottom: 120,
	},
	screenLabel: {
		fontSize: 12,
		fontWeight: "500",
		marginBottom: 8,
		marginLeft: 2,
	},
	profileCard: {
		alignItems: "center",
		paddingTop: 28,
		paddingBottom: 22,
		borderRadius: 22,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	avatar: {
		width: 58,
		height: 58,
		borderRadius: 29,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	profileName: {
		fontSize: 18,
		fontWeight: "800",
	},
	profilePhone: {
		marginTop: 5,
		fontSize: 12,
		fontWeight: "500",
	},
	statRow: {
		flexDirection: "row",
		gap: 12,
		marginTop: 12,
	},
	statCard: {
		flex: 1,
		minHeight: 80,
		paddingHorizontal: 14,
		paddingVertical: 14,
		borderRadius: 16,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	statTitle: {
		fontSize: 11,
		fontWeight: "600",
		color: "#71727A",
		marginBottom: 6,
	},
	statValue: {
		fontSize: 13,
		fontWeight: "800",
		lineHeight: 18,
	},
	sectionTitle: {
		marginTop: 14,
		marginBottom: 10,
		fontSize: 15,
		fontWeight: "800",
	},
	addressCard: {
		minHeight: 82,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 16,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	addressIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	addressContent: {
		flex: 1,
	},
	addressTitle: {
		fontSize: 12,
		fontWeight: "800",
		marginBottom: 4,
	},
	addressDescription: {
		fontSize: 10,
		lineHeight: 14,
	},
	editButton: {
		width: 28,
		height: 28,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 8,
	},
	menuCard: {
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
	menuIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
	},
	menuLabel: {
		flex: 1,
		fontSize: 13,
		fontWeight: "800",
	},
	menuDivider: {
		height: 1,
		marginLeft: 66,
		backgroundColor: "#F0F0F0",
	},
});