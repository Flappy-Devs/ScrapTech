export interface Review {
	id: string;
	order_id: string;
	seller_id: string;
	collector_id: string | null;
	rating: number;
	comment: string | null;
	created_at: string;
}
