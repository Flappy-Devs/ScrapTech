import { throwIfSupabaseError } from "@/src/lib/api-error";
import { supabase } from "@/src/lib/supabase";
import { Profile, Updates } from "@/src/types/app.types";

export async function getMyProfile(): Promise<Profile | null> {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	throwIfSupabaseError(userError);

	if (!user) {
		return null;
	}

	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user.id)
		.maybeSingle();

	throwIfSupabaseError(error);

	return data as Profile | null;
}

export async function updateMyProfile(
	input: Updates<"profiles">
): Promise<Profile> {
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	throwIfSupabaseError(authError);

	if (!user) {
		throw new Error("User is not authenticated.");
	}

	const { data, error } = await supabase
		.from("profiles")
		.update(input)
		.eq("id", user.id)
		.select("*")
		.single();

	throwIfSupabaseError(error);

	return data;
}