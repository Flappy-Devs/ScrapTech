import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAdminPickupOrders } from "@/src/features/admin/admin.hooks";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import type {
	AddressSnapshot,
	PickupOrder,
} from "@/src/types/app.types";

type FilterStatus =
	| "all"
	| "pending"
	| "confirmed"
	| "on_the_way";

const FILTERS: Array<{
	label: string;
	value: FilterStatus;
}> = [
	{ label: "Tất cả", value: "all" },
	{ label: "Chờ xác nhận", value: "pending" },
	{ label: "Đã xác nhận", value: "confirmed" },
	{ label: "Đang tới", value: "on_the_way" },
];

export default function AdminOrdersScreen() {
	const { data: orders = [], isLoading } =
		useAdminPickupOrders("active");

	const [filter, setFilter] =
		useState<FilterStatus>("all");

	const visibleOrders = useMemo(() => {
		if (filter === "all") return orders;

		return orders.filter((order) => order.status === filter);
	}, [filter, orders]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.title}>Quản lý đơn hàng</Text>
				<Text style={styles.subtitle}>
					Theo dõi và xử lý các đơn đang hoạt động.
				</Text>

				<View style={styles.filterRow}>
					{FILTERS.map((item) => {
						const active = filter === item.value;

						return (
							<Pressable
								key={item.value}
								style={[
									styles.filterChip,
									active && styles.filterChipActive,
								]}
								onPress={() => setFilter(item.value)}
							>
								<Text
									style={[
										styles.filterText,
										active && styles.filterTextActive,
									]}
								>
									{item.label}
								</Text>
							</Pressable>
						);
					})}
				</View>

				{isLoading ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : visibleOrders.length === 0 ? (
					<View style={styles.emptyCard}>
						<Ionicons
							name="clipboard-outline"
							size={40}
							color="#8F9098"
						/>
						<Text style={styles.emptyTitle}>
							Không có đơn phù hợp
						</Text>
					</View>
				) : (
					<View style={styles.orderList}>
						{visibleOrders.map((order) => (
							<AdminOrderCard key={order.id} order={order} />
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

function AdminOrderCard({ order }: { order: PickupOrder }) {
	const address =
		(order.address_snapshot as unknown as AddressSnapshot)
			?.address_line || "Chưa có địa chỉ";

	return (
		<Pressable
			style={styles.orderCard}
			onPress={() =>
				router.push(`/(admin)/orders/${order.id}`)
			}
		>
			<View style={styles.rowBetween}>
				<Text style={styles.orderTitle}>
					Đơn #{order.id.slice(0, 8)}
				</Text>

				<View style={styles.statusBadge}>
					<Text style={styles.statusText}>
						{getStatusLabel(order.status)}
					</Text>
				</View>
			</View>

			<Text style={styles.metaText}>
				Ngày hẹn: {formatDate(order.scheduled_date)}
			</Text>

			<Text style={styles.metaText}>
				Địa chỉ: {address}
			</Text>

			<Text style={styles.amountText}>
				Ước lượng:{" "}
				{order.estimated_total !== null
					? `${formatVndAmount(order.estimated_total)} VND`
					: "Chưa có"}
			</Text>
		</Pressable>
	);
}

function getStatusLabel(status: PickupOrder["status"]) {
	switch (status) {
		case "pending":
			return "Chờ xác nhận";
		case "confirmed":
			return "Đã xác nhận";
		case "on_the_way":
			return "Đang tới";
		default:
			return status;
	}
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	content: {
		padding: 20,
		paddingBottom: 120,
	},
	title: {
		fontSize: 26,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	subtitle: {
		marginTop: 6,
		fontSize: 13,
		lineHeight: 18,
		color: "#71727A",
	},
	filterRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 18,
		marginBottom: 18,
	},
	filterChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#F3F4F6",
	},
	filterChipActive: {
		backgroundColor: "#DCFCE7",
	},
	filterText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#71727A",
	},
	filterTextActive: {
		color: "#15803D",
	},
	loadingBox: {
		paddingVertical: 40,
		alignItems: "center",
	},
	emptyCard: {
		alignItems: "center",
		paddingVertical: 40,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
	},
	emptyTitle: {
		marginTop: 10,
		fontSize: 15,
		fontWeight: "800",
		color: "#71727A",
	},
	orderList: {
		gap: 14,
	},
	orderCard: {
		padding: 16,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 12,
	},
	orderTitle: {
		flex: 1,
		fontSize: 15,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "#EFF6FF",
	},
	statusText: {
		fontSize: 11,
		fontWeight: "800",
		color: "#2563EB",
	},
	metaText: {
		marginTop: 10,
		fontSize: 12,
		lineHeight: 17,
		color: "#494A50",
	},
	amountText: {
		marginTop: 12,
		fontSize: 13,
		fontWeight: "900",
		color: "#16A34A",
	},
});