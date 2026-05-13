import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { useAuth } from "@/src/features/auth";
import { useThemeColors } from "@/src/hooks/useThemeColors";


export default function SettingsScreen() {
	const { t, i18n } = useTranslation();
	const c = useThemeColors();
	const { signOut } = useAuth();

	const handleLanguageChange = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	return (
		<ScrollView style={[styles.container, { backgroundColor: c.neutral.light.lightest }]} contentContainerStyle={styles.content}>
			{/* ── Language ───────────────────────────────────────────── */}
			<Text style={[styles.sectionTitle, { color: c.neutral.dark.darkest }]}>{t("settings.language").toUpperCase()}</Text>
			<View style={[styles.card, { backgroundColor: c.neutral.light.light, borderColor: c.neutral.light.medium }]}>
				{[
					{ key: "en", label: t("settings.english") },
					{ key: "vi", label: t("settings.vietnamese") },
				].map((lang, idx) => (
					<Pressable key={lang.key} style={[styles.cardRow, idx > 0 && { borderTopWidth: 1, borderTopColor: c.neutral.light.medium }]} onPress={() => handleLanguageChange(lang.key)}>
						<Text style={[styles.rowLabel, { color: c.neutral.dark.darkest }]}>{lang.label}</Text>
						{i18n.language === lang.key && <Text style={{ color: c.highlight.medium, fontSize: 16 }}>✓</Text>}
					</Pressable>
				))}
			</View>

			{/* ── Account ────────────────────────────────────────────── */}
			<Text style={[styles.sectionTitle, { color: c.neutral.dark.darkest }]}>{t("settings.account").toUpperCase()}</Text>
			<View style={[styles.card, { backgroundColor: c.neutral.light.light, borderColor: c.neutral.light.medium }]}>
				<Pressable style={styles.cardRow} onPress={signOut}>
					<Text style={[styles.rowLabel, { color: c.error.dark }]}>{t("auth.signOut")}</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: 16, paddingBottom: 40 },
	sectionTitle: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 1,
		marginTop: 24,
		marginBottom: 8,
		marginLeft: 4,
	},
	card: {
		borderWidth: 1,
		borderRadius: 12,
		overflow: "hidden",
	},
	cardRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	rowLabel: {
		fontSize: 16,
	},
});
