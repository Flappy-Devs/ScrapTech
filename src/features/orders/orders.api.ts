import { supabase } from "@/src/lib/supabase";
import { throwIfSupabaseError } from "@/src/lib/api-error";
import type {
	CreatePickupOrderInput,
	PickupOrder,
	PickupOrderDetails,
} from "@/src/types/app.types";

export async function createPickupOrder(
	input: CreatePickupOrderInput
): Promise<string> {
	const { data, error } = await supabase.rpc("create_pickup_order", {
		p_scheduled_date: input.scheduled_date,
		p_scheduled_time_from: input.scheduled_time_from,
		p_scheduled_time_to: input.scheduled_time_to,
		p_address_id: input.address_id as string,
		p_address_snapshot: input.address_snapshot as any,
		p_note: input.note as string,
		p_items: input.items as any,
		p_image_paths: input.image_paths ?? [],
	});

	throwIfSupabaseError(error);

	if (!data) {
		throw new Error("Failed to create pickup order.");
	}

	return data;
}

export async function getMyPickupOrders(): Promise<PickupOrder[]> {
	const { data, error } = await supabase
		.from("pickup_orders")
		.select("*")
		.order("created_at", { ascending: false });

	throwIfSupabaseError(error);

	return data ?? [];
}

export async function getPickupOrderById(
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

export async function cancelPickupOrder(
	orderId: string
): Promise<PickupOrder> {
	const { data, error } = await supabase
		.from("pickup_orders")
		.update({
			status: "cancelled",
			cancelled_at: new Date().toISOString(),
		})
		.eq("id", orderId)
		.eq("status", "pending")
		.select("*")
		.single();

	throwIfSupabaseError(error);

	return data as any;
}