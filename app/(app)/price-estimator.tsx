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

import {
	useActiveScrapPrices,
	useScrapCategories,
} from "@/src/features/catalog/catalog.hooks";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import type { ScrapCategory, ScrapPrice } from "@/src/types/app.types";

type QuantityMap = Record<string, number>;

interface CalculatorRow {
	category: ScrapCategory;
	price: ScrapPrice | null;
}

export default function PriceEstimatorScreen() {
	const { data: categories = [], isLoading: isCategoryLoading } =
		useScrapCategories();
	const { data: prices = [], isLoading: isPriceLoading } =
		useActiveScrapPrices();
	const [quantities, setQuantities] = useState<QuantityMap>({});

	const rows = useMemo(
		() => buildCalculatorRows(categories, prices),
		[categories, prices]
	);
	const total = useMemo(
		() => calculateTotal(rows, quantities),
		[rows, quantities]
	);
	const isLoading = isCategoryLoading || isPriceLoading;

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={20} color="#1E1E1E" />
				</Pressable>
				<Text style={styles.headerTitle}>Ước lượng giá</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.noticeCard}>
					<View style={styles.noticeIcon}>
						<Ionicons name="information-circle-outline" size={18} color="#2563EB" />
					</View>
					<Text style={styles.noticeText}>
						Giá tính toán sẽ dựa trên dữ liệu được cập nhật tự động từ
						bảng giá Supabase của admin.
					</Text>
				</View>

				<Text style={styles.sectionTitle}>Nhập khối lượng</Text>

				{isLoading ? (
					<View style={styles.stateBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : (
					<View style={styles.inputCard}>
						{rows.map((row, index) => (
							<View key={row.category.id}>
								<CalculatorItem
									row={row}
									quantity={quantities[row.category.id] ?? 0}
									onDecrease={() =>
										updateQuantity(
											row.category.id,
											(quantities[row.category.id] ?? 0) - 1
										)
									}
									onIncrease={() =>
										updateQuantity(
											row.category.id,
											(quantities[row.category.id] ?? 0) + 1
										)
									}
								/>
								{index < rows.length - 1 ? <View style={styles.divider} /> : null}
							</View>
						))}
					</View>
				)}

				<View style={styles.totalCard}>
					<Text style={styles.sectionTitle}>Tổng kết tính toán</Text>
					<View style={styles.totalRow}>
						<Text style={styles.totalLabel}>Ước tính giá trị</Text>
						<Text style={styles.totalValue}>
							{formatVndAmount(total.min)} - {formatVndAmount(total.max)} VND
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);

	function updateQuantity(categoryId: string, value: number) {
		setQuantities((current) => ({
			...current,
			[categoryId]: Math.max(0, value),
		}));
	}
}

function CalculatorItem({
	row,
	quantity,
	onDecrease,
	onIncrease,
}: {
	row: CalculatorRow;
	quantity: number;
	onDecrease: () => void;
	onIncrease: () => void;
}) {
	return (
		<View style={styles.itemRow}>
			<View style={[styles.itemIcon, { backgroundColor: getTint(row.category) }]}>
				<Ionicons
					name={getCategoryIcon(row.category)}
					size={18}
					color={getAccent(row.category)}
				/>
			</View>

			<View style={styles.itemInfo}>
				<Text style={styles.itemTitle}>{row.category.name}</Text>
				<Text style={styles.itemPrice}>
					{row.price
						? `${formatVndAmount(row.price.price_min)} VND/${row.category.unit}`
						: "Chưa có giá"}
				</Text>
			</View>

			<View style={styles.stepper}>
				<Pressable style={styles.stepButton} onPress={onDecrease}>
					<Ionicons name="remove" size={16} color="#16A34A" />
				</Pressable>
				<Text style={styles.quantityText}>{quantity}</Text>
				<Pressable style={styles.stepButton} onPress={onIncrease}>
					<Ionicons name="add" size={16} color="#16A34A" />
				</Pressable>
			</View>
		</View>
	);
}

function buildCalculatorRows(
	categories: ScrapCategory[],
	prices: ScrapPrice[]
): CalculatorRow[] {
	return categories.map((category) => ({
		category,
		price:
			prices
				.filter((price) => price.scrap_category_id === category.id)
				.sort(
					(a, b) =>
						new Date(b.effective_from).getTime() -
						new Date(a.effective_from).getTime()
				)[0] ?? null,
	}));
}

function calculateTotal(rows: CalculatorRow[], quantities: QuantityMap) {
	return rows.reduce(
		(total, row) => {
			const quantity = quantities[row.category.id] ?? 0;

			if (!row.price || quantity <= 0) {
				return total;
			}

			const min = row.price.price_min * quantity;
			const max = (row.price.price_max ?? row.price.price_min) * quantity;

			return {
				min: total.min + min,
				max: total.max + max,
			};
		},
		{ min: 0, max: 0 }
	);
}

function getCategoryIcon(category: ScrapCategory): keyof typeof Ionicons.glyphMap {
	if (category.unit === "item") return "hardware-chip-outline";
	if (category.slug.includes("paper")) return "document-text-outline";
	if (category.slug.includes("metal") || category.slug.includes("iron")) {
		return "settings-outline";
	}

	return "cube-outline";
}

function getAccent(category: ScrapCategory) {
	if (category.unit === "item") return "#A855F7";
	if (category.slug.includes("paper")) return "#F97316";
	if (category.slug.includes("metal") || category.slug.includes("iron")) {
		return "#6B7280";
	}

	return "#3B82F6";
}

function getTint(category: ScrapCategory) {
	if (category.unit === "item") return "#F3E8FF";
	if (category.slug.includes("paper")) return "#FFEDD5";
	if (category.slug.includes("metal") || category.slug.includes("iron")) {
		return "#F3F4F6";
	}

	return "#EFF6FF";
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
	header: {
		height: 86,
		paddingHorizontal: 18,
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
		width: 38,
		height: 38,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	headerSpacer: {
		width: 38,
	},
	content: {
		padding: 20,
		paddingBottom: 116,
	},
	noticeCard: {
		padding: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#93C5FD",
		borderStyle: "dashed",
		backgroundColor: "#EFF6FF",
		flexDirection: "row",
		gap: 10,
	},
	noticeIcon: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#DBEAFE",
	},
	noticeText: {
		flex: 1,
		fontSize: 12,
		lineHeight: 17,
		fontWeight: "700",
		color: "#2563EB",
	},
	sectionTitle: {
		marginTop: 18,
		marginBottom: 10,
		fontSize: 15,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	stateBox: {
		paddingVertical: 40,
		alignItems: "center",
	},
	inputCard: {
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 4,
	},
	itemRow: {
		minHeight: 74,
		paddingHorizontal: 14,
		flexDirection: "row",
		alignItems: "center",
	},
	itemIcon: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	itemInfo: {
		flex: 1,
	},
	itemTitle: {
		fontSize: 14,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	itemPrice: {
		marginTop: 3,
		fontSize: 10,
		fontWeight: "700",
		color: "#71727A",
	},
	stepper: {
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
	},
	stepButton: {
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#DCFCE7",
	},
	quantityText: {
		minWidth: 18,
		textAlign: "center",
		fontSize: 14,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	divider: {
		height: 1,
		marginLeft: 64,
		backgroundColor: "#F0F0F0",
	},
	totalCard: {
		marginTop: 18,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#BBF7D0",
		backgroundColor: "#F0FDF4",
	},
	totalRow: {
		marginTop: 2,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	totalLabel: {
		fontSize: 12,
		fontWeight: "800",
		color: "#166534",
	},
	totalValue: {
		flex: 1,
		textAlign: "right",
		fontSize: 14,
		fontWeight: "900",
		color: "#00A63E",
	},
});
