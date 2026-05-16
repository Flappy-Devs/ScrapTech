import { throwIfSupabaseError } from "@/src/lib/api-error";
import { supabase } from "@/src/lib/supabase";
import type { Address, AddressSnapshot } from "@/src/types/app.types";

export async function getMyLatestAddress(): Promise<Address | null> {
	const { data, error } = await supabase
		.from("addresses")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	throwIfSupabaseError(error);

	return data as Address | null;
}

export async function saveMyPickupAddress(
	address: AddressSnapshot
): Promise<Address> {
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	throwIfSupabaseError(authError);

	if (!user) {
		throw new Error("User is not authenticated.");
	}

	const { data, error } = await supabase
		.from("addresses")
		.insert({
			user_id: user.id,
			label: "Địa chỉ thu gom",
			recipient_name: address.recipient_name ?? null,
			phone: address.phone ?? null,
			address_line: address.address_line,
			ward: address.ward ?? null,
			district: address.district ?? null,
			city: address.city ?? null,
			latitude: address.latitude ?? null,
			longitude: address.longitude ?? null,
			is_default: true,
		})
		.select("*")
		.single();

	throwIfSupabaseError(error);

	return data as Address;
}
