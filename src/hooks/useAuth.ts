import { useCallback, useEffect } from "react";
import { AppState } from "react-native";

import {
	getCurrentSession,
	loginWithEmail,
	requestLoginOtp,
	requestSignupOtp,
	signOutCurrentUser,
	verifyPhoneOtp,
} from "@/src/features/auth/auth.api";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthBootstrap() {
	const { setSession, clearSession, setLoading } = useAuthStore();

	useEffect(() => {
		let isMounted = true;

		async function restoreSession() {
			try {
				setLoading(true);

				const session = await getCurrentSession();

				if (!isMounted) return;

				setSession(session);
			} catch {
				if (!isMounted) return;

				clearSession();
			}
		}

		void restoreSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!isMounted) return;

			setSession(session);
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, [clearSession, setLoading, setSession]);

	useEffect(() => {
		if (AppState.currentState === "active") {
			supabase.auth.startAutoRefresh();
		}

		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				supabase.auth.startAutoRefresh();
			} else {
				supabase.auth.stopAutoRefresh();
			}
		});

		return () => {
			subscription.remove();
			supabase.auth.stopAutoRefresh();
		};
	}, []);
}

export function useAuth() {
	const authState = useAuthStore();
	const queryClient = useQueryClient();

	const sendLoginOtp = useCallback(async (phone: string) => {
		await requestLoginOtp(phone);
	}, []);

	const sendSignupOtp = useCallback(async (phone: string) => {
		await requestSignupOtp(phone);
	}, []);

	const confirmPhoneOtp = useCallback(
		async (phone: string, token: string) => {
			return verifyPhoneOtp(phone, token);
		},
		[]
	);

	const loginAdmin = useCallback(async (email: string, password: string) => {
		await loginWithEmail(email, password);
	}, [])

	const signOut = useCallback(async () => {
		await signOutCurrentUser();
		queryClient.clear();
		useAuthStore.getState().clearSession();
	}, []);

	return {
		...authState,
		sendLoginOtp,
		sendSignupOtp,
		confirmPhoneOtp,
		signOut,
		loginAdmin,
	};
}