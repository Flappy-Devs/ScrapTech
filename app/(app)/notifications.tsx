import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
	const [pushEnabled, setPushEnabled] = useState(true);
	const [orderUpdates, setOrderUpdates] = useState(true);
	const [reminderEnabled, setReminderEnabled] = useState(false);
	const [soundEnabled, setSoundEnabled] = useState(true);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<ScreenHeader title="Thông báo và âm thanh" />

				<Text style={styles.sectionTitle}>Thông báo</Text>
				<View style={styles.card}>
					<ToggleRow
						icon="notifications-outline"
						label="Thông báo đẩy"
						description="Nhận thông báo từ ứng dụng"
						value={pushEnabled}
						onValueChange={setPushEnabled}
					/>
					<Divider />
					<ToggleRow
						icon="receipt-outline"
						label="Cập nhật đơn hàng"
						description="Nhận trạng thái mới nhất của đơn thu gom"
						value={orderUpdates}
						onValueChange={setOrderUpdates}
					/>
					<Divider />
					<ToggleRow
						icon="alarm-outline"
						label="Nhắc lịch thu gom"
						description="Nhắc trước khi đơn hàng đến lịch xử lý"
						value={reminderEnabled}
						onValueChange={setReminderEnabled}
					/>
				</View>

				<Text style={styles.sectionTitle}>Âm thanh</Text>
				<View style={styles.card}>
					<ToggleRow
						icon="volume-high-outline"
						label="Âm thanh và rung"
						description="Phát âm báo khi có thông báo mới"
						value={soundEnabled}
						onValueChange={setSoundEnabled}
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
				<Ionicons name={props.icon} size={20} color="#C4D600" />
			</View>

			<View style={styles.rowContent}>
				<Text style={styles.rowLabel}>{props.label}</Text>
				<Text style={styles.rowDescription}>{props.description}</Text>
			</View>

			<Switch
				value={props.value}
				onValueChange={props.onValueChange}
				trackColor={{ false: "#E8E9F1", true: "#EEF58A" }}
				thumbColor={props.value ? "#C4D600" : "#FFFFFF"}
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
		backgroundColor: "#FBFDEB",
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