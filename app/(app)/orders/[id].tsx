import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePickupOrder } from "@/src/features/orders/orders.hooks";
import {
	calculateEstimatedRangeFromStoredItems,
	formatVndAmount,
} from "@/src/features/orders/orders.pricing";
import type { AddressSnapshot } from "@/src/types/app.types";
import { getPickupOrderImagePublicUrl } from "@/src/features/storage/storage.api";

export default function OrderDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: order, isLoading } = usePickupOrder(id ?? "");

	if (isLoading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#22C55E" />
			</SafeAreaView>
		);
	}

	if (!order) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<Text style={styles.emptyText}>Không tìm thấy đơn hàng.</Text>
			</SafeAreaView>
		);
	}

	const estimatedRange = calculateEstimatedRangeFromStoredItems(order.items);
	const addressSnapshot =
		order.address_snapshot as unknown as AddressSnapshot;

	const imageUrl = order.images[0]?.storage_path
		? getPickupOrderImagePublicUrl(order.images[0].storage_path)
		: null;

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Ionicons
					name="arrow-back"
					size={22}
					color="#1E1E1E"
					onPress={() => router.back()}
				/>
				<Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
				<View style={{ width: 22 }} />
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<OrderProgress status={order.status} />

				<View style={styles.imageArea}>
					{imageUrl ? (
						<Image
							source={{ uri: imageUrl }}
							style={styles.orderImage}
						/>
					) : (
						<Ionicons name="image-outline" size={46} color="#86EFAC" />
					)}
				</View>

				<Text style={styles.sectionTitle}>Tổng quan đơn hàng</Text>

				<View style={styles.summaryCard}>
					<Text style={styles.summaryCaption}>Vật liệu và khối lượng</Text>

					{order.items.map((item) => (
						<Text key={item.id} style={styles.summaryItem}>
							{item.scrap_categories?.name ?? "Phế liệu"} (
							{item.estimated_quantity ?? 0}
							{item.unit})
						</Text>
					))}

					<Text style={styles.summaryCaptionSpaced}>Giá ước lượng</Text>
					<Text style={styles.summaryPrice}>
						{estimatedRange
							? `${formatVndAmount(
								estimatedRange.min
							)} ~ ${formatVndAmount(
								estimatedRange.max
							)} ${estimatedRange.currency}`
							: "Đang cập nhật giá"}
					</Text>
				</View>

				<Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>

				<View style={styles.infoCard}>
					<View style={styles.infoRow}>
						<View style={styles.clockIcon}>
							<Ionicons name="time-outline" size={22} color="#2563EB" />
						</View>

						<View style={styles.infoTextWrap}>
							<Text style={styles.infoLabel}>Ngày và giờ</Text>
							<Text style={styles.infoValue}>
								{formatSchedule(order.scheduled_date, order.scheduled_time_from, order.scheduled_time_to)}
							</Text>
						</View>
					</View>

					<View style={styles.infoRow}>
						<View style={styles.locationIcon}>
							<Ionicons
								name="location-outline"
								size={22}
								color="#16A34A"
							/>
						</View>

						<View style={styles.infoTextWrap}>
							<Text style={styles.infoLabel}>Địa chỉ</Text>
							<Text style={styles.infoValue}>
								{addressSnapshot?.address_line || "Chưa có địa chỉ"}
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function OrderProgress({
	status,
}: {
	status:
	| "pending"
	| "confirmed"
	| "rejected"
	| "on_the_way"
	| "completed"
	| "cancelled";
}) {
	const currentStep =
		status === "pending"
			? 1
			: status === "confirmed"
				? 2
				: status === "on_the_way"
					? 3
					: status === "completed"
						? 4
						: 1;

	const steps = ["Chờ xác nhận", "Xác nhận", "Đang tới", "Hoàn thành"];

	return (
		<View style={styles.progressCard}>
			<View style={styles.progressLine} />

			<View style={styles.progressSteps}>
				{steps.map((step, index) => {
					const stepNumber = index + 1;
					const isDone = stepNumber < currentStep;
					const isCurrent = stepNumber === currentStep;

					return (
						<View key={step} style={styles.progressStep}>
							<View
								style={[
									styles.progressCircle,
									isDone && styles.progressCircleDone,
									isCurrent && styles.progressCircleCurrent,
								]}
							>
								<Text
									style={[
										styles.progressNumber,
										(isCurrent) && styles.progressNumberActive,
										(isDone) && styles.progressNumberDone,
									]}
								>
									{stepNumber}
								</Text>
							</View>
							<Text style={styles.progressLabel}>{step}</Text>
						</View>
					);
				})}
			</View>
		</View>
	);
}

function formatSchedule(
	date: string,
	timeFrom: string | null,
	timeTo: string | null
) {
	const formattedDate = new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(`${date}T00:00:00`));

	if (!timeFrom || !timeTo) {
		return `${formattedDate}, chờ admin xác nhận giờ`;
	}

	return `${formattedDate}, ${timeFrom.slice(0, 5)} - ${timeTo.slice(0, 5)}`;
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	loadingContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#71727A",
	},
	header: {
		height: 88,
		paddingHorizontal: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 12,
		elevation: 3,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	content: {
		padding: 20,
		paddingBottom: 40,
	},
	progressCard: {
		position: "relative",
		paddingVertical: 18,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: "#DBEAFE",
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
	},
	progressLine: {
		position: "absolute",
		left: 34,
		right: 34,
		top: 33,
		height: 3,
		backgroundColor: "#D1D5DB",
	},
	progressSteps: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	progressStep: {
		alignItems: "center",
		width: "25%",
	},
	progressCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#D1D5DB",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1,
	},
	progressCircleDone: {
		backgroundColor: "#22C55f",
	},
	progressCircleCurrent: {
		borderWidth: 2,
		borderColor: "#3B82F6",
		backgroundColor: "#FFFFFF",
	},
	progressNumber: {
		fontSize: 12,
		fontWeight: "800",
		color: "#71727A",
	},
	progressNumberDone: {
		color: "#ffffff"
	},
	progressNumberActive: {
		color: "#3B82F6",
	},
	progressLabel: {
		marginTop: 8,
		fontSize: 10,
		textAlign: "center",
		color: "#494A50",
	},
	imageArea: {
		marginTop: 16,
		height: 190,
		borderRadius: 18,
		backgroundColor: "#DCFCE7",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	orderImage: {
		width: "100%",
		height: "100%",
	},
	sectionTitle: {
		marginTop: 22,
		marginBottom: 10,
		fontSize: 20,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	summaryCard: {
		padding: 20,
		borderRadius: 20,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.07,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
	},
	summaryCaption: {
		fontSize: 13,
		color: "#71727A",
		marginBottom: 8,
	},
	summaryCaptionSpaced: {
		marginTop: 16,
		fontSize: 13,
		color: "#71727A",
	},
	summaryItem: {
		fontSize: 16,
		fontWeight: "800",
		color: "#1E1E1E",
		marginTop: 4,
	},
	summaryPrice: {
		marginTop: 5,
		fontSize: 21,
		fontWeight: "900",
		color: "#00A63E",
	},
	infoCard: {
		padding: 20,
		borderRadius: 20,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.07,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
		gap: 18,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	clockIcon: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "#EFF6FF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	locationIcon: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "#F0FDF4",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	infoTextWrap: {
		flex: 1,
	},
	infoLabel: {
		fontSize: 13,
		color: "#71727A",
		fontWeight: "700",
	},
	infoValue: {
		marginTop: 3,
		fontSize: 15,
		lineHeight: 21,
		fontWeight: "800",
		color: "#1E1E1E",
	},
});