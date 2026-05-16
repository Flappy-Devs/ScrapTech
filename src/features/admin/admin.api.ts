import { supabase } from "@/src/lib/supabase";
import { throwIfSupabaseError } from "@/src/lib/api-error";
import type {
	PickupOrder,
	PickupOrderDetails,
	ScrapCategory,
	ScrapPrice,
} from "@/src/types/app.types";

export type AdminOrderBucket = "active" | "history" | "all";

export interface AdminPickupOrderItemUpdate {
	id: string;
	final_quantity: number | null;
	final_subtotal: number | null;
}

export interface UpdateAdminPickupOrderInput {
	orderId: string;
	scheduledDate: string;
	scheduledTimeFrom: string | null;
	scheduledTimeTo: string | null;
	status: PickupOrder["status"];
	adminNote: string | null;
	rejectionReason: string | null;
	items: AdminPickupOrderItemUpdate[];
}

export interface AdminScrapPriceCategoryRow {
	category: ScrapCategory;
	prices: ScrapPrice[];
}

export interface CreateAdminScrapPriceInput {
	scrapCategoryId: string;
	areaCode: string | null;
	priceMin: number;
	priceMax: number | null;
	currency: string;
}

export interface UpdateAdminScrapPriceInput
	extends CreateAdminScrapPriceInput {
	id: string;
}

const ACTIVE_STATUSES: PickupOrder["status"][] = [
	"pending",
	"confirmed",
	"on_the_way",
];

const HISTORY_STATUSES: PickupOrder["status"][] = [
	"completed",
	"rejected",
	"cancelled",
];

export async function getAdminPickupOrders(
	bucket: AdminOrderBucket
): Promise<PickupOrder[]> {
	let query = supabase
		.from("pickup_orders")
		.select("*")
		.order("created_at", { ascending: false });

	if (bucket === "active") {
		query = query.in("status", ACTIVE_STATUSES);
	}

	if (bucket === "history") {
		query = query.in("status", HISTORY_STATUSES);
	}

	const { data, error } = await query;

	throwIfSupabaseError(error);

	return (data ?? []) as PickupOrder[];
}

export async function getAdminPickupOrderById(
	orderId: string
): Promise<PickupOrderDetails | null> {
	const { data, error } = await supabase
		.from("pickup_orders")
		.select(`
			*,
			items:pickup_order_items (
				*,
				scrap_categories (*)
			),
			images:pickup_order_images (*),
			review:reviews (*)
		`)
		.eq("id", orderId)
		.maybeSingle();

	throwIfSupabaseError(error);

	return data as PickupOrderDetails | null;
}

export async function updateAdminPickupOrder(
	input: UpdateAdminPickupOrderInput
): Promise<string> {
	const { data, error } = await supabase.rpc(
		"admin_update_pickup_order",
		{
			p_order_id: input.orderId,
			p_scheduled_date: input.scheduledDate,
			p_scheduled_time_from: input.scheduledTimeFrom,
			p_scheduled_time_to: input.scheduledTimeTo,
			p_status: input.status,
			p_admin_note: input.adminNote,
			p_rejection_reason: input.rejectionReason,
			p_items: input.items as any,
		}
	);

	throwIfSupabaseError(error);

	if (!data) {
		throw new Error("Failed to update pickup order.");
	}

	return data as string;
}

export async function getAdminScrapPriceCatalog(): Promise<
	AdminScrapPriceCategoryRow[]
> {
	const [
		{ data: categories, error: categoryError },
		{ data: prices, error: priceError },
	] = await Promise.all([
		supabase
			.from("scrap_categories")
			.select("*")
			.order("name", { ascending: true }),
		supabase
			.from("scrap_prices")
			.select("*")
			.order("created_at", { ascending: false }),
	]);

	throwIfSupabaseError(categoryError);
	throwIfSupabaseError(priceError);

	const groupedPrices = new Map<string, ScrapPrice[]>();

	for (const price of (prices ?? []) as ScrapPrice[]) {
		const current =
			groupedPrices.get(price.scrap_category_id) ?? [];

		current.push(price);
		groupedPrices.set(price.scrap_category_id, current);
	}

	return ((categories ?? []) as ScrapCategory[]).map((category) => ({
		category,
		prices: groupedPrices.get(category.id) ?? [],
	}));
}

export async function createAdminScrapPrice(
	input: CreateAdminScrapPriceInput
): Promise<ScrapPrice> {
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	throwIfSupabaseError(authError);

	if (!user) {
		throw new Error("User is not authenticated.");
	}

	const { error: deactivateError } = await supabase
		.from("scrap_prices")
		.update({ is_active: false })
		.eq("scrap_category_id", input.scrapCategoryId)
		.eq("is_active", true);

	throwIfSupabaseError(deactivateError);

	const { data, error } = await supabase
		.from("scrap_prices")
		.insert({
			scrap_category_id: input.scrapCategoryId,
			area_code: input.areaCode,
			price_min: input.priceMin,
			price_max: input.priceMax,
			currency: input.currency,
			is_active: true,
			created_by: user.id,
		})
		.select("*")
		.single();

	throwIfSupabaseError(error);

	return data as ScrapPrice;
}

export async function updateAdminScrapPrice(
	input: UpdateAdminScrapPriceInput
): Promise<ScrapPrice> {
	const { data, error } = await supabase
		.from("scrap_prices")
		.update({
			scrap_category_id: input.scrapCategoryId,
			area_code: input.areaCode,
			price_min: input.priceMin,
			price_max: input.priceMax,
			currency: input.currency,
		})
		.eq("id", input.id)
		.select("*")
		.single();

	throwIfSupabaseError(error);

	return data as ScrapPrice;
}

export async function deleteAdminScrapPrice(
	priceId: string
): Promise<void> {
	const { error } = await supabase
		.from("scrap_prices")
		.delete()
		.eq("id", priceId);

	throwIfSupabaseError(error);
}
