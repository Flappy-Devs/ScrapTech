import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useAuth } from "@/src/hooks/useAuth";

export default function LoginScreen() {
	const c = useThemeColors();
	const { signIn } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	const handleSignIn = async () => {
		if (!email || !password) return;
		setLoading(true);
		try {
			await signIn(email, password);
		} catch (error: any) {
			Alert.alert(error.message);
		} finally {
			setLoading(false);
			router.replace("/(app)");
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: c.neutral.light.lightest }]}>
			<View style={styles.inner}>
				<Text style={[styles.appName, { color: c.highlight.medium }]}>{"ScrapTech"}</Text>
				<Text style={[styles.title, { color: c.neutral.dark.darkest }]}>{"Đăng nhập"}</Text>

				<TextInput style={[styles.input, { color: c.neutral.dark.darkest, borderColor: c.neutral.light.medium, backgroundColor: c.neutral.light.light }]} placeholder={"Email"} placeholderTextColor={c.neutral.dark.light} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

				<TextInput style={[styles.input, { color: c.neutral.dark.darkest, borderColor: c.neutral.light.medium, backgroundColor: c.neutral.light.light }]} placeholder={"Mật khẩu"} placeholderTextColor={c.neutral.dark.light} value={password} onChangeText={setPassword} secureTextEntry />

				<Pressable style={[styles.button, { backgroundColor: c.highlight.medium }, loading && styles.buttonDisabled]} onPress={handleSignIn} disabled={loading}>
					{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{"Đăng nhập"}</Text>}
				</Pressable>

				<Link href="/(auth)/register" asChild>
					<Pressable style={styles.linkRow}>
						<Text style={{ color: c.neutral.dark.darkest }}>{"Chưa có tài khoản?"}</Text>
						<Text style={{ color: c.highlight.medium, fontWeight: "600", marginLeft: 4 }}>{"Đăng ký"}</Text>
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
