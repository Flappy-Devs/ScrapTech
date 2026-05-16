import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	useActiveScrapPrices,
	useScrapCategories,
} from "@/src/features/catalog/catalog.hooks";
import { formatVndAmount } from "@/src/features/orders/orders.pricing";
import type { ScrapCategory, ScrapPrice } from "@/src/types/app.types";

interface CategoryPriceRow {
	category: ScrapCategory;
	prices: ScrapPrice[];
	latestPrice: ScrapPrice | null;
	previousPrice: ScrapPrice | null;
}

export default function MarketPriceScreen() {
	const { data: categories = [], isLoading: isCategoryLoading } =
		useScrapCategories();
	const { data: prices = [], isLoading: isPriceLoading } = useActiveScrapPrices();
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

	const rows = useMemo(
		() => buildCategoryPriceRows(categories, prices),
		[categories, prices]
	);

	const selectedRow =
		rows.find((row) => row.category.id === selectedCategoryId) ?? rows[0];
	const isLoading = isCategoryLoading || isPriceLoading;

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={20} color="#1E1E1E" />
				</Pressable>
				<Text style={styles.headerTitle}>Bảng giá thị trường</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View style={styles.stateBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : rows.length === 0 ? (
					<View style={styles.stateBox}>
						<Ionicons name="trending-up-outline" size={40} color="#8F9098" />
						<Text style={styles.stateTitle}>Chưa có bảng giá</Text>
					</View>
				) : (
					<>
						<View style={styles.priceGrid}>
							{rows.map((row) => (
								<PriceCard key={row.category.id} row={row} />
							))}
						</View>

						<Text style={styles.sectionTitle}>Biểu đồ giá</Text>

						<View style={styles.categoryTabs}>
							{rows.map((row) => {
								const active =
									row.category.id ===
									(selectedRow?.category.id ?? rows[0]?.category.id);

								return (
									<Pressable
										key={row.category.id}
										style={[
											styles.categoryTab,
											active && styles.categoryTabActive,
										]}
										onPress={() =>
											setSelectedCategoryId(row.category.id)
										}
									>
										<Text
											style={[
												styles.categoryTabText,
												active && styles.categoryTabTextActive,
											]}
										>
											{row.category.name}
										</Text>
									</Pressable>
								);
							})}
						</View>

						<View style={styles.chartCard}>
							{selectedRow ? (
								<PriceChart prices={selectedRow.prices} />
							) : null}
						</View>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

function PriceCard({ row }: { row: CategoryPriceRow }) {
	const trend = getTrend(row.latestPrice, row.previousPrice);

	return (
		<View style={styles.priceCard}>
			<View style={[styles.iconWrap, { backgroundColor: getTint(row.category) }]}>
				<Ionicons
					name={getCategoryIcon(row.category)}
					size={18}
					color={getAccent(row.category)}
				/>
			</View>

			<Text style={styles.categoryName}>{row.category.name}</Text>
			<Text style={styles.priceValue}>
				{row.latestPrice
					? `${formatVndAmount(row.latestPrice.price_min)} VND/${row.category.unit}`
					: "Chưa có giá"}
			</Text>
			<Text
				style={[
					styles.trendText,
					{ color: trend.value >= 0 ? "#16A34A" : "#DC2626" },
				]}
			>
				{trend.label}
			</Text>
		</View>
	);
}

function PriceChart({ prices }: { prices: ScrapPrice[] }) {

	const points = prices
		.slice(0, 8)
		.reverse()
		.map((price) => price.price_min);

	if (points.length === 0) {
		return (
			<View style={styles.chartEmpty}>
				<Text style={styles.stateTitle}>Chưa có dữ liệu giá</Text>
			</View>
		);
	}

	const width = 280;
	const height = 130;
	const min = Math.min(...points);
	const max = Math.max(...points);
	const range = Math.max(max - min, 1);
	const pointString = points
		.map((value, index) => {
			const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
			const y = height - ((value - min) / range) * (height - 18) - 9;

			return `${x},${y}`;
		})
		.join(" ");

	return (
		<View style={styles.chartWrap}>
			<View style={styles.chartGrid}>
				{[0, 1, 2, 3].map((line) => (
					<View
						key={line}
						style={[styles.gridLine, { top: 16 + line * 30 }]}
					/>
				))}
			</View>
			<Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
				<Polyline
					points={pointString}
					fill="none"
					stroke="#86A5FF"
					strokeWidth="3"
					strokeLinejoin="round"
					strokeLinecap="round"
				/>
				{pointString.split(" ").map((point) => {
					const [x, y] = point.split(",").map(Number);

					return (
						<Circle
							key={point}
							cx={x}
							cy={y}
							r="3.5"
							fill="#FFFFFF"
							stroke="#86A5FF"
							strokeWidth="2"
						/>
					);
				})}
			</Svg>
		</View>
	);
}

function buildCategoryPriceRows(
	categories: ScrapCategory[],
	prices: ScrapPrice[]
): CategoryPriceRow[] {
	const grouped = new Map<string, ScrapPrice[]>();

	for (const price of prices) {
		const current = grouped.get(price.scrap_category_id) ?? [];

		current.push(price);
		grouped.set(price.scrap_category_id, current);
	}

	return categories.map((category) => {
		const categoryPrices = (grouped.get(category.id) ?? []).sort(
			(a, b) =>
				new Date(b.effective_from).getTime() -
				new Date(a.effective_from).getTime()
		);

		return {
			category,
			prices: categoryPrices,
			latestPrice: categoryPrices[0] ?? null,
			previousPrice: categoryPrices[1] ?? null,
		};
	});
}

function getTrend(
	latestPrice: ScrapPrice | null,
	previousPrice: ScrapPrice | null
) {
	if (!latestPrice || !previousPrice || previousPrice.price_min === 0) {
		return { value: 0, label: "+ 0%" };
	}

	const value =
		((latestPrice.price_min - previousPrice.price_min) /
			previousPrice.price_min) *
		100;
	const prefix = value >= 0 ? "+" : "";

	return {
		value,
		label: `${prefix}${Math.round(value)}%`,
	};
}

function getCategoryIcon(category: ScrapCategory): keyof typeof Ionicons.glyphMap {
	if (category.unit === "item") {
		return "hardware-chip-outline";
	}

	if (category.slug.includes("paper")) {
		return "document-text-outline";
	}

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
	stateBox: {
		minHeight: 220,
		alignItems: "center",
		justifyContent: "center",
	},
	stateTitle: {
		marginTop: 10,
		fontSize: 14,
		fontWeight: "800",
		color: "#71727A",
	},
	priceGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	priceCard: {
		width: "47.8%",
		minHeight: 128,
		padding: 14,
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 7 },
		shadowRadius: 14,
		elevation: 4,
	},
	iconWrap: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
	},
	categoryName: {
		marginTop: 9,
		fontSize: 13,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	priceValue: {
		marginTop: 5,
		fontSize: 12,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	trendText: {
		marginTop: 8,
		fontSize: 11,
		fontWeight: "900",
	},
	sectionTitle: {
		marginTop: 22,
		fontSize: 15,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	categoryTabs: {
		marginTop: 12,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	categoryTab: {
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#22C55E",
		backgroundColor: "#FFFFFF",
	},
	categoryTabActive: {
		backgroundColor: "#22C55E",
	},
	categoryTabText: {
		fontSize: 11,
		fontWeight: "800",
		color: "#16A34A",
	},
	categoryTabTextActive: {
		color: "#FFFFFF",
	},
	chartCard: {
		marginTop: 14,
		height: 168,
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		padding: 14,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 7 },
		shadowRadius: 14,
		elevation: 3,
	},
	chartWrap: {
		flex: 1,
		justifyContent: "center",
	},
	chartGrid: {
		...StyleSheet.absoluteFillObject,
	},
	gridLine: {
		position: "absolute",
		left: 0,
		right: 0,
		height: 1,
		backgroundColor: "#EDF0F2",
	},
	chartEmpty: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
