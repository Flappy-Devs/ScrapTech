import { useQuery } from "@tanstack/react-query";

import {
	getActiveScrapPrices,
	getScrapCategories,
} from "./catalog.api";

export const catalogKeys = {
	categories: ["catalog", "scrap-categories"] as const,
	prices: (areaCode?: string) =>
		["catalog", "scrap-prices", areaCode ?? "global"] as const,
};

export function useScrapCategories() {
	return useQuery({
		queryKey: catalogKeys.categories,
		queryFn: getScrapCategories,
	});
}

/**
 * Chưa dùng trong form vì hiện tại đang dùng mock price.
 * Để sẵn hook này để thay thế sau.
 */
export function useActiveScrapPrices(areaCode?: string) {
	return useQuery({
		queryKey: catalogKeys.prices(areaCode),
		queryFn: () => getActiveScrapPrices(areaCode),
		enabled: false,
	});
}