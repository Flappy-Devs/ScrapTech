import { ScrapUnit } from "./unit";

export interface ScrapCategory {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	unit: ScrapUnit;
	is_active: boolean;
	created_at: string;
}