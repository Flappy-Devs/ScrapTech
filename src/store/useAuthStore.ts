import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
	session: Session | null;
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;

	setSession: (session: Session | null) => void;
	clearSession: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	session: null,
	user: null,
	isLoading: true,
	isAuthenticated: false,

	setSession: (session) =>
		set({
			session,
			user: session?.user ?? null,
			isLoading: false,
			isAuthenticated: Boolean(session),
		}),

	clearSession: () =>
		set({
			session: null,
			user: null,
			isLoading: false,
			isAuthenticated: false,
		}),

	setLoading: (isLoading) =>
		set({
			isLoading,
		}),
}));