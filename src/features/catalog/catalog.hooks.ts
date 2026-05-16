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

export function useActiveScrapPrices(areaCode?: string) {
	return useQuery({
		queryKey: catalogKeys.prices(areaCode),
		queryFn: () => getActiveScrapPrices(areaCode),
	});
}
