export type UserRole = "seller" | "collector" | "admin";

export interface Profile {
	id: string;
	full_name: string | null;
	phone: string | null;
	avatar_url: string | null;
	role: UserRole;
	created_at: string;
	updated_at: string;
}

export interface Address {
	id: string;
	user_id: string;
	label: string | null;
	recipient_name: string | null;
	phone: string | null;
	address_line: string;
	ward: string | null;
	district: string | null;
	city: string | null;
	latitude: number | null;
	longitude: number | null;
	is_default: boolean;
	created_at: string;
}

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

