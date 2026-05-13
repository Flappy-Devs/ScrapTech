import { ScrapUnit } from "./unit";

export interface ScrapPrice {
	id: string;
	scrap_category_id: string;
	area_code: string | null;
	price_min: number;
	price_max: number | null;
	currency: string;
	effective_from: string;
	effective_to: string | null;
	is_active: boolean;
	created_by: string | null;
	created_at: string;
}

export interface PriceSnapshot {
	category_name: string;
	price_min: number;
	price_max?: number | null;
	currency: string;
	unit: ScrapUnit;
}