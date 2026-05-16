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

export default function RegisterScreen() {
	const colors = useThemeColors();
	const { sendSignupOtp } = useAuth();

	const [lastName, setLastName] = useState("");
	const [firstName, setFirstName] = useState("");
	const [phone, setPhone] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const normalizedPhone = useMemo(
		() => normalizePhoneNumber(phone),
		[phone]
	);

	const fullName = `${lastName.trim()} ${firstName.trim()}`.trim();

	const canSubmit =
		lastName.trim().length > 0 &&
		firstName.trim().length > 0 &&
		isValidPhoneNumber(normalizedPhone) &&
		!isSubmitting;

	async function handleSignup() {
		if (!canSubmit) return;

		try {
			setIsSubmitting(true);

			await sendSignupOtp(normalizedPhone);

			router.push({
				pathname: "/(auth)/verify-otp",
				params: {
					phone: normalizedPhone,
					flow: "signup",
					fullName,
				},
			});
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Không thể gửi mã OTP. Vui lòng thử lại.";

			Alert.alert("Đăng ký thất bại", message);
		} finally {
			setIsSubmitting(false);
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
							Tạo tài khoản
						</Text>

						<Text
							style={[
								styles.subtitle,
								{ color: colors.neutral.dark.light },
							]}
						>
							Sạch nhà, Xanh đất nước
						</Text>
					</View>

					<View style={styles.form}>
						<Text
							style={[
								styles.label,
								{ color: colors.neutral.dark.darkest },
							]}
						>
							Họ
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
							value={lastName}
							onChangeText={setLastName}
							placeholder="Hãy điền họ của bạn"
							placeholderTextColor={colors.neutral.dark.light}
							autoCapitalize="words"
							returnKeyType="next"
						/>

						<Text
							style={[
								styles.label,
								{ color: colors.neutral.dark.darkest },
							]}
						>
							Tên
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
							value={firstName}
							onChangeText={setFirstName}
							placeholder="Hãy điền tên của bạn"
							placeholderTextColor={colors.neutral.dark.light}
							autoCapitalize="words"
							returnKeyType="next"
						/>

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
							onSubmitEditing={handleSignup}
						/>

						<Pressable
							style={[
								styles.button,
								{ backgroundColor: colors.highlight.medium },
								!canSubmit && styles.buttonDisabled,
							]}
							onPress={handleSignup}
							disabled={!canSubmit}
						>
							{isSubmitting ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Đăng ký</Text>
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
							Đã có tài khoản?
						</Text>

						<Link href="/(auth)/login" asChild>
							<Pressable>
								<Text
									style={[
										styles.footerLink,
										{ color: colors.highlight.medium },
									]}
								>
									Đăng nhập
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
		paddingBottom: 40,
	},
	header: {
		marginBottom: 24,
	},
	title: {
		fontSize: 24,
		fontWeight: "800",
		lineHeight: 30,
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 12,
		lineHeight: 16,
	},
	form: {
		marginBottom: 16,
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
		marginBottom: 14,
	},
	button: {
		height: 46,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 4,
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