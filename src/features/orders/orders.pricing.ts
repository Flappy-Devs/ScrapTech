import type {
	CreatePickupOrderItemInput,
	ScrapCategory,
} from "@/src/types/app.types";

export interface MockScrapPrice {
	priceMin: number;
	priceMax: number;
	currency: "VND";
}

const MOCK_SCRAP_PRICES: Record<string, MockScrapPrice> = {
	iron: {
		priceMin: 7000,
		priceMax: 10000,
		currency: "VND",
	},
	aluminum: {
		priceMin: 25000,
		priceMax: 35000,
		currency: "VND",
	},
	copper: {
		priceMin: 150000,
		priceMax: 210000,
		currency: "VND",
	},
	paper: {
		priceMin: 4000,
		priceMax: 7000,
		currency: "VND",
	},
	plastic: {
		priceMin: 5000,
		priceMax: 9000,
		currency: "VND",
	},
	electronics: {
		priceMin: 20000,
		priceMax: 50000,
		currency: "VND",
	},
};

/**
 * TODO:
 * Sau này thay mock data bằng dữ liệu từ Supabase:
 *
 * const prices = await getActiveScrapPrices(areaCode);
 * Map scrap_category_id => price_min / price_max.
 */
export function getMockPriceByCategorySlug(
	categorySlug: string
): MockScrapPrice | null {
	return MOCK_SCRAP_PRICES[categorySlug] ?? null;
}

export function buildPricedOrderItem(params: {
	category: ScrapCategory;
	quantity: number;
}): CreatePickupOrderItemInput | null {
	const price = getMockPriceByCategorySlug(params.category.slug);

	if (!price || params.quantity <= 0) {
		return null;
	}

	const estimatedSubtotalMin = price.priceMin * params.quantity;

	return {
		scrap_category_id: params.category.id,
		estimated_quantity: params.quantity,
		unit: params.category.unit,
		price_snapshot: {
			category_name: params.category.name,
			price_min: price.priceMin,
			price_max: price.priceMax,
			currency: price.currency,
			unit: params.category.unit,
		},
		estimated_subtotal: estimatedSubtotalMin,
	};
}

export function calculateEstimatedRange(
	items: CreatePickupOrderItemInput[]
): {
	min: number;
	max: number;
	currency: string;
} {
	return items.reduce(
		(total, item) => {
			const quantity = item.estimated_quantity ?? 0;
			const min = item.price_snapshot.price_min * quantity;
			const max =
				(item.price_snapshot.price_max ?? item.price_snapshot.price_min) *
				quantity;

			return {
				min: total.min + min,
				max: total.max + max,
				currency: item.price_snapshot.currency,
			};
		},
		{
			min: 0,
			max: 0,
			currency: "VND",
		}
	);
}

export function calculateEstimatedRangeFromStoredItems(
	items: Array<{
		estimated_quantity: number | null;
		price_snapshot: unknown;
	}>
): {
	min: number;
	max: number;
	currency: string;
} | null {
	let min = 0;
	let max = 0;
	let currency = "VND";
	let foundValidItem = false;

	for (const item of items) {
		if (
			!item.price_snapshot ||
			typeof item.price_snapshot !== "object" ||
			typeof item.estimated_quantity !== "number"
		) {
			continue;
		}

		const snapshot = item.price_snapshot as {
			price_min?: number;
			price_max?: number | null;
			currency?: string;
		};

		if (typeof snapshot.price_min !== "number") {
			continue;
		}

		const itemMin = snapshot.price_min * item.estimated_quantity;
		const itemMax =
			(snapshot.price_max ?? snapshot.price_min) * item.estimated_quantity;

		min += itemMin;
		max += itemMax;
		currency = snapshot.currency ?? "VND";
		foundValidItem = true;
	}

	if (!foundValidItem) {
		return null;
	}

	return { min, max, currency };
}

export function formatVndAmount(value: number): string {
	return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}