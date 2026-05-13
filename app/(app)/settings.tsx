import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useAuth } from "@/src/hooks/useAuth";


export default function SettingsScreen() {

	const { signOut } = useAuth();
	const c = useThemeColors();

	return (
		<ScrollView style={[styles.container, { backgroundColor: c.neutral.light.lightest }]} contentContainerStyle={styles.content}>
			{/* ── Account ────────────────────────────────────────────── */}
			<Text style={[styles.sectionTitle, { color: c.neutral.dark.darkest }]}>{"Tài khoản"}</Text>
			<View style={[styles.card, { backgroundColor: c.neutral.light.light, borderColor: c.neutral.light.medium }]}>
				<Pressable style={styles.cardRow} onPress={signOut}>
					<Text style={[styles.rowLabel, { color: c.error.dark }]}>{"Đăng xuất"}</Text>
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
