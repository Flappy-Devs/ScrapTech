import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacySafetyScreen() {
	const [secureNotifications, setSecureNotifications] = useState(true);
	const [activityProtection, setActivityProtection] = useState(false);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<ScreenHeader title="Quyền riêng tư và an toàn" />

				<Text style={styles.sectionTitle}>Quyền riêng tư</Text>
				<View style={styles.card}>
					<BasicRow
						icon="document-text-outline"
						label="Chính sách quyền riêng tư"
						description="Xem cách dữ liệu cá nhân được sử dụng"
					/>
					<Divider />
					<BasicRow
						icon="server-outline"
						label="Quản lý dữ liệu"
						description="Kiểm tra thông tin lưu trữ trong tài khoản"
					/>
				</View>

				<Text style={styles.sectionTitle}>Bảo mật</Text>
				<View style={styles.card}>
					<ToggleRow
						icon="notifications-circle-outline"
						label="Cảnh báo bảo mật"
						description="Nhận thông báo khi có hoạt động bất thường"
						value={secureNotifications}
						onValueChange={setSecureNotifications}
					/>
					<Divider />
					<ToggleRow
						icon="shield-checkmark-outline"
						label="Bảo vệ hoạt động"
						description="Tăng cường quyền riêng tư khi sử dụng ứng dụng"
						value={activityProtection}
						onValueChange={setActivityProtection}
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

function BasicRow(props: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description: string;
}) {
	return (
		<Pressable style={styles.row} onPress={() => {Alert.alert("Tính năng ngoài scope chưa thực hiện!")}}>
			<View style={styles.rowIcon}>
				<Ionicons name={props.icon} size={20} color="#A855F7" />
			</View>

			<View style={styles.rowContent}>
				<Text style={styles.rowLabel}>{props.label}</Text>
				<Text style={styles.rowDescription}>{props.description}</Text>
			</View>

			<Ionicons name="chevron-forward" size={18} color="#C5C6CC" />
		</Pressable>
	);
}

function ToggleRow(props: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
}) {
	return (
		<View style={styles.row}>
			<View style={styles.rowIcon}>
				<Ionicons name={props.icon} size={20} color="#A855F7" />
			</View>

			<View style={styles.rowContent}>
				<Text style={styles.rowLabel}>{props.label}</Text>
				<Text style={styles.rowDescription}>{props.description}</Text>
			</View>

			<Switch
				value={props.value}
				onValueChange={props.onValueChange}
				trackColor={{ false: "#E8E9F1", true: "#D8B4FE" }}
				thumbColor={props.value ? "#A855F7" : "#FFFFFF"}
			/>
		</View>
	);
}

function Divider() {
	return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
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
		fontSize: 17,
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
		minHeight: 78,
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
		backgroundColor: "#F7F0FF",
		marginRight: 14,
	},
	rowContent: {
		flex: 1,
		paddingRight: 10,
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
	divider: {
		height: 1,
		marginLeft: 66,
		backgroundColor: "#F0F0F0",
	},
});