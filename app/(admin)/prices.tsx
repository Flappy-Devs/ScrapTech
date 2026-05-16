import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
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
	useAdminScrapPriceCatalog,
	useCreateAdminScrapPrice,
	useDeleteAdminScrapPrice,
	useUpdateAdminScrapPrice,
} from "@/src/features/admin/admin.hooks";
import type { AdminScrapPriceCategoryRow } from "@/src/features/admin/admin.api";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import type { ScrapPrice } from "@/src/types/app.types";

interface PriceEditorState {
	mode: "create" | "edit";
	categoryId: string;
	priceId?: string;
	areaCode: string;
	priceMin: string;
	priceMax: string;
	currency: string;
}

export default function AdminPricesScreen() {
	const { data: rows = [], isLoading } = useAdminScrapPriceCatalog();
	const createPrice = useCreateAdminScrapPrice();
	const updatePrice = useUpdateAdminScrapPrice();
	const deletePrice = useDeleteAdminScrapPrice();

	const [editor, setEditor] = useState<PriceEditorState | null>(null);
	const [selectedCategory, setSelectedCategory] =
		useState<AdminScrapPriceCategoryRow | null>(null);

	const isSaving = createPrice.isPending || updatePrice.isPending;

	useEffect(() => {
		if (!selectedCategory) return;

		const freshCategory = rows.find(
			(row) => row.category.id === selectedCategory.category.id
		);

		if (freshCategory) {
			setSelectedCategory(freshCategory);
		}
	}, [rows, selectedCategory]);

	async function handleSavePrice() {
		if (!editor) return;

		const priceMin = parseNullableNumber(editor.priceMin);
		const priceMax = parseNullableNumber(editor.priceMax);

		if (priceMin === null) {
			Alert.alert("Thiếu giá tối thiểu", "Vui lòng nhập giá hợp lệ.");
			return;
		}

		if (priceMax !== null && priceMax < priceMin) {
			Alert.alert(
				"Khoảng giá không hợp lệ",
				"Giá cao nhất phải lớn hơn hoặc bằng giá thấp nhất."
			);
			return;
		}

		try {
			if (editor.mode === "create") {
				await createPrice.mutateAsync({
					scrapCategoryId: editor.categoryId,
					areaCode: editor.areaCode.trim() || null,
					priceMin,
					priceMax,
					currency: editor.currency.trim() || "VND",
				});
			} else {
				await updatePrice.mutateAsync({
					id: editor.priceId!,
					scrapCategoryId: editor.categoryId,
					areaCode: editor.areaCode.trim() || null,
					priceMin,
					priceMax,
					currency: editor.currency.trim() || "VND",
				});
			}

			setEditor(null);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Không thể lưu giá.";

			Alert.alert("Lưu thất bại", message);
		}
	}

	function handleDelete(priceId: string) {
		Alert.alert(
			"Xóa bảng giá",
			"Bạn có chắc chắn muốn xóa mức giá này không?",
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Xóa",
					style: "destructive",
					onPress: async () => {
						try {
							await deletePrice.mutateAsync(priceId);
							setSelectedCategory((current) =>
								current
									? {
											...current,
											prices: current.prices.filter(
												(price) => price.id !== priceId
											),
										}
									: current
							);
						} catch (error) {
							const message =
								error instanceof Error
									? error.message
									: "Không thể xóa mức giá.";

							Alert.alert("Xóa thất bại", message);
						}
					},
				},
			]
		);
	}

	function openCreateEditor(categoryId: string) {
		setEditor({
			mode: "create",
			categoryId,
			areaCode: "",
			priceMin: "",
			priceMax: "",
			currency: "VND",
		});
	}

	function openEditEditor(price: ScrapPrice) {
		setEditor({
			mode: "edit",
			priceId: price.id,
			categoryId: price.scrap_category_id,
			areaCode: price.area_code ?? "",
			priceMin: price.price_min.toString(),
			priceMax: price.price_max?.toString() ?? "",
			currency: price.currency,
		});
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.title}>Quản lý bảng giá</Text>
				<Text style={styles.subtitle}>
					Thêm mới giá sẽ tự động kích hoạt giá đó và tắt các giá cũ cùng
					nhóm.
				</Text>

				{isLoading ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : (
					<View style={styles.categoryList}>
						{rows.map((row) => {
							const visiblePrices = row.prices.slice(0, 5);

							return (
								<View key={row.category.id} style={styles.categoryCard}>
									<View style={styles.categoryHeader}>
										<View style={{ flex: 1 }}>
											<Text style={styles.categoryTitle}>
												{row.category.name}
											</Text>
											<Text style={styles.categoryMeta}>
												Đơn vị: {row.category.unit} • {row.prices.length} mức giá
											</Text>
										</View>

										<Pressable
											style={styles.addButton}
											onPress={() => openCreateEditor(row.category.id)}
										>
											<Ionicons name="add" size={18} color="#FFFFFF" />
											<Text style={styles.addButtonText}>Thêm</Text>
										</Pressable>
									</View>

									{visiblePrices.length === 0 ? (
										<Text style={styles.noPriceText}>Chưa có mức giá.</Text>
									) : (
										<View style={styles.priceList}>
											{visiblePrices.map((price) => (
												<PriceRow
													key={price.id}
													price={price}
													onEdit={() => openEditEditor(price)}
													onDelete={() => handleDelete(price.id)}
												/>
											))}
										</View>
									)}

									{row.prices.length > 5 ? (
										<Pressable
											style={styles.seeAllButton}
											onPress={() => setSelectedCategory(row)}
										>
											<Text style={styles.seeAllText}>
												Xem tất cả {row.prices.length} mức giá
											</Text>
											<Ionicons
												name="chevron-forward"
												size={16}
												color="#16A34A"
											/>
										</Pressable>
									) : null}
								</View>
							);
						})}
					</View>
				)}
			</ScrollView>

			<Modal
				visible={Boolean(editor)}
				animationType="slide"
				transparent
				onRequestClose={() => setEditor(null)}
			>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>
								{editor?.mode === "create"
									? "Thêm mức giá"
									: "Chỉnh sửa mức giá"}
							</Text>

							<Pressable onPress={() => setEditor(null)}>
								<Ionicons name="close" size={24} color="#1E1E1E" />
							</Pressable>
						</View>

						{editor?.mode === "create" ? (
							<View style={styles.activeNotice}>
								<Ionicons
									name="checkmark-circle-outline"
									size={18}
									color="#16A34A"
								/>
								<Text style={styles.activeNoticeText}>
									Mức giá mới sẽ tự động được kích hoạt.
								</Text>
							</View>
						) : null}

						<Text style={styles.inputLabel}>Mã khu vực</Text>
						<TextInput
							value={editor?.areaCode ?? ""}
							onChangeText={(value) =>
								setEditor((current) =>
									current ? { ...current, areaCode: value } : current
								)
							}
							placeholder="Để trống nếu là giá toàn quốc"
							style={styles.input}
						/>

						<View style={styles.twoColumnRow}>
							<View style={styles.twoColumnItem}>
								<Text style={styles.inputLabel}>Giá thấp nhất</Text>
								<TextInput
									value={editor?.priceMin ?? ""}
									onChangeText={(value) =>
										setEditor((current) =>
											current ? { ...current, priceMin: value } : current
										)
									}
									keyboardType="decimal-pad"
									placeholder="0"
									style={styles.input}
								/>
							</View>

							<View style={styles.twoColumnItem}>
								<Text style={styles.inputLabel}>Giá cao nhất</Text>
								<TextInput
									value={editor?.priceMax ?? ""}
									onChangeText={(value) =>
										setEditor((current) =>
											current ? { ...current, priceMax: value } : current
										)
									}
									keyboardType="decimal-pad"
									placeholder="Có thể để trống"
									style={styles.input}
								/>
							</View>
						</View>

						<Text style={styles.inputLabel}>Đơn vị tiền</Text>
						<TextInput
							value={editor?.currency ?? "VND"}
							onChangeText={(value) =>
								setEditor((current) =>
									current ? { ...current, currency: value } : current
								)
							}
							placeholder="VND"
							style={styles.input}
						/>

						<Pressable
							style={[
								styles.saveButton,
								isSaving && styles.saveButtonDisabled,
							]}
							onPress={handleSavePrice}
							disabled={isSaving}
						>
							{isSaving ? (
								<ActivityIndicator color="#FFFFFF" />
							) : (
								<Text style={styles.saveButtonText}>Lưu bảng giá</Text>
							)}
						</Pressable>
					</View>
				</View>
			</Modal>

			<Modal
				visible={Boolean(selectedCategory)}
				animationType="fade"
				transparent
				onRequestClose={() => setSelectedCategory(null)}
			>
				<View style={styles.allPricesBackdrop}>
					<View style={styles.allPricesCard}>
						<View style={styles.modalHeader}>
							<View style={{ flex: 1 }}>
								<Text style={styles.modalTitle}>
									{selectedCategory?.category.name}
								</Text>
								<Text style={styles.categoryMeta}>Tất cả mức giá</Text>
							</View>

							<Pressable onPress={() => setSelectedCategory(null)}>
								<Ionicons name="close" size={24} color="#1E1E1E" />
							</Pressable>
						</View>

						<ScrollView
							contentContainerStyle={styles.allPricesList}
							showsVerticalScrollIndicator={false}
						>
							{selectedCategory?.prices.map((price) => (
								<PriceRow
									key={price.id}
									price={price}
									onEdit={() => openEditEditor(price)}
									onDelete={() => handleDelete(price.id)}
								/>
							))}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

function PriceRow({
	price,
	onEdit,
	onDelete,
}: {
	price: ScrapPrice;
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<View style={styles.priceRow}>
			<View style={{ flex: 1 }}>
				<View style={styles.priceHeader}>
					<Text style={styles.priceValue}>
						{formatVndAmount(price.price_min)}
						{price.price_max !== null
							? ` ~ ${formatVndAmount(price.price_max)}`
							: ""}{" "}
						{price.currency}
					</Text>
					<View
						style={[
							styles.statusBadge,
							price.is_active
								? styles.statusBadgeActive
								: styles.statusBadgeInactive,
						]}
					>
						<Text
							style={[
								styles.statusText,
								price.is_active
									? styles.statusTextActive
									: styles.statusTextInactive,
							]}
						>
							{price.is_active ? "Đang dùng" : "Tạm tắt"}
						</Text>
					</View>
				</View>

				<Text style={styles.priceMeta}>
					{price.area_code ? `Khu vực: ${price.area_code}` : "Giá toàn quốc"}
				</Text>
				<Text style={styles.priceMeta}>Ngày tạo: {formatDateTime(price.created_at)}</Text>
				<Text style={styles.priceMeta}>
					Hiệu lực từ: {formatDateTime(price.effective_from)}
				</Text>
			</View>

			<Pressable style={styles.iconButton} onPress={onEdit}>
				<Ionicons name="create-outline" size={18} color="#2563EB" />
			</Pressable>

			<Pressable style={styles.iconButton} onPress={onDelete}>
				<Ionicons name="trash-outline" size={18} color="#DC2626" />
			</Pressable>
		</View>
	);
}

function parseNullableNumber(value: string): number | null {
	const normalized = value.trim().replace(",", ".");

	if (!normalized) return null;

	const parsed = Number(normalized);

	return Number.isFinite(parsed) ? parsed : null;
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
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
	categoryList: {
		gap: 16,
		marginTop: 18,
	},
	categoryCard: {
		padding: 16,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	categoryHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	categoryTitle: {
		fontSize: 16,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	categoryMeta: {
		marginTop: 4,
		fontSize: 12,
		color: "#71727A",
	},
	addButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 12,
		paddingVertical: 9,
		borderRadius: 999,
		backgroundColor: "#22C55E",
	},
	addButtonText: {
		fontSize: 12,
		fontWeight: "900",
		color: "#FFFFFF",
	},
	noPriceText: {
		marginTop: 14,
		fontSize: 13,
		color: "#71727A",
	},
	priceList: {
		marginTop: 14,
		gap: 10,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		padding: 12,
		borderRadius: 14,
		backgroundColor: "#F9FAFB",
	},
	priceHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},
	priceValue: {
		flex: 1,
		fontSize: 14,
		fontWeight: "900",
		color: "#15803D",
	},
	priceMeta: {
		marginTop: 3,
		fontSize: 11,
		lineHeight: 15,
		color: "#71727A",
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
	},
	statusBadgeActive: {
		backgroundColor: "#DCFCE7",
	},
	statusBadgeInactive: {
		backgroundColor: "#F3F4F6",
	},
	statusText: {
		fontSize: 10,
		fontWeight: "900",
	},
	statusTextActive: {
		color: "#16A34A",
	},
	statusTextInactive: {
		color: "#71727A",
	},
	iconButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
	seeAllButton: {
		marginTop: 14,
		height: 40,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		backgroundColor: "#F0FDF4",
	},
	seeAllText: {
		fontSize: 12,
		fontWeight: "900",
		color: "#16A34A",
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.35)",
		justifyContent: "flex-end",
	},
	modalCard: {
		padding: 20,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		backgroundColor: "#FFFFFF",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
		gap: 12,
	},
	modalTitle: {
		fontSize: 19,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	activeNotice: {
		padding: 12,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: "#F0FDF4",
	},
	activeNoticeText: {
		flex: 1,
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "800",
		color: "#166534",
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
	},
	twoColumnRow: {
		flexDirection: "row",
		gap: 12,
	},
	twoColumnItem: {
		flex: 1,
	},
	saveButton: {
		marginTop: 18,
		minHeight: 54,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#22C55E",
	},
	saveButtonDisabled: {
		opacity: 0.7,
	},
	saveButtonText: {
		fontSize: 15,
		fontWeight: "900",
		color: "#FFFFFF",
	},
	allPricesBackdrop: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.38)",
	},
	allPricesCard: {
		maxHeight: "84%",
		padding: 18,
		borderRadius: 20,
		backgroundColor: "#FFFFFF",
	},
	allPricesList: {
		gap: 10,
		paddingBottom: 8,
	},
});
