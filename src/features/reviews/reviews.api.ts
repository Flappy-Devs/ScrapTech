import { supabase } from "@/src/lib/supabase";
import { throwIfSupabaseError } from "@/src/lib/api-error";
import type { Review } from "@/src/types/app.types";

export interface CreateReviewInput {
	order_id: string;
	collector_id?: string | null;
	rating: number;
	comment?: string | null;
}

export async function createReview(
	input: CreateReviewInput
): Promise<Review> {
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	throwIfSupabaseError(authError);

	if (!user) {
		throw new Error("User is not authenticated.");
	}

	const { data, error } = await supabase
		.from("reviews")
		.insert({
			order_id: input.order_id,
			seller_id: user.id,
			collector_id: input.collector_id ?? null,
			rating: input.rating,
			comment: input.comment ?? null,
		})
		.select("*")
		.single();

	throwIfSupabaseError(error);

	return data as any;
}