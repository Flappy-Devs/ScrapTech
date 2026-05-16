import { supabase } from "@/src/lib/supabase";

export type PhoneAuthFlow = "login" | "signup";

export async function loginWithEmail(email: string, password: string): Promise<void> {
	const { error } = await supabase.auth.signInWithPassword({
		email,
		password
	})

	if (error) throw error;
}

export function normalizePhoneNumber(rawPhone: string): string {
	const cleaned = rawPhone.replace(/[^\d+]/g, "");

	if (cleaned.startsWith("+")) {
		return cleaned;
	}

	if (cleaned.startsWith("0")) {
		return `+84${cleaned.slice(1)}`;
	}

	if (cleaned.startsWith("84")) {
		return `+${cleaned}`;
	}

	return `+84${cleaned}`;
}

export function isValidPhoneNumber(phone: string): boolean {
	return /^\+\d{8,15}$/.test(phone);
}

export async function requestLoginOtp(phone: string): Promise<void> {
	const { error } = await supabase.auth.signInWithOtp({
		phone,
		options: {
			shouldCreateUser: false,
		},
	});

	if (error) throw error;
}

export async function requestSignupOtp(phone: string): Promise<void> {
	const { error } = await supabase.auth.signInWithOtp({
		phone,
		options: {
			shouldCreateUser: true,
		},
	});

	if (error) throw error;
}

export async function verifyPhoneOtp(phone: string, token: string) {
	const { data, error } = await supabase.auth.verifyOtp({
		phone,
		token,
		type: "sms",
	});

	if (error) throw error;

	return data;
}

export async function signOutCurrentUser(): Promise<void> {
	const { error } = await supabase.auth.signOut();

	if (error) throw error;
}

export async function getCurrentSession() {
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) throw error;

	return session;
}

export async function upsertMyProfile(input: {
	fullName: string;
	phone: string;
}) {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError) throw userError;

	if (!user) {
		throw new Error("Authenticated user was not found.");
	}

	const { error } = await supabase.from("profiles").upsert(
		{
			id: user.id,
			full_name: input.fullName,
			phone: input.phone,
		},
		{
			onConflict: "id",
		}
	);

	if (error) throw error;
}