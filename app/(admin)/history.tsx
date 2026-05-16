import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	useAdminPickupOrder,
	useAdminPickupOrders,
} from "@/src/features/admin/admin.hooks";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import type {
	AddressSnapshot,
	PickupOrder,
} from "@/src/types/app.types";

export default function AdminHistoryScreen() {
	const { data: orders = [], isLoading } =
		useAdminPickupOrders("history");

	const [selectedOrderId, setSelectedOrderId] =
		useState<string | null>(null);

	const {
		data: selectedOrder,
		isLoading: isSelectedOrderLoading,
	} = useAdminPickupOrder(
		selectedOrderId ?? "",
		Boolean(selectedOrderId)
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.title}>Lịch sử đơn hàng</Text>
				<Text style={styles.subtitle}>
					Các đơn đã hoàn thành, bị từ chối hoặc bị hủy.
				</Text>

				{isLoading ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : orders.length === 0 ? (
					<View style={styles.emptyCard}>
						<Ionicons
							name="time-outline"
							size={40}
							color="#8F9098"
						/>
						<Text style={styles.emptyTitle}>
							Chưa có lịch sử đơn
						</Text>
					</View>
				) : (
					<View style={styles.list}>
						{orders.map((order) => (
							<HistoryCard
								key={order.id}
								order={order}
								onPress={() =>
									setSelectedOrderId(order.id)
								}
							/>
						))}
					</View>
				)}
			</ScrollView>

			<Modal
				visible={Boolean(selectedOrderId)}
				animationType="slide"
				transparent
				onRequestClose={() => setSelectedOrderId(null)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>
								Chi tiết lịch sử đơn
							</Text>

							<Pressable
								onPress={() => setSelectedOrderId(null)}
							>
								<Ionicons
									name="close"
									size={24}
									color="#1E1E1E"
								/>
							</Pressable>
						</View>

						{isSelectedOrderLoading ? (
							<View style={styles.modalLoading}>
								<ActivityIndicator
									size="large"
									color="#22C55E"
								/>
							</View>
						) : selectedOrder ? (
							<ScrollView
								showsVerticalScrollIndicator={false}
							>
								<Text style={styles.modalLabel}>Mã đơn</Text>
								<Text style={styles.modalValue}>
									#{selectedOrder.id.slice(0, 8)}
								</Text>

								<Text style={styles.modalLabel}>
									Trạng thái
								</Text>
								<Text style={styles.modalValue}>
									{getStatusLabel(selectedOrder.status)}
								</Text>

								<Text style={styles.modalLabel}>
									Địa chỉ
								</Text>
								<Text style={styles.modalValue}>
									{(
										selectedOrder.address_snapshot as unknown as AddressSnapshot
									)?.address_line || "Chưa có địa chỉ"}
								</Text>

								<Text style={styles.modalLabel}>
									Vật liệu
								</Text>
								{selectedOrder.items.map((item) => (
									<Text
										key={item.id}
										style={styles.itemLine}
									>
										•{" "}
										{item.scrap_categories?.name ??
											"Phế liệu"}{" "}
										— {item.final_quantity ??
											item.estimated_quantity ??
											0}{" "}
										{item.unit}
									</Text>
								))}

								<Text style={styles.modalLabel}>
									Tổng tiền
								</Text>
								<Text style={styles.totalValue}>
									{formatVndAmount(
										selectedOrder.final_total ??
											selectedOrder.estimated_total ??
											0
									)}{" "}
									VND
								</Text>

								<Text style={styles.modalLabel}>
									Ghi chú admin
								</Text>
								<Text style={styles.modalValue}>
									{selectedOrder.admin_note || "Không có"}
								</Text>

								{selectedOrder.status === "rejected" ? (
									<>
										<Text style={styles.modalLabel}>
											Lý do từ chối
										</Text>
										<Text style={styles.modalValue}>
											{selectedOrder.rejection_reason ||
												"Không có"}
										</Text>
									</>
								) : null}
							</ScrollView>
						) : (
							<View style={styles.modalLoading}>
								<Text>Không tìm thấy dữ liệu.</Text>
							</View>
						)}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

function HistoryCard({
	order,
	onPress,
}: {
	order: PickupOrder;
	onPress: () => void;
}) {
	const address =
		(order.address_snapshot as unknown as AddressSnapshot)
			?.address_line || "Chưa có địa chỉ";

	return (
		<Pressable style={styles.card} onPress={onPress}>
			<View style={styles.rowBetween}>
				<Text style={styles.cardTitle}>
					Đơn #{order.id.slice(0, 8)}
				</Text>

				<View style={styles.statusBadge}>
					<Text style={styles.statusText}>
						{getStatusLabel(order.status)}
					</Text>
				</View>
			</View>

			<Text style={styles.metaText}>{address}</Text>
			<Text style={styles.metaText}>
				Ngày hẹn: {formatDate(order.scheduled_date)}
			</Text>
		</Pressable>
	);
}

function getStatusLabel(status: PickupOrder["status"]) {
	switch (status) {
		case "completed":
			return "Hoàn thành";
		case "rejected":
			return "Từ chối";
		case "cancelled":
			return "Đã hủy";
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
	loadingBox: {
		paddingVertical: 40,
		alignItems: "center",
	},
	emptyCard: {
		marginTop: 18,
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
	list: {
		gap: 14,
		marginTop: 18,
	},
	card: {
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
	cardTitle: {
		flex: 1,
		fontSize: 15,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "#FEF3C7",
	},
	statusText: {
		fontSize: 11,
		fontWeight: "800",
		color: "#B45309",
	},
	metaText: {
		marginTop: 10,
		fontSize: 12,
		lineHeight: 17,
		color: "#494A50",
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.35)",
		justifyContent: "flex-end",
	},
	modalCard: {
		maxHeight: "82%",
		padding: 20,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		backgroundColor: "#FFFFFF",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 18,
	},
	modalTitle: {
		fontSize: 19,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	modalLoading: {
		minHeight: 180,
		alignItems: "center",
		justifyContent: "center",
	},
	modalLabel: {
		marginTop: 14,
		fontSize: 12,
		fontWeight: "800",
		color: "#71727A",
	},
	modalValue: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		fontWeight: "700",
		color: "#1E1E1E",
	},
	itemLine: {
		marginTop: 6,
		fontSize: 14,
		lineHeight: 20,
		color: "#1E1E1E",
	},
	totalValue: {
		marginTop: 6,
		fontSize: 20,
		fontWeight: "900",
		color: "#16A34A",
	},
});