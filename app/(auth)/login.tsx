import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

import {
	isValidPhoneNumber,
	normalizePhoneNumber,
} from "@/src/features/auth/auth.api";
import { useAuth } from "@/src/hooks/useAuth";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
	const colors = useThemeColors();
	const { sendLoginOtp, loginEmailPass } = useAuth();

	const [phone, setPhone] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const normalizedPhone = useMemo(
		() => normalizePhoneNumber(phone),
		[phone]
	);

	const canSubmit =
		phone.trim().length > 0 &&
		isValidPhoneNumber(normalizedPhone) &&
		!isSubmitting;

	async function handleRequestOtp() {
		if (!canSubmit) return;

		try {
			setIsSubmitting(true);

			await sendLoginOtp(normalizedPhone);

			router.push({
				pathname: "/(auth)/verify-otp",
				params: {
					phone: normalizedPhone,
					flow: "login",
				},
			});
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Không thể gửi mã OTP. Vui lòng thử lại.";

			Alert.alert("Gửi OTP thất bại", message);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleSellerDevLogin() {
		const email = "flappydev@gmail.com";
		const password = "sellerdev2357";
		try {
			await loginEmailPass(email, password);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Không thể xác thực OTP. Vui lòng thử lại.";

			Alert.alert("Xác thực thất bại", message);
		} finally {
		}
	}
	
	async function handleAdminDevLogin() {
		const email = "vy.tranngoclam@gmail.com";
		const password = "lamvytran2357";
		try {
			await loginEmailPass(email, password);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Không thể xác thực OTP. Vui lòng thử lại.";

			Alert.alert("Xác thực thất bại", message);
		} finally {
		}
	}

	return (
		<SafeAreaView
			style={[
				styles.safeArea,
				{ backgroundColor: colors.neutral.light.lightest },
			]}
		>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<View style={styles.content}>
					<View style={styles.header}>
						<Text
							style={[
								styles.title,
								{ color: colors.neutral.dark.darkest },
							]}
						>
							Chào mừng đến với
						</Text>

						<Text
							style={[
								styles.brand,
								{ color: colors.highlight.medium },
							]}
						>
							ScrapTech
						</Text>

						<Text
							style={[
								styles.subtitle,
								{ color: colors.neutral.dark.light },
							]}
						>
							Đăng nhập để bắt đầu cuộc hành trình của bạn
						</Text>
					</View>

					<View style={styles.form}>
						<Text
							style={[
								styles.label,
								{ color: colors.neutral.dark.darkest },
							]}
						>
							Số điện thoại
						</Text>

						<TextInput
							style={[
								styles.input,
								{
									color: colors.neutral.dark.darkest,
									borderColor: colors.neutral.light.medium,
									backgroundColor: colors.neutral.light.lightest,
								},
							]}
							value={phone}
							onChangeText={setPhone}
							placeholder="Hãy điền số điện thoại của bạn"
							placeholderTextColor={colors.neutral.dark.light}
							keyboardType="phone-pad"
							autoCorrect={false}
							returnKeyType="done"
							onSubmitEditing={handleRequestOtp}
						/>

						<Pressable
							style={[
								styles.button,
								{ backgroundColor: colors.highlight.medium },
								!canSubmit && styles.buttonDisabled,
							]}
							onPress={handleRequestOtp}
							disabled={!canSubmit}
						>
							{isSubmitting ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Nhận OTP</Text>
							)}
						</Pressable>

						<Pressable
							style={[
								styles.button,
								{ backgroundColor: colors.highlight.medium, marginTop: 16 },
							]}
							onPress={handleSellerDevLogin}
						>
							{isSubmitting ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>{"Đăng nhập Nhanh Seller (Cho dev)"}</Text>
							)}
						</Pressable>
						<Pressable
							style={[
								styles.button,
								{ backgroundColor: colors.highlight.medium, marginTop: 16 },
							]}
							onPress={handleAdminDevLogin}
						>
							{isSubmitting ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>{"Đăng nhập Nhanh Admin (Cho dev)"}</Text>
							)}
						</Pressable>
					</View>

					<View style={styles.footerRow}>
						<Text
							style={[
								styles.footerText,
								{ color: colors.neutral.dark.darkest },
							]}
						>
							Chưa có tài khoản?
						</Text>

						<Link href="/(auth)/register" asChild>
							<Pressable>
								<Text
									style={[
										styles.footerLink,
										{ color: colors.highlight.medium },
									]}
								>
									Đăng ký
								</Text>
							</Pressable>
						</Link>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 28,
		paddingBottom: 60,
	},
	header: {
		marginBottom: 28,
	},
	title: {
		fontSize: 24,
		fontWeight: "800",
		lineHeight: 30,
	},
	brand: {
		fontSize: 24,
		fontWeight: "800",
		lineHeight: 30,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 12,
		lineHeight: 16,
	},
	form: {
		marginBottom: 18,
	},
	label: {
		fontSize: 12,
		fontWeight: "700",
		marginBottom: 8,
	},
	input: {
		height: 46,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 14,
		fontSize: 13,
		marginBottom: 18,
	},
	button: {
		height: 46,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonDisabled: {
		opacity: 0.55,
	},
	buttonText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "700",
	},
	footerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	footerText: {
		fontSize: 12,
		fontWeight: "600",
	},
	footerLink: {
		fontSize: 12,
		fontWeight: "700",
	},
});