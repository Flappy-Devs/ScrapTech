import { supabase } from "@/src/api";
import { throwIfSupabaseError } from "@/src/lib/api-error";

export async function sendPhoneOtp(phone: string): Promise<void> {
	const { error } = await supabase.auth.signInWithOtp({
		phone,
	});

	throwIfSupabaseError(error);
}

export async function verifyPhoneOtp(
	phone: string,
	token: string
): Promise<void> {
	const { error } = await supabase.auth.verifyOtp({
		phone,
		token,
		type: "sms",
	});

	throwIfSupabaseError(error);
}

export async function signOut(): Promise<void> {
	const { error } = await supabase.auth.signOut();
	throwIfSupabaseError(error);
}

export async function getCurrentUser() {
	const { data, error } = await supabase.auth.getUser();
	throwIfSupabaseError(error);

	return data.user;
}

export async function getCurrentSession() {
	const { data, error } = await supabase.auth.getSession();
	throwIfSupabaseError(error);

	return data.session;
}