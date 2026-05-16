import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	useMyPickupOrderHistory,
	usePickupOrder,
} from "@/src/features/orders/orders.hooks";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import { getPickupOrderImagePublicUrl } from "@/src/features/storage/storage.api";
import type {
	AddressSnapshot,
	PickupOrder,
	PickupOrderDetails,
	PickupOrderItem,
	ScrapCategory,
} from "@/src/types/app.types";

type OrderItemWithCategory = PickupOrderItem & {
	scrap_categories: ScrapCategory | null;
};

export default function OrderHistoryScreen() {
	const {
		data: orders = [],
		isLoading,
		isError,
		error,
	} = useMyPickupOrderHistory();
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	const fallbackSelectedOrder =
		orders.find((order) => order.id === selectedOrderId) ?? null;
	const {
		data: selectedOrder,
		isLoading: isSelectedOrderLoading,
	} = usePickupOrder(selectedOrderId ?? "");
	const detailOrder = selectedOrder ?? fallbackSelectedOrder;

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View style={styles.stateBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : isError ? (
					<View style={styles.stateBox}>
						<Ionicons
							name="alert-circle-outline"
							size={38}
							color="#EF4444"
						/>
						<Text style={styles.stateTitle}>
							Không thể tải lịch sử đơn
						</Text>
						<Text style={styles.stateCaption}>
							{error instanceof Error
								? error.message
								: "Vui lòng thử lại sau."}
						</Text>
					</View>
				) : orders.length === 0 ? (
					<View style={styles.stateBox}>
						<Ionicons name="receipt-outline" size={40} color="#8F9098" />
						<Text style={styles.stateTitle}>Chưa có lịch sử đơn</Text>
						<Text style={styles.stateCaption}>
							Các đơn đã hoàn thành, bị từ chối hoặc đã hủy sẽ hiển thị tại đây.
						</Text>
					</View>
				) : (
					<View style={styles.orderList}>
						{orders.map((order) => (
							<HistoryCard
								key={order.id}
								order={order}
								onPress={() => setSelectedOrderId(order.id)}
							/>
						))}
					</View>
				)}
			</ScrollView>

			<Modal
				visible={Boolean(selectedOrderId)}
				animationType="fade"
				transparent
				onRequestClose={() => setSelectedOrderId(null)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>

							<Pressable
								style={styles.closeButton}
								onPress={() => setSelectedOrderId(null)}
							>
								<Ionicons name="close" size={22} color="#1E1E1E" />
							</Pressable>
						</View>

						{isSelectedOrderLoading && !detailOrder ? (
							<View style={styles.modalLoading}>
								<ActivityIndicator size="large" color="#22C55E" />
							</View>
						) : detailOrder ? (
							<OrderDetail order={detailOrder} />
						) : (
							<View style={styles.modalLoading}>
								<Text style={styles.stateTitle}>
									Không tìm thấy dữ liệu đơn hàng.
								</Text>
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
	order: PickupOrderDetails;
	onPress: () => void;
}) {
	const imageUrl = getOrderImageUrl(order);
	const total = getOrderTotal(order);
	const status = getStatusPresentation(order.status);

	return (
		<Pressable style={styles.orderCard} onPress={onPress}>
			<View style={styles.cardImageFrame}>
				{imageUrl ? (
					<Image
						source={{ uri: imageUrl }}
						style={styles.cardImage}
						resizeMode="cover"
					/>
				) : (
					<Ionicons name="image-outline" size={44} color="#86EFAC" />
				)}
			</View>

			<View style={styles.cardDateRow}>
				<Text style={styles.cardDate}>{formatLongDate(order.scheduled_date)}</Text>
				<View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
					<Text style={[styles.statusText, { color: status.fg }]}>
						{status.label}
					</Text>
				</View>
			</View>

			<Text style={styles.orderTitle}>{getOrderTitle(order.items)}</Text>
			<Text style={styles.totalLabel}>Lợi nhuận thu được</Text>
			<Text style={styles.totalValue}>
				{total === null ? "Đang cập nhật" : `+ ${formatVndAmount(total)} VND`}
			</Text>

			<View style={styles.cardDivider} />

			<View style={styles.detailButton}>
				<Ionicons
					name="information-circle-outline"
					size={15}
					color="#22C55E"
				/>
				<Text style={styles.detailButtonText}>Chi tiết</Text>
			</View>
		</Pressable>
	);
}

function OrderDetail({ order }: { order: PickupOrderDetails }) {
	const imageUrl = getOrderImageUrl(order);
	const total = getOrderTotal(order);
	const status = getStatusPresentation(order.status);
	const addressSnapshot = order.address_snapshot as unknown as AddressSnapshot;

	return (
		<ScrollView
			contentContainerStyle={styles.modalContent}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.modalImageFrame}>
				{imageUrl ? (
					<Image
						source={{ uri: imageUrl }}
						style={styles.modalImage}
						resizeMode="cover"
					/>
				) : (
					<Ionicons name="image-outline" size={52} color="#86EFAC" />
				)}
			</View>

			<View style={styles.modalStatusRow}>
				<Text style={styles.modalOrderCode}>#{order.id.slice(0, 8)}</Text>
				<View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
					<Text style={[styles.statusText, { color: status.fg }]}>
						{status.label}
					</Text>
				</View>
			</View>

			<DetailBlock label="Ngày thu gom" value={formatSchedule(order)} />
			<DetailBlock
				label="Địa chỉ"
				value={addressSnapshot?.address_line || "Chưa có địa chỉ"}
			/>
			<DetailBlock
				label="Người nhận"
				value={addressSnapshot?.recipient_name || "Chưa cập nhật"}
			/>
			<DetailBlock
				label="Số điện thoại"
				value={addressSnapshot?.phone || "Chưa cập nhật"}
			/>

			<Text style={styles.detailLabel}>Vật liệu</Text>
			<View style={styles.itemList}>
				{order.items.map((item) => (
					<View key={item.id} style={styles.itemRow}>
						<Text style={styles.itemName}>
							{item.scrap_categories?.name ?? "Phế liệu"}
						</Text>
						<Text style={styles.itemQuantity}>
							{formatQuantity(
								item.final_quantity ?? item.estimated_quantity ?? 0
							)}{" "}
							{item.unit}
						</Text>
					</View>
				))}
			</View>

			<DetailBlock label="Ghi chú của bạn" value={order.note || "Không có"} />
			<DetailBlock label="Ghi chú admin" value={order.admin_note || "Không có"} />

			{order.status === "rejected" ? (
				<DetailBlock
					label="Lý do từ chối"
					value={order.rejection_reason || "Không có"}
				/>
			) : null}

			<Text style={styles.detailLabel}>Tổng tiền</Text>
			<Text style={styles.modalTotal}>
				{total === null ? "Đang cập nhật" : `${formatVndAmount(total)} VND`}
			</Text>
		</ScrollView>
	);
}

function DetailBlock({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.detailBlock}>
			<Text style={styles.detailLabel}>{label}</Text>
			<Text style={styles.detailValue}>{value}</Text>
		</View>
	);
}

function getOrderImageUrl(order: PickupOrderDetails) {
	const image = order.images[0];

	if (!image) {
		return null;
	}

	return image.public_url || getPickupOrderImagePublicUrl(image.storage_path);
}

function getOrderTotal(order: PickupOrderDetails) {
	if (typeof order.final_total === "number") {
		return order.final_total;
	}

	if (typeof order.estimated_total === "number") {
		return order.estimated_total;
	}

	const total = order.items.reduce<number>((sum, item) => {
		const subtotal = item.final_subtotal ?? item.estimated_subtotal;

		return sum + (typeof subtotal === "number" ? subtotal : 0);
	}, 0);

	return total > 0 ? total : null;
}

function getOrderTitle(items: OrderItemWithCategory[]) {
	if (items.length === 0) {
		return "Đơn phế liệu";
	}

	const names = items.map(
		(item) => item.scrap_categories?.name ?? "Phế liệu"
	);
	const units = new Set(items.map((item) => item.unit));
	const totalQuantity = items.reduce<number>(
		(total, item) => {
			const value = item.final_quantity ?? item.estimated_quantity;

			return total + (typeof value === "number" ? value : 0);
		},
		0
	);
	const nameLabel =
		names.length > 2 ? `${names.slice(0, 2).join(" & ")}...` : names.join(" & ");

	if (units.size === 1 && totalQuantity > 0) {
		return `${formatQuantity(totalQuantity)} ${items[0].unit} - ${nameLabel}`;
	}

	return nameLabel;
}

function getStatusPresentation(status: PickupOrder["status"]) {
	switch (status) {
		case "completed":
			return {
				label: "hoàn thành",
				bg: "#DCFCE7",
				fg: "#16A34A",
			};
		case "rejected":
			return {
				label: "từ chối",
				bg: "#FEE2E2",
				fg: "#DC2626",
			};
		case "cancelled":
			return {
				label: "đã hủy",
				bg: "#F3F4F6",
				fg: "#6B7280",
			};
		case "confirmed":
			return {
				label: "đã xác nhận",
				bg: "#DBEAFE",
				fg: "#2563EB",
			};
		case "on_the_way":
			return {
				label: "đang tới",
				bg: "#FEF3C7",
				fg: "#B45309",
			};
		default:
			return {
				label: "đang xử lý",
				bg: "#FEF3C7",
				fg: "#B45309",
			};
	}
}

function formatSchedule(order: PickupOrder) {
	const date = formatLongDate(order.scheduled_date);

	if (!order.scheduled_time_from || !order.scheduled_time_to) {
		return `${date}, chờ admin xác nhận giờ`;
	}

	return `${date}, ${order.scheduled_time_from.slice(
		0,
		5
	)} - ${order.scheduled_time_to.slice(0, 5)}`;
}

function formatLongDate(value: string) {
	return new Intl.DateTimeFormat("vi-VN", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

function formatQuantity(value: number) {
	return new Intl.NumberFormat("vi-VN", {
		maximumFractionDigits: 2,
	}).format(value);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
	header: {
		height: 86,
		alignItems: "center",
		justifyContent: "center",
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 12,
		elevation: 3,
	},
	headerTitle: {
		fontSize: 21,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	content: {
		paddingHorizontal: 26,
		paddingTop: 18,
		paddingBottom: 118,
	},
	stateBox: {
		minHeight: 220,
		alignItems: "center",
		justifyContent: "center",
		padding: 22,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
	},
	stateTitle: {
		marginTop: 10,
		textAlign: "center",
		fontSize: 15,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	stateCaption: {
		marginTop: 6,
		textAlign: "center",
		fontSize: 12,
		lineHeight: 17,
		color: "#71727A",
	},
	orderList: {
		gap: 18,
	},
	orderCard: {
		padding: 18,
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
	},
	cardImageFrame: {
		height: 164,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		backgroundColor: "#DDFBE8",
	},
	cardImage: {
		width: "100%",
		height: "100%",
	},
	cardDateRow: {
		marginTop: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
	},
	cardDate: {
		flex: 1,
		fontSize: 10,
		fontWeight: "700",
		color: "#71727A",
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 999,
	},
	statusText: {
		fontSize: 10,
		fontWeight: "900",
		textTransform: "lowercase",
	},
	orderTitle: {
		marginTop: 3,
		fontSize: 15,
		lineHeight: 20,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	totalLabel: {
		marginTop: 12,
		fontSize: 11,
		fontWeight: "700",
		color: "#71727A",
	},
	totalValue: {
		marginTop: 3,
		fontSize: 21,
		fontWeight: "900",
		color: "#00A63E",
	},
	cardDivider: {
		height: 1,
		marginTop: 14,
		backgroundColor: "#EDF0F2",
	},
	detailButton: {
		height: 44,
		marginTop: 12,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#22C55E",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	detailButtonText: {
		fontSize: 13,
		fontWeight: "900",
		color: "#22C55E",
	},
	modalBackdrop: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.38)",
	},
	modalCard: {
		maxHeight: "88%",
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		overflow: "hidden",
	},
	modalHeader: {
		minHeight: 58,
		paddingHorizontal: 18,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: "#F0F0F0",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	closeButton: {
		width: 38,
		height: 38,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 19,
		backgroundColor: "#F3F4F6",
	},
	modalLoading: {
		minHeight: 220,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	modalContent: {
		padding: 18,
		paddingBottom: 24,
	},
	modalImageFrame: {
		height: 190,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		borderRadius: 12,
		backgroundColor: "#DDFBE8",
	},
	modalImage: {
		width: "100%",
		height: "100%",
	},
	modalStatusRow: {
		marginTop: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	modalOrderCode: {
		fontSize: 16,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	detailBlock: {
		marginTop: 14,
	},
	detailLabel: {
		marginTop: 14,
		fontSize: 12,
		fontWeight: "900",
		color: "#71727A",
	},
	detailValue: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		fontWeight: "700",
		color: "#1E1E1E",
	},
	itemList: {
		marginTop: 8,
		gap: 8,
	},
	itemRow: {
		minHeight: 44,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
		backgroundColor: "#F8F9FE",
	},
	itemName: {
		flex: 1,
		fontSize: 13,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	itemQuantity: {
		fontSize: 12,
		fontWeight: "800",
		color: "#494A50",
	},
	modalTotal: {
		marginTop: 5,
		fontSize: 22,
		fontWeight: "900",
		color: "#00A63E",
	},
});
