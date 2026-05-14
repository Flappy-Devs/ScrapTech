import { useCallback, useEffect } from "react";
import { AppState } from "react-native";

import {
	getCurrentSession,
	requestLoginOtp,
	requestSignupOtp,
	signOutCurrentUser,
	verifyPhoneOtp,
} from "@/src/features/auth/auth.api";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/useAuthStore";

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

	const signOut = useCallback(async () => {
		await signOutCurrentUser();
		useAuthStore.getState().clearSession();
	}, []);

	return {
		...authState,
		sendLoginOtp,
		sendSignupOtp,
		confirmPhoneOtp,
		signOut,
	};
}