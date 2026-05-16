import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMyPickupOrders } from "@/src/features/orders/orders.hooks";
import {
	formatVndAmount,
} from "@/src/features/orders/orders.pricing";
import type { AddressSnapshot, PickupOrder } from "@/src/types/app.types";
import { useMyProfile } from "@/src/features/profile/profile.hooks";

const ACTIVE_STATUSES = ["pending", "confirmed", "on_the_way"] as const;

export default function MyOrdersScreen() {
	const { data: orders = [], isLoading } = useMyPickupOrders();

	const { data: profile, isLoading: isProfileLoading } = useMyProfile();

	const displayName = profile?.full_name?.trim() || "Người dùng ScrapTech";

	const activeOrders = orders.filter((order) =>
		ACTIVE_STATUSES.includes(
			order.status as (typeof ACTIVE_STATUSES)[number]
		)
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.heroCard}>
					<View style={styles.welcomeRow}>
						<View style={styles.avatar}>
							<Ionicons name="person" size={24} color="#22C55E" />
						</View>

						<View style={styles.welcomeTextWrap}>
							<Text style={styles.welcomeCaption}>Welcome back,</Text>
							<Text style={styles.welcomeTitle}>
								{`Xin chào, ${isProfileLoading ? "Đang tải..." : displayName}!`}
							</Text>
						</View>

						<View style={styles.bellButton}>
							<Ionicons
								name="notifications-outline"
								size={22}
								color="#1E1E1E"
							/>
							<View style={styles.bellDot} />
						</View>
					</View>

					<View style={styles.quickActionRow}>
						<View style={[styles.quickActionCard, styles.greenAction]}>
							<View style={styles.quickIconGreen}>
								<Ionicons name="trending-up" size={18} color="#16A34A" />
							</View>
							<Text style={styles.quickTitle}>Bảng giá</Text>
							<Text style={styles.quickCaption}>
								Giá phế liệu trực tiếp
							</Text>
						</View>

						<View style={[styles.quickActionCard, styles.blueAction]}>
							<View style={styles.quickIconBlue}>
								<Ionicons
									name="calculator-outline"
									size={18}
									color="#2563EB"
								/>
							</View>
							<Text style={styles.quickTitle}>Công cụ tính toán</Text>
							<Text style={styles.quickCaption}>
								Ước lượng giá trị phế liệu
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Đơn hàng của tôi</Text>
					<View style={styles.sectionBadge}>
						<Text style={styles.sectionBadgeText}>Đang xử lý</Text>
					</View>
				</View>

				{isLoading ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : activeOrders.length === 0 ? (
					<View style={styles.emptyCard}>
						<Ionicons name="cube-outline" size={40} color="#8F9098" />
						<Text style={styles.emptyTitle}>Chưa có đơn đang xử lý</Text>
						<Text style={styles.emptyCaption}>
							Tạo đơn mới để bắt đầu theo dõi tiến trình thu gom.
						</Text>
					</View>
				) : (
					<View style={styles.orderList}>
						{activeOrders.map((order) => (
							<OrderCard key={order.id} order={order} />
						))}
					</View>
				)}
			</ScrollView>

			<Pressable
				style={styles.fab}
				onPress={() => router.push("/orders/new")}
			>
				<Ionicons name="add" size={32} color="#FFFFFF" />
			</Pressable>
		</SafeAreaView>
	);
}

function OrderCard({ order }: { order: PickupOrder }) {
	
	const addressSnapshot = order.address_snapshot as unknown as AddressSnapshot;
	const address =
		addressSnapshot?.address_line?.trim() || "Chưa có địa chỉ thu gom";

	return (
		<Pressable
			style={styles.orderCard}
			onPress={() => router.push(`/orders/${order.id}`)}
		>
			<View style={styles.orderTopRow}>
				<View style={styles.imagePlaceholder}>
					<Ionicons name="image-outline" size={34} color="#86EFAC" />
				</View>

				<View style={styles.orderInfo}>
					<View style={styles.orderTitleRow}>
						<Text style={styles.orderTitle}>Đơn phế liệu</Text>
						<View style={styles.statusPill}>
							<Text style={styles.statusPillText}>
								{getStatusLabel(order.status)}
							</Text>
						</View>
					</View>

					<Text style={styles.priceText}>
						{order.estimated_total
							? `${formatVndAmount(order.estimated_total)}+ VND`
							: "Đang ước lượng giá"}
					</Text>
				</View>
			</View>

			<View style={styles.divider} />

			<View style={styles.metaRow}>
				<Ionicons name="time-outline" size={15} color="#71727A" />
				<Text style={styles.metaText}>{formatSchedule(order)}</Text>
			</View>

			<View style={styles.metaRow}>
				<Ionicons name="location-outline" size={15} color="#71727A" />
				<Text style={styles.metaText}>{address}</Text>
			</View>
		</Pressable>
	);
}

function getStatusLabel(status: PickupOrder["status"]) {
	switch (status) {
		case "confirmed":
			return "Đã xác nhận";
		case "on_the_way":
			return "Đang tới";
		default:
			return "Đang xử lý";
	}
}

function formatSchedule(order: PickupOrder) {
	const date = formatDate(order.scheduled_date);

	if (!order.scheduled_time_from || !order.scheduled_time_to) {
		return `${date}, chờ admin xác nhận giờ`;
	}

	return `${date}, ${order.scheduled_time_from.slice(
		0,
		5
	)} - ${order.scheduled_time_to.slice(0, 5)}`;
}

function formatDate(value: string) {
	const date = new Date(`${value}T00:00:00`);

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	content: {
		padding: 20,
		paddingBottom: 110,
	},
	heroCard: {
		padding: 18,
		borderRadius: 24,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
	},
	welcomeRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "#DCFCE7",
		alignItems: "center",
		justifyContent: "center",
	},
	welcomeTextWrap: {
		flex: 1,
		marginLeft: 12,
	},
	welcomeCaption: {
		fontSize: 12,
		fontWeight: "600",
		color: "#71727A",
	},
	welcomeTitle: {
		marginTop: 2,
		fontSize: 16,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	bellButton: {
		position: "relative",
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#F0F0F0",
	},
	bellDot: {
		position: "absolute",
		right: 10,
		top: 9,
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: "#ED3241",
	},
	quickActionRow: {
		flexDirection: "row",
		gap: 12,
		marginTop: 18,
	},
	quickActionCard: {
		flex: 1,
		padding: 14,
		borderRadius: 16,
		borderWidth: 1,
	},
	greenAction: {
		backgroundColor: "#F0FDF4",
		borderColor: "#BBF7D0",
	},
	blueAction: {
		backgroundColor: "#EFF6FF",
		borderColor: "#BFDBFE",
	},
	quickIconGreen: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#DCFCE7",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	quickIconBlue: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#DBEAFE",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	quickTitle: {
		fontSize: 13,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	quickCaption: {
		marginTop: 2,
		fontSize: 10,
		lineHeight: 14,
		color: "#71727A",
	},
	sectionHeader: {
		marginTop: 22,
		marginBottom: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	sectionBadge: {
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 999,
		backgroundColor: "#F3F4F6",
	},
	sectionBadgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: "#8F9098",
	},
	loadingBox: {
		paddingVertical: 40,
		alignItems: "center",
	},
	emptyCard: {
		paddingVertical: 36,
		paddingHorizontal: 20,
		borderRadius: 20,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 3,
	},
	emptyTitle: {
		marginTop: 12,
		fontSize: 16,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	emptyCaption: {
		marginTop: 6,
		textAlign: "center",
		fontSize: 13,
		lineHeight: 18,
		color: "#71727A",
	},
	orderList: {
		gap: 16,
	},
	orderCard: {
		padding: 14,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 4,
	},
	orderTopRow: {
		flexDirection: "row",
		gap: 12,
	},
	imagePlaceholder: {
		width: 68,
		height: 68,
		borderRadius: 16,
		backgroundColor: "#DCFCE7",
		alignItems: "center",
		justifyContent: "center",
	},
	orderInfo: {
		flex: 1,
		paddingTop: 2,
	},
	orderTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	orderTitle: {
		flex: 1,
		fontSize: 14,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	statusPill: {
		paddingHorizontal: 9,
		paddingVertical: 5,
		borderRadius: 999,
		backgroundColor: "#DBEAFE",
	},
	statusPillText: {
		fontSize: 10,
		fontWeight: "800",
		color: "#2563EB",
	},
	priceText: {
		marginTop: 13,
		fontSize: 12,
		fontWeight: "800",
		color: "#00A63E",
	},
	divider: {
		height: 1,
		marginVertical: 12,
		backgroundColor: "#F0F0F0",
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		marginTop: 5,
	},
	metaText: {
		flex: 1,
		fontSize: 11,
		lineHeight: 16,
		color: "#494A50",
	},
	fab: {
		position: "absolute",
		right: 22,
		bottom: 28,
		width: 58,
		height: 58,
		borderRadius: 29,
		backgroundColor: "#22C55E",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 7,
	},
});