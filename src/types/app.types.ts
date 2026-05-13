import type { Database } from "./database.types";

export type Tables<
	T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Row"];

export type Inserts<
	T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Insert"];

export type Updates<
	T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Address = Tables<"addresses">;
export type ScrapCategory = Tables<"scrap_categories">;
export type ScrapPrice = Tables<"scrap_prices">;
export type PickupOrder = Tables<"pickup_orders">;
export type PickupOrderItem = Tables<"pickup_order_items">;
export type PickupOrderImage = Tables<"pickup_order_images">;
export type Notification = Tables<"notifications">;
export type Review = Tables<"reviews">;

export interface AddressSnapshot {
	recipient_name?: string | null;
	phone?: string | null;
	address_line: string;
	ward?: string | null;
	district?: string | null;
	city?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}

export interface CreatePickupOrderItemInput {
	scrap_category_id: string;
	estimated_quantity?: number | null;
	unit: "kg" | "item";
}

export interface CreatePickupOrderInput {
	scheduled_date: string;
	scheduled_time_from: string;
	scheduled_time_to: string;
	address_id?: string | null;
	address_snapshot: AddressSnapshot;
	note?: string | null;
	items: CreatePickupOrderItemInput[];
	image_paths?: string[];
}

export interface PickupOrderDetails extends PickupOrder {
	items: Array<
		PickupOrderItem & {
			scrap_categories: ScrapCategory | null;
		}
	>;
	images: PickupOrderImage[];
	review: Review | null;
}