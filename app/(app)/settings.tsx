import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function SettingsScreen() {
	const colors = useThemeColors();

	return (
		<SafeAreaView
			style={[
				styles.safeArea,
				{ backgroundColor: colors.neutral.light.lightest },
			]}
		>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<ScreenHeader title="Cài đặt ứng dụng" />

				<Text style={styles.sectionTitle}>Tài khoản</Text>
				<View style={styles.card}>
					<SettingRow
						icon="person-outline"
						label="Thông tin cá nhân"
						description="Quản lý hồ sơ tài khoản"
					/>
					<Divider />
					<SettingRow
						icon="location-outline"
						label="Địa chỉ đã lưu"
						description="Xem và cập nhật địa chỉ mặc định"
					/>
				</View>

				<Text style={styles.sectionTitle}>Ứng dụng</Text>
				<View style={styles.card}>
					<SettingRow
						icon="language-outline"
						label="Ngôn ngữ"
						value="Tiếng Việt"
					/>
					<Divider />
					<SettingRow
						icon="sunny-outline"
						label="Giao diện"
						value="Sáng"
					/>
					<Divider />
					<SettingRow
						icon="information-circle-outline"
						label="Phiên bản ứng dụng"
						value="1.0.0"
						hideChevron
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function ScreenHeader({ title }: { title: string }) {
	return (
		<View style={styles.header}>
			<Pressable style={styles.backButton} onPress={() => router.back()}>
				<Ionicons name="chevron-back" size={20} color="#1E1E1E" />
			</Pressable>

			<Text style={styles.headerTitle}>{title}</Text>

			<View style={styles.headerSpacer} />
		</View>
	);
}

function SettingRow(props: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description?: string;
	value?: string;
	hideChevron?: boolean;
}) {
	return (
		<Pressable style={styles.row} onPress={() => {Alert.alert("Tính năng ngoài scope chưa thực hiện!")}}>
			<View style={styles.rowIcon}>
				<Ionicons name={props.icon} size={20} color="#22C55E" />
			</View>

			<View style={styles.rowContent}>
				<Text style={styles.rowLabel}>{props.label}</Text>
				{props.description ? (
					<Text style={styles.rowDescription}>{props.description}</Text>
				) : null}
			</View>

			{props.value ? (
				<Text style={styles.rowValue}>{props.value}</Text>
			) : null}

			{!props.hideChevron ? (
				<Ionicons name="chevron-forward" size={18} color="#C5C6CC" />
			) : null}
		</Pressable>
	);
}

function Divider() {
	return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 40,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	backButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
	headerSpacer: {
		width: 38,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "800",
		color: "#1E1E1E",
		marginBottom: 10,
		marginTop: 8,
	},
	card: {
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		overflow: "hidden",
		marginBottom: 22,
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 14,
		elevation: 3,
	},
	row: {
		minHeight: 72,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	rowIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#DCFCE7",
		marginRight: 14,
	},
	rowContent: {
		flex: 1,
	},
	rowLabel: {
		fontSize: 13,
		fontWeight: "800",
		color: "#1E1E1E",
	},
	rowDescription: {
		marginTop: 3,
		fontSize: 11,
		lineHeight: 15,
		color: "#71727A",
	},
	rowValue: {
		fontSize: 12,
		fontWeight: "700",
		color: "#71727A",
		marginRight: 8,
	},
	divider: {
		height: 1,
		marginLeft: 66,
		backgroundColor: "#F0F0F0",
	},
});