import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	useAdminPickupOrder,
	useUpdateAdminPickupOrder,
} from "@/src/features/admin/admin.hooks";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import { getPickupOrderImagePublicUrl } from "@/src/features/storage/storage.api";
import type {
	AddressSnapshot,
	PickupOrder,
	PickupOrderDetails,
} from "@/src/types/app.types";

interface ItemDraft {
	finalQuantity: string;
	finalSubtotal: string;
}

export default function AdminOrderDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	const { data: order, isLoading } = useAdminPickupOrder(id ?? "");
	const updateOrder = useUpdateAdminPickupOrder();

	const [scheduledDate, setScheduledDate] = useState("");
	const [timeFrom, setTimeFrom] = useState("");
	const [timeTo, setTimeTo] = useState("");
	const [selectedStatus, setSelectedStatus] =
		useState<PickupOrder["status"]>("pending");
	const [adminNote, setAdminNote] = useState("");
	const [rejectionReason, setRejectionReason] = useState("");
	const [itemDrafts, setItemDrafts] = useState<Record<string, ItemDraft>>({});

	useEffect(() => {
		if (!order) {
			return;
		}

		setScheduledDate(order.scheduled_date);
		setTimeFrom(order.scheduled_time_from?.slice(0, 5) ?? "");
		setTimeTo(order.scheduled_time_to?.slice(0, 5) ?? "");
		setSelectedStatus(order.status);
		setAdminNote(order.admin_note ?? "");
		setRejectionReason(order.rejection_reason ?? "");

		setItemDrafts(
			Object.fromEntries(
				order.items.map((item) => [
					item.id,
					{
						finalQuantity: item.final_quantity?.toString() ?? "",
						finalSubtotal: item.final_subtotal?.toString() ?? "",
					},
				])
			)
		);
	}, [order]);

	const statusOptions = useMemo(() => {
		if (!order) {
			return [];
		}

		return getSelectableStatuses(order.status);
	}, [order]);

	const calculatedFinalTotal = useMemo(() => {
		return Object.values(itemDrafts).reduce((total, item) => {
			const amount = parseNullableNumber(item.finalSubtotal);

			return total + (amount ?? 0);
		}, 0);
	}, [itemDrafts]);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.centered}>
				<ActivityIndicator size="large" color="#22C55E" />
			</SafeAreaView>
		);
	}

	if (!order) {
		return (
			<SafeAreaView style={styles.centered}>
				<Text style={styles.emptyText}>Không tìm thấy đơn hàng.</Text>
			</SafeAreaView>
		);
	}

	const addressSnapshot = order.address_snapshot as unknown as AddressSnapshot;
	const imageUrl = getOrderImageUrl(order);

	async function handleSave() {
		const currentOrder = order;

		if (!currentOrder) {
			return;
		}

		if (!isValidDateString(scheduledDate)) {
			Alert.alert(
				"Ngày không hợp lệ",
				"Vui lòng nhập ngày theo định dạng YYYY-MM-DD."
			);
			return;
		}

		if (!isValidTimePair(timeFrom, timeTo)) {
			Alert.alert(
				"Giờ không hợp lệ",
				"Giờ bắt đầu và kết thúc phải cùng có giá trị, định dạng HH:mm và giờ kết thúc phải sau giờ bắt đầu."
			);
			return;
		}

		if (selectedStatus === "rejected" && !rejectionReason.trim()) {
			Alert.alert(
				"Thiếu lý do từ chối",
				"Vui lòng nhập lý do từ chối đơn."
			);
			return;
		}

		try {
			await updateOrder.mutateAsync({
				orderId: currentOrder.id,
				scheduledDate,
				scheduledTimeFrom: normalizeTime(timeFrom),
				scheduledTimeTo: normalizeTime(timeTo),
				status: selectedStatus,
				adminNote: adminNote.trim() || null,
				rejectionReason:
					selectedStatus === "rejected" ? rejectionReason.trim() : null,
				items: currentOrder.items.map((item) => {
					const draft = itemDrafts[item.id];

					return {
						id: item.id,
						final_quantity: parseNullableNumber(
							draft?.finalQuantity ?? ""
						),
						final_subtotal: parseNullableNumber(
							draft?.finalSubtotal ?? ""
						),
					};
				}),
			});

			Alert.alert("Đã lưu", "Thông tin đơn hàng đã được cập nhật.");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Không thể cập nhật đơn hàng.";

			Alert.alert("Cập nhật thất bại", message);
		}
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Ionicons
					name="arrow-back"
					size={22}
					color="#1E1E1E"
					onPress={() => router.back()}
				/>

				<Text style={styles.headerTitle}>Chỉnh sửa đơn</Text>

				<View style={{ width: 22 }} />
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.imageFrame}>
					{imageUrl ? (
						<Image
							source={{ uri: imageUrl }}
							style={styles.orderImage}
							resizeMode="cover"
						/>
					) : (
						<Ionicons name="image-outline" size={46} color="#86EFAC" />
					)}
				</View>

				<View style={styles.card}>
					<Text style={styles.sectionTitle}>Thông tin chung</Text>

					<Text style={styles.label}>Mã đơn</Text>
					<Text style={styles.value}>#{order.id.slice(0, 8)}</Text>

					<Text style={styles.label}>Địa chỉ thu gom</Text>
					<Text style={styles.value}>
						{addressSnapshot?.address_line || "Chưa có địa chỉ"}
					</Text>

					<Text style={styles.label}>Người nhận</Text>
					<Text style={styles.value}>
						{addressSnapshot?.recipient_name || "Chưa cập nhật"}
					</Text>

					<Text style={styles.label}>Số điện thoại</Text>
					<Text style={styles.value}>
						{addressSnapshot?.phone || "Chưa cập nhật"}
					</Text>

					<Text style={styles.label}>Ghi chú của seller</Text>
					<Text style={styles.value}>{order.note || "Không có"}</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.sectionTitle}>Lịch thu gom</Text>

					<Text style={styles.inputLabel}>Ngày hẹn</Text>
					<TextInput
						value={scheduledDate}
						onChangeText={setScheduledDate}
						placeholder="YYYY-MM-DD"
						style={styles.input}
					/>

					<View style={styles.twoColumnRow}>
						<View style={styles.twoColumnItem}>
							<Text style={styles.inputLabel}>Từ giờ</Text>
							<TextInput
								value={timeFrom}
								onChangeText={setTimeFrom}
								placeholder="08:00"
								style={styles.input}
							/>
						</View>

						<View style={styles.twoColumnItem}>
							<Text style={styles.inputLabel}>Đến giờ</Text>
							<TextInput
								value={timeTo}
								onChangeText={setTimeTo}
								placeholder="10:00"
								style={styles.input}
							/>
						</View>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={styles.sectionTitle}>Trạng thái đơn</Text>

					<View style={styles.statusRow}>
						{statusOptions.map((status) => {
							const active = status === selectedStatus;

							return (
								<Pressable
									key={status}
									style={[
										styles.statusChip,
										active && styles.statusChipActive,
									]}
									onPress={() => setSelectedStatus(status)}
								>
									<Text
										style={[
											styles.statusChipText,
											active && styles.statusChipTextActive,
										]}
									>
										{getStatusLabel(status)}
									</Text>
								</Pressable>
							);
						})}
					</View>

					{selectedStatus === "rejected" ? (
						<>
							<Text style={styles.inputLabel}>Lý do từ chối</Text>
							<TextInput
								value={rejectionReason}
								onChangeText={setRejectionReason}
								placeholder="Nhập lý do..."
								style={[styles.input, styles.multilineInput]}
								multiline
							/>
						</>
					) : null}

					<Text style={styles.inputLabel}>Ghi chú admin</Text>
					<TextInput
						value={adminNote}
						onChangeText={setAdminNote}
						placeholder="Nhập ghi chú nội bộ..."
						style={[styles.input, styles.multilineInput]}
						multiline
					/>
				</View>

				<View style={styles.card}>
					<Text style={styles.sectionTitle}>Kết quả thu gom</Text>

					{order.items.map((item) => {
						const draft = itemDrafts[item.id] ?? {
							finalQuantity: "",
							finalSubtotal: "",
						};

						return (
							<View key={item.id} style={styles.itemCard}>
								<Text style={styles.itemTitle}>
									{item.scrap_categories?.name ?? "Phế liệu"}
								</Text>

								<Text style={styles.itemMeta}>
									Ước lượng: {item.estimated_quantity ?? 0} {item.unit}
								</Text>

								<View style={styles.twoColumnRow}>
									<View style={styles.twoColumnItem}>
										<Text style={styles.inputLabel}>
											Khối lượng thực tế
										</Text>
										<TextInput
											value={draft.finalQuantity}
											onChangeText={(value) =>
												updateItemDraft(
													item.id,
													"finalQuantity",
													value
												)
											}
											keyboardType="decimal-pad"
											placeholder="0"
											style={styles.input}
										/>
									</View>

									<View style={styles.twoColumnItem}>
										<Text style={styles.inputLabel}>Thành tiền</Text>
										<TextInput
											value={draft.finalSubtotal}
											onChangeText={(value) =>
												updateItemDraft(
													item.id,
													"finalSubtotal",
													value
												)
											}
											keyboardType="decimal-pad"
											placeholder="0"
											style={styles.input}
										/>
									</View>
								</View>
							</View>
						);
					})}

					<View style={styles.finalTotalBox}>
						<Text style={styles.finalTotalLabel}>Tổng thanh toán dự kiến</Text>
						<Text style={styles.finalTotalValue}>
							{formatVndAmount(calculatedFinalTotal)} VND
						</Text>
					</View>
				</View>

				<Pressable
					style={[
						styles.saveButton,
						updateOrder.isPending && styles.saveButtonDisabled,
					]}
					onPress={handleSave}
					disabled={updateOrder.isPending}
				>
					{updateOrder.isPending ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<Text style={styles.saveButtonText}>Lưu thay đổi</Text>
					)}
				</Pressable>
			</ScrollView>
		</SafeAreaView>
	);

	function updateItemDraft(
		itemId: string,
		key: keyof ItemDraft,
		value: string
	) {
		setItemDrafts((current) => ({
			...current,
			[itemId]: {
				...(current[itemId] ?? {
					finalQuantity: "",
					finalSubtotal: "",
				}),
				[key]: value,
			},
		}));
	}
}

function getSelectableStatuses(
	current: PickupOrder["status"]
): PickupOrder["status"][] {
	switch (current) {
		case "pending":
			return ["pending", "confirmed", "rejected"];
		case "confirmed":
			return ["confirmed", "on_the_way"];
		case "on_the_way":
			return ["on_the_way", "completed"];
		default:
			return [current];
	}
}

function getStatusLabel(status: PickupOrder["status"]) {
	switch (status) {
		case "pending":
			return "Chờ xác nhận";
		case "confirmed":
			return "Đã xác nhận";
		case "rejected":
			return "Từ chối";
		case "on_the_way":
			return "Đang tới";
		case "completed":
			return "Hoàn thành";
		case "cancelled":
			return "Đã hủy";
	}
}

function parseNullableNumber(value: string): number | null {
	const normalized = value.trim().replace(",", ".");

	if (!normalized) {
		return null;
	}

	const parsed = Number(normalized);

	return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTime(value: string): string | null {
	const trimmed = value.trim();

	if (!trimmed) {
		return null;
	}

	return `${trimmed}:00`;
}

function isValidDateString(value: string) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimePair(from: string, to: string) {
	const cleanFrom = from.trim();
	const cleanTo = to.trim();

	if (!cleanFrom && !cleanTo) {
		return true;
	}

	if (!cleanFrom || !cleanTo) {
		return false;
	}

	const validPattern = /^\d{2}:\d{2}$/;

	if (!validPattern.test(cleanFrom) || !validPattern.test(cleanTo)) {
		return false;
	}

	return cleanTo > cleanFrom;
}

function getOrderImageUrl(order: PickupOrderDetails) {
	const image = order.images[0];

	if (!image) {
		return null;
	}

	return image.public_url || getPickupOrderImagePublicUrl(image.storage_path);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "800",
		color: "#71727A",
	},
	header: {
		height: 84,
		paddingHorizontal: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#FFFFFF",
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18,
		shadowColor: "#000",
		shadowOpacity: 0.05,
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
		padding: 20,
		paddingBottom: 42,
		gap: 16,
	},
	imageFrame: {
		height: 190,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		backgroundColor: "#DDFBE8",
	},
	orderImage: {
		width: "100%",
		height: "100%",
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
	sectionTitle: {
		fontSize: 17,
		fontWeight: "900",
		color: "#1E1E1E",
		marginBottom: 14,
	},
	label: {
		marginTop: 10,
		fontSize: 12,
		fontWeight: "700",
		color: "#71727A",
	},
	value: {
		marginTop: 4,
		fontSize: 14,
		lineHeight: 20,
		fontWeight: "700",
		color: "#1E1E1E",
	},
	inputLabel: {
		marginTop: 10,
		marginBottom: 6,
		fontSize: 12,
		fontWeight: "800",
		color: "#494A50",
	},
	input: {
		minHeight: 48,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 12,
		paddingHorizontal: 12,
		fontSize: 14,
		color: "#1E1E1E",
		backgroundColor: "#FFFFFF",
	},
	multilineInput: {
		minHeight: 92,
		paddingTop: 12,
		textAlignVertical: "top",
	},
	twoColumnRow: {
		flexDirection: "row",
		gap: 12,
	},
	twoColumnItem: {
		flex: 1,
	},
	statusRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	statusChip: {
		paddingHorizontal: 12,
		paddingVertical: 9,
		borderRadius: 999,
		backgroundColor: "#F3F4F6",
	},
	statusChipActive: {
		backgroundColor: "#DBEAFE",
	},
	statusChipText: {
		fontSize: 12,
		fontWeight: "800",
		color: "#71727A",
	},
	statusChipTextActive: {
		color: "#2563EB",
	},
	itemCard: {
		padding: 14,
		borderRadius: 14,
		backgroundColor: "#F9FAFB",
		marginBottom: 12,
	},
	itemTitle: {
		fontSize: 14,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	itemMeta: {
		marginTop: 4,
		fontSize: 12,
		color: "#71727A",
	},
	finalTotalBox: {
		marginTop: 6,
		padding: 14,
		borderRadius: 14,
		backgroundColor: "#F0FDF4",
	},
	finalTotalLabel: {
		fontSize: 12,
		fontWeight: "800",
		color: "#166534",
	},
	finalTotalValue: {
		marginTop: 6,
		fontSize: 20,
		fontWeight: "900",
		color: "#15803D",
	},
	saveButton: {
		minHeight: 54,
		borderRadius: 16,
		backgroundColor: "#22C55E",
		alignItems: "center",
		justifyContent: "center",
	},
	saveButtonDisabled: {
		opacity: 0.7,
	},
	saveButtonText: {
		fontSize: 15,
		fontWeight: "900",
		color: "#FFFFFF",
	},
});
