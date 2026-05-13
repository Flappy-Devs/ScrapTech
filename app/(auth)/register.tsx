import { Link } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "@/src/features/auth";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function RegisterScreen() {
	const { t } = useTranslation();
	const c = useThemeColors();
	const { signUp } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignUp = async () => {
		if (!email || !password) return;
		if (password !== confirmPassword) {
			Alert.alert(t("common.error"), "Passwords do not match");
			return;
		}
		setLoading(true);
		try {
			await signUp(email, password);
			Alert.alert("Success", "Check your email for verification!");
		} catch (error: any) {
			Alert.alert(t("common.error"), error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: c.neutral.light.lightest }]}>
			<View style={styles.inner}>
				<Text style={[styles.appName, { color: c.highlight.medium }]}>{t("common.appName")}</Text>
				<Text style={[styles.title, { color: c.neutral.dark.darkest }]}>{t("auth.register")}</Text>

				<TextInput style={[styles.input, { color: c.neutral.dark.darkest, borderColor: c.neutral.light.medium, backgroundColor: c.neutral.light.light }]} placeholder={t("auth.email")} placeholderTextColor={c.neutral.dark.light} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

				<TextInput style={[styles.input, { color: c.neutral.dark.darkest, borderColor: c.neutral.light.medium, backgroundColor: c.neutral.light.light }]} placeholder={t("auth.password")} placeholderTextColor={c.neutral.dark.light} value={password} onChangeText={setPassword} secureTextEntry />

				<TextInput style={[styles.input, { color: c.neutral.dark.darkest, borderColor: c.neutral.light.medium, backgroundColor: c.neutral.light.light }]} placeholder={t("auth.confirmPassword")} placeholderTextColor={c.neutral.dark.light} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

				<Pressable style={[styles.button, { backgroundColor: c.highlight.medium }, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
					{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t("auth.register")}</Text>}
				</Pressable>

				<Link href="/(auth)/login" asChild>
					<Pressable style={styles.linkRow}>
						<Text style={{ color: c.neutral.dark.darkest }}>{t("auth.hasAccount")}</Text>
						<Text style={{ color: c.highlight.medium, fontWeight: "600", marginLeft: 4 }}>{t("auth.login")}</Text>
					</Pressable>
				</Link>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	inner: { flex: 1, justifyContent: "center", padding: 28 },
	appName: { fontSize: 36, fontWeight: "800", textAlign: "center", marginBottom: 4 },
	title: { fontSize: 18, textAlign: "center", marginBottom: 32 },
	input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 14 },
	button: { padding: 16, borderRadius: 12, alignItems: "center", marginTop: 8, marginBottom: 20 },
	buttonDisabled: { opacity: 0.6 },
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
	linkRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
});
