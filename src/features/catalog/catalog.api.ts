import { supabase } from "@/src/lib/supabase";
import { throwIfSupabaseError } from "@/src/lib/api-error";
import type { ScrapCategory, ScrapPrice } from "@/src/types/app.types";

export async function getScrapCategories(): Promise<ScrapCategory[]> {
	const { data, error } = await supabase
		.from("scrap_categories")
		.select("*")
		.eq("is_active", true)
		.order("name", { ascending: true });

	throwIfSupabaseError(error);

	return data ?? [];
}

export async function getActiveScrapPrices(
	areaCode?: string
): Promise<ScrapPrice[]> {
	let query = supabase
		.from("scrap_prices")
		.select("*")
		.order("created_at", { ascending: false });

	if (areaCode) {
		query = query.eq("area_code", areaCode);
	}

	const { data, error } = await query;

	throwIfSupabaseError(error);

	return data ?? [];
}
