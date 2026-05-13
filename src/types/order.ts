import { PriceSnapshot } from "./price";
import { ScrapUnit } from "./unit";

export type OrderStatus =
	| "pending"
	| "confirmed"
	| "rejected"
	| "on_the_way"
	| "completed"
	| "cancelled";

export interface PickupOrderItem {
	id: string;
	order_id: string;
	scrap_category_id: string;

	estimated_quantity: number | null;
	final_quantity: number | null;

	unit: ScrapUnit;
	price_snapshot: PriceSnapshot | null;

	estimated_subtotal: number | null;
	final_subtotal: number | null;

	created_at: string;
}

export interface PickupOrderImage {
	id: string;
	order_id: string;
	storage_path: string;
	public_url: string | null;
	created_at: string;
}

export interface OrderStatusHistory {
	id: string;
	order_id: string;
	old_status: OrderStatus | null;
	new_status: OrderStatus;
	changed_by: string | null;
	note: string | null;
	created_at: string;
}