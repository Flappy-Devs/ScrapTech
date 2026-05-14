import { throwIfSupabaseError } from "@/src/lib/api-error";
import { supabase } from "@/src/lib/supabase";
import type { Address } from "@/src/types/app.types";

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