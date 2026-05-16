import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	useMyLatestAddress,
	useSaveMyPickupAddress,
} from "@/src/features/addresses/addresses.hooks";
import {
	useActiveScrapPrices,
	useScrapCategories,
} from "@/src/features/catalog/catalog.hooks";
import { useCreatePickupOrder } from "@/src/features/orders/orders.hooks";
import {
	buildPricedOrderItemFromPrice,
	calculateEstimatedRange,
	formatVndAmount,
} from "@/src/features/orders/orders.pricing";
import { uploadPickupOrderImage } from "@/src/features/storage/storage.api";
import { supabase } from "@/src/lib/supabase";
import type {
	Address,
	AddressSnapshot,
	ScrapCategory,
	ScrapPrice,
} from "@/src/types/app.types";

type QuantityMap = Record<string, string>;

export default function NewOrderScreen() {
	const { data: categories = [], isLoading: isCategoryLoading } =
		useScrapCategories();
	const { data: activePrices = [], isLoading: isPriceLoading } =
		useActiveScrapPrices();
	const { data: latestAddress, isLoading: isAddressLoading } =
		useMyLatestAddress();
	const createOrder = useCreatePickupOrder();
	const savePickupAddress = useSaveMyPickupAddress();

	const [imageUri, setImageUri] = useState<string | null>(null);
	const [pickerModalVisible, setPickerModalVisible] = useState(false);
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [pickupAddress, setPickupAddress] = useState("");
	const [hasEditedAddress, setHasEditedAddress] = useState(false);
	const [note, setNote] = useState("");
	const [quantities, setQuantities] = useState<QuantityMap>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (hasEditedAddress || !latestAddress) {
			return;
		}

		setPickupAddress(formatAddress(latestAddress));
	}, [hasEditedAddress, latestAddress]);

	const latestPriceByCategory = useMemo(
		() => buildLatestPriceMap(activePrices),
		[activePrices]
	);

	const pricedItems = useMemo(() => {
		return categories
			.map((category) => {
				const quantity = Number(quantities[category.id] ?? 0);

				if (!Number.isFinite(quantity) || quantity <= 0) {
					return null;
				}

				return buildPricedOrderItemFromPrice({
					category,
					price: latestPriceByCategory.get(category.id) ?? null,
					quantity,
				});
			})
			.filter(Boolean);
	}, [categories, latestPriceByCategory, quantities]);

	const selectedCategoriesWithoutPrice = useMemo(() => {
		return categories.filter((category) => {
			const quantity = Number(quantities[category.id] ?? 0);

			return quantity > 0 && !latestPriceByCategory.has(category.id);
		});
	}, [categories, latestPriceByCategory, quantities]);

	const estimatedRange = calculateEstimatedRange(
		pricedItems as NonNullable<(typeof pricedItems)[number]>[]
	);
	const isCatalogLoading = isCategoryLoading || isPriceLoading;

	async function handlePickFromLibrary() {
		setPickerModalVisible(false);

		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permission.granted) {
			Alert.alert(
				"Thiếu quyền truy cập",
				"Vui lòng cấp quyền thư viện ảnh để chọn ảnh phế liệu."
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled) {
			setImageUri(result.assets[0]?.uri ?? null);
		}
	}

	async function handleTakePhoto() {
		setPickerModalVisible(false);

		const permission = await ImagePicker.requestCameraPermissionsAsync();

		if (!permission.granted) {
			Alert.alert(
				"Thiếu quyền camera",
				"Vui lòng cấp quyền camera để chụp ảnh phế liệu."
			);
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled) {
			setImageUri(result.assets[0]?.uri ?? null);
		}
	}

	function updateQuantity(categoryId: string, value: string) {
		const sanitized = value.replace(/[^0-9.]/g, "");

		setQuantities((current) => ({
			...current,
			[categoryId]: sanitized,
		}));
	}

	function incrementQuantity(categoryId: string) {
		const current = Number(quantities[categoryId] ?? 0);

		setQuantities((state) => ({
			...state,
			[categoryId]: String(current + 1),
		}));
	}

	function decrementQuantity(categoryId: string) {
		const current = Number(quantities[categoryId] ?? 0);

		setQuantities((state) => ({
			...state,
			[categoryId]: String(Math.max(0, current - 1)),
		}));
	}

	async function handleSubmit() {
		const addressLine = pickupAddress.trim();

		if (!addressLine) {
			Alert.alert("Thiếu địa chỉ", "Vui lòng nhập địa chỉ thu gom.");
			return;
		}

		if (selectedCategoriesWithoutPrice.length > 0) {
			Alert.alert(
				"Thiếu bảng giá",
				`Chưa có giá đang kích hoạt cho: ${selectedCategoriesWithoutPrice
					.map((category) => category.name)
					.join(", ")}.`
			);
			return;
		}

		if (pricedItems.length === 0) {
			Alert.alert(
				"Thiếu khối lượng",
				"Vui lòng nhập ít nhất một loại phế liệu."
			);
			return;
		}

		setIsSubmitting(true);

		try {
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError) {
				throw authError;
			}

			if (!user) {
				throw new Error("User is not authenticated.");
			}

			let imagePaths: string[] = [];

			if (imageUri) {
				const uploaded = await uploadPickupOrderImage({
					userId: user.id,
					localUri: imageUri,
				});

				imagePaths = [uploaded.storagePath];
			}

			const addressSnapshot: AddressSnapshot = {
				address_line: addressLine,
			};
			const savedAddress = await ensureLatestAddress(addressSnapshot);

			const orderId = await createOrder.mutateAsync({
				scheduled_date: toDateInput(selectedDate),
				address_id: savedAddress.id,
				address_snapshot: {
					...addressSnapshot,
					recipient_name: savedAddress.recipient_name,
					phone: savedAddress.phone,
					ward: savedAddress.ward,
					district: savedAddress.district,
					city: savedAddress.city,
					latitude: savedAddress.latitude,
					longitude: savedAddress.longitude,
				},
				note: note.trim() || null,
				items: pricedItems as NonNullable<(typeof pricedItems)[number]>[],
				image_paths: imagePaths,
			});

			router.replace(`/orders/${orderId}`);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Không thể tạo đơn hàng. Vui lòng thử lại.";

			Alert.alert("Tạo đơn thất bại", message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function ensureLatestAddress(address: AddressSnapshot) {
		if (
			latestAddress &&
			formatAddress(latestAddress).trim() === address.address_line.trim()
		) {
			return latestAddress;
		}

		return savePickupAddress.mutateAsync(address);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={22} color="#1E1E1E" />
				</Pressable>

				<Text style={styles.headerTitle}>Đơn hàng mới</Text>

				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Pressable
					style={styles.imagePicker}
					onPress={() => setPickerModalVisible(true)}
				>
					{imageUri ? (
						<Image source={{ uri: imageUri }} style={styles.selectedImage} />
					) : (
						<>
							<View style={styles.cameraIconWrap}>
								<Ionicons name="camera" size={24} color="#16A34A" />
							</View>
							<Text style={styles.imagePickerText}>
								Chụp hình phế liệu của bạn
							</Text>
						</>
					)}
				</Pressable>

				<Text style={styles.sectionTitle}>Khối lượng phế liệu</Text>

				{isCatalogLoading ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : (
					<View style={styles.fieldList}>
						{categories.map((category) => {
							const price = latestPriceByCategory.get(category.id) ?? null;

							return (
								<CategoryQuantityField
									key={category.id}
									category={category}
									price={price}
									value={quantities[category.id] ?? ""}
									onChangeText={(value) =>
										updateQuantity(category.id, value)
									}
									onIncrement={() => incrementQuantity(category.id)}
									onDecrement={() => decrementQuantity(category.id)}
								/>
							);
						})}
					</View>
				)}

				<Text style={styles.sectionTitle}>Thời gian</Text>

				<CalendarCard
					selectedDate={selectedDate}
					onSelectDate={setSelectedDate}
				/>

				<Text style={styles.sectionTitle}>Địa chỉ</Text>

				<View style={styles.addressCard}>
					<View style={styles.locationIconWrap}>
						<Ionicons name="location-outline" size={22} color="#22C55E" />
					</View>

					<TextInput
						value={pickupAddress}
						onChangeText={(value) => {
							setHasEditedAddress(true);
							setPickupAddress(value);
						}}
						placeholder={
							isAddressLoading
								? "Đang tải địa chỉ gần nhất..."
								: "Nhập địa chỉ thu gom"
						}
						multiline
						style={styles.addressInput}
					/>
				</View>

				<Text style={styles.sectionTitle}>Ghi chú</Text>

				<TextInput
					value={note}
					onChangeText={setNote}
					placeholder="Ghi chú thêm cho người thu gom"
					multiline
					style={styles.noteInput}
				/>

				<View style={styles.estimateCard}>
					<Text style={styles.estimateLabel}>Giá ước lượng</Text>
					<Text style={styles.estimateValue}>
						{formatVndAmount(estimatedRange.min)} ~{" "}
						{formatVndAmount(estimatedRange.max)} VND
					</Text>
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<Pressable style={styles.cancelButton} onPress={() => router.back()}>
					<Text style={styles.cancelButtonText}>Hủy</Text>
				</Pressable>

				<Pressable
					style={[
						styles.submitButton,
						isSubmitting && styles.disabledButton,
					]}
					disabled={isSubmitting}
					onPress={handleSubmit}
				>
					{isSubmitting ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<Text style={styles.submitButtonText}>Hoàn thành</Text>
					)}
				</Pressable>
			</View>

			<Modal
				transparent
				animationType="fade"
				visible={pickerModalVisible}
				onRequestClose={() => setPickerModalVisible(false)}
			>
				<Pressable
					style={styles.modalBackdrop}
					onPress={() => setPickerModalVisible(false)}
				>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Chọn ảnh phế liệu</Text>

						<Pressable style={styles.modalAction} onPress={handleTakePhoto}>
							<Ionicons name="camera-outline" size={22} color="#22C55E" />
							<Text style={styles.modalActionText}>Chụp ảnh</Text>
						</Pressable>

						<Pressable
							style={styles.modalAction}
							onPress={handlePickFromLibrary}
						>
							<Ionicons name="images-outline" size={22} color="#22C55E" />
							<Text style={styles.modalActionText}>
								Chọn từ thư viện
							</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</SafeAreaView>
	);
}

function CategoryQuantityField({
	category,
	price,
	value,
	onChangeText,
	onIncrement,
	onDecrement,
}: {
	category: ScrapCategory;
	price: ScrapPrice | null;
	value: string;
	onChangeText: (value: string) => void;
	onIncrement: () => void;
	onDecrement: () => void;
}) {
	return (
		<View>
			<Text style={styles.fieldLabel}>
				{category.name} <Text style={styles.required}>*</Text>
			</Text>
			<Text style={styles.fieldHelper}>
				{price
					? `${formatVndAmount(price.price_min)}${
							price.price_max
								? ` ~ ${formatVndAmount(price.price_max)}`
								: ""
						} ${price.currency}/${category.unit}`
					: "Chưa có giá đang kích hoạt"}
			</Text>

			<View style={styles.quantityInputWrap}>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					keyboardType="decimal-pad"
					placeholder="0"
					style={styles.quantityInput}
				/>

				<View style={styles.stepperWrap}>
					<Pressable onPress={onIncrement}>
						<Ionicons name="chevron-up" size={18} color="#1E1E1E" />
					</Pressable>
					<Pressable onPress={onDecrement}>
						<Ionicons name="chevron-down" size={18} color="#1E1E1E" />
					</Pressable>
				</View>
			</View>
		</View>
	);
}

function CalendarCard(props: {
	selectedDate: Date;
	onSelectDate: (date: Date) => void;
}) {
	const [visibleMonth, setVisibleMonth] = useState(
		new Date(
			props.selectedDate.getFullYear(),
			props.selectedDate.getMonth(),
			1
		)
	);

	const monthLabel = new Intl.DateTimeFormat("en-US", {
		month: "long",
		year: "numeric",
	}).format(visibleMonth);

	const days = buildCalendarDays(visibleMonth);

	return (
		<View style={styles.calendarCard}>
			<View style={styles.calendarHeader}>
				<Text style={styles.calendarMonth}>{monthLabel}</Text>

				<View style={styles.calendarNavRow}>
					<Pressable
						onPress={() =>
							setVisibleMonth(
								new Date(
									visibleMonth.getFullYear(),
									visibleMonth.getMonth() - 1,
									1
								)
							)
						}
					>
						<Ionicons name="chevron-back" size={24} color="#22C55E" />
					</Pressable>

					<Pressable
						onPress={() =>
							setVisibleMonth(
								new Date(
									visibleMonth.getFullYear(),
									visibleMonth.getMonth() + 1,
									1
								)
							)
						}
					>
						<Ionicons name="chevron-forward" size={24} color="#22C55E" />
					</Pressable>
				</View>
			</View>

			<View style={styles.weekHeaderRow}>
				{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
					<Text key={day} style={styles.weekHeaderText}>
						{day}
					</Text>
				))}
			</View>

			<View style={styles.calendarGrid}>
				{days.map((day, index) => {
					if (!day) {
						return <View key={`empty-${index}`} style={styles.dayCell} />;
					}

					const isSelected = isSameDay(day, props.selectedDate);

					return (
						<Pressable
							key={day.toISOString()}
							style={[
								styles.dayCell,
								isSelected && styles.selectedDayCell,
							]}
							onPress={() => props.onSelectDate(day)}
						>
							<Text
								style={[
									styles.dayText,
									isSelected && styles.selectedDayText,
								]}
							>
								{day.getDate()}
							</Text>
						</Pressable>
					);
				})}
			</View>

			<View style={styles.timePlaceholderRow}>
				<Text style={styles.timeLabel}>Time</Text>
				<View style={styles.timePlaceholder}>
					<Text style={styles.timePlaceholderText}>
						Admin xác nhận sau
					</Text>
				</View>
			</View>
		</View>
	);
}

function buildLatestPriceMap(prices: ScrapPrice[]) {
	const map = new Map<string, ScrapPrice>();

	for (const price of prices) {
		if (!map.has(price.scrap_category_id)) {
			map.set(price.scrap_category_id, price);
		}
	}

	return map;
}

function formatAddress(address: Address) {
	return [
		address.address_line,
		address.ward,
		address.district,
		address.city,
	]
		.filter(Boolean)
		.join(", ");
}

function buildCalendarDays(month: Date): Array<Date | null> {
	const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
	const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

	const result: Array<Date | null> = [];

	for (let i = 0; i < firstDay.getDay(); i += 1) {
		result.push(null);
	}

	for (let day = 1; day <= lastDay.getDate(); day += 1) {
		result.push(new Date(month.getFullYear(), month.getMonth(), day));
	}

	return result;
}

function isSameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function toDateInput(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
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
	backButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	headerSpacer: {
		width: 40,
	},
	content: {
		padding: 20,
		paddingBottom: 140,
	},
	imagePicker: {
		height: 160,
		borderRadius: 18,
		borderWidth: 1.5,
		borderStyle: "dashed",
		borderColor: "#C5C6CC",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	cameraIconWrap: {
		width: 58,
		height: 58,
		borderRadius: 29,
		backgroundColor: "#DCFCE7",
		alignItems: "center",
		justifyContent: "center",
	},
	imagePickerText: {
		marginTop: 12,
		fontSize: 14,
		fontWeight: "700",
		color: "#494A50",
	},
	selectedImage: {
		width: "100%",
		height: "100%",
	},
	sectionTitle: {
		marginTop: 24,
		marginBottom: 12,
		fontSize: 20,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	loadingBox: {
		paddingVertical: 40,
		alignItems: "center",
	},
	fieldList: {
		gap: 14,
	},
	fieldLabel: {
		fontSize: 14,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	required: {
		color: "#ED3241",
	},
	fieldHelper: {
		marginTop: 2,
		marginBottom: 8,
		fontSize: 11,
		color: "#71727A",
	},
	quantityInputWrap: {
		height: 58,
		borderRadius: 16,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
	},
	quantityInput: {
		flex: 1,
		fontSize: 15,
		fontWeight: "700",
		color: "#1E1E1E",
	},
	stepperWrap: {
		gap: 2,
	},
	calendarCard: {
		padding: 18,
		borderRadius: 22,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 10 },
		shadowRadius: 20,
		elevation: 4,
	},
	calendarHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	calendarMonth: {
		fontSize: 14,
		fontWeight: "700",
		color: "#494A50",
	},
	calendarNavRow: {
		flexDirection: "row",
		gap: 18,
	},
	weekHeaderRow: {
		marginTop: 18,
		flexDirection: "row",
	},
	weekHeaderText: {
		width: `${100 / 7}%`,
		textAlign: "center",
		fontSize: 11,
		fontWeight: "800",
		color: "#494A50",
	},
	calendarGrid: {
		marginTop: 10,
		flexDirection: "row",
		flexWrap: "wrap",
		rowGap: 12,
	},
	dayCell: {
		width: `${100 / 7}%`,
		height: 36,
		alignItems: "center",
		justifyContent: "center",
	},
	selectedDayCell: {
		borderRadius: 18,
		backgroundColor: "#22C55E",
	},
	dayText: {
		fontSize: 13,
		fontWeight: "700",
		color: "#1E1E1E",
	},
	selectedDayText: {
		color: "#FFFFFF",
	},
	timePlaceholderRow: {
		marginTop: 18,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	timeLabel: {
		fontSize: 13,
		fontWeight: "700",
		color: "#494A50",
	},
	timePlaceholder: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: "#E5E7EB",
	},
	timePlaceholderText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#71727A",
	},
	addressCard: {
		minHeight: 82,
		padding: 16,
		borderRadius: 18,
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
	},
	locationIconWrap: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "#F0FDF4",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	addressInput: {
		flex: 1,
		minHeight: 48,
		fontSize: 14,
		lineHeight: 20,
		fontWeight: "600",
		color: "#1E1E1E",
		textAlignVertical: "top",
	},
	noteInput: {
		minHeight: 92,
		padding: 16,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		fontSize: 14,
		color: "#1E1E1E",
		textAlignVertical: "top",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
	},
	estimateCard: {
		marginTop: 20,
		padding: 18,
		borderRadius: 18,
		backgroundColor: "#F0FDF4",
		borderWidth: 1,
		borderColor: "#BBF7D0",
	},
	estimateLabel: {
		fontSize: 13,
		fontWeight: "700",
		color: "#494A50",
	},
	estimateValue: {
		marginTop: 6,
		fontSize: 20,
		fontWeight: "900",
		color: "#00A63E",
	},
	footer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 20,
		paddingTop: 12,
		paddingBottom: 24,
		flexDirection: "row",
		gap: 12,
		backgroundColor: "#FFFFFF",
	},
	cancelButton: {
		flex: 1,
		height: 56,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#22C55E",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: "800",
		color: "#16A34A",
	},
	submitButton: {
		flex: 1,
		height: 56,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#22C55E",
	},
	disabledButton: {
		opacity: 0.7,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: "800",
		color: "#FFFFFF",
	},
	modalBackdrop: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.35)",
	},
	modalCard: {
		padding: 20,
		borderRadius: 22,
		backgroundColor: "#FFFFFF",
	},
	modalTitle: {
		marginBottom: 14,
		fontSize: 18,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	modalAction: {
		height: 54,
		paddingHorizontal: 14,
		borderRadius: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "#F8F9FE",
		marginTop: 10,
	},
	modalActionText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#1E1E1E",
	},
});
