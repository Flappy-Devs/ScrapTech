export interface Transaction {
	id: string;
	order_id: string;
	seller_id: string;
	amount: number;
	currency: string;
	payment_method: string;
	paid_at: string | null;
	created_at: string;
}