import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	useMarkAllNotificationsAsRead,
	useMarkNotificationAsRead,
	useMyNotifications,
} from "@/src/features/notifications/notifications.hooks";
import type { Notification } from "@/src/types/app.types";

export default function NotificationsScreen() {
	const { data: notifications = [], isLoading } = useMyNotifications();
	const markAsRead = useMarkNotificationAsRead();
	const markAllAsRead = useMarkAllNotificationsAsRead();
	const hasUnread = notifications.some((notification) => !notification.is_read);

	async function handlePressNotification(notification: Notification) {
		if (!notification.is_read) {
			await markAsRead.mutateAsync(notification.id);
		}

		if (notification.order_id) {
			router.push(`/orders/${notification.order_id}`);
		}
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Pressable
					style={styles.backButton}
					onPress={() => router.replace("/user-info")}
				>
					<Ionicons name="arrow-back" size={20} color="#1E1E1E" />
				</Pressable>
				<Text style={styles.headerTitle}>Thông báo</Text>
				<Pressable
					style={styles.markAllButton}
					onPress={() => markAllAsRead.mutate()}
					disabled={!hasUnread || markAllAsRead.isPending}
				>
					<Ionicons
						name="checkmark-done-outline"
						size={20}
						color={hasUnread ? "#22C55E" : "#C5C6CC"}
					/>
				</Pressable>
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View style={styles.stateBox}>
						<ActivityIndicator size="large" color="#22C55E" />
					</View>
				) : notifications.length === 0 ? (
					<View style={styles.stateBox}>
						<Ionicons name="notifications-outline" size={42} color="#8F9098" />
						<Text style={styles.stateTitle}>Chưa có thông báo</Text>
					</View>
				) : (
					<View style={styles.list}>
						{notifications.map((notification) => (
							<NotificationRow
								key={notification.id}
								notification={notification}
								onPress={() => handlePressNotification(notification)}
							/>
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

function NotificationRow({
	notification,
	onPress,
}: {
	notification: Notification;
	onPress: () => void;
}) {
	const presentation = getNotificationPresentation(notification);

	return (
		<Pressable style={styles.notificationRow} onPress={onPress}>
			<View style={[styles.iconWrap, { backgroundColor: presentation.bg }]}>
				<Ionicons name={presentation.icon} size={18} color={presentation.fg} />
			</View>

			<View style={styles.notificationContent}>
				<View style={styles.titleRow}>
					<Text style={styles.notificationTitle} numberOfLines={1}>
						{notification.title}
					</Text>
					{!notification.is_read ? <View style={styles.unreadDot} /> : null}
					<Text style={styles.timeText}>
						{formatRelativeTime(notification.created_at)}
					</Text>
				</View>

				<Text style={styles.notificationBody} numberOfLines={2}>
					{notification.body || "Bạn có cập nhật mới."}
				</Text>
			</View>
		</Pressable>
	);
}

function getNotificationPresentation(notification: Notification): {
	icon: keyof typeof Ionicons.glyphMap;
	bg: string;
	fg: string;
} {
	switch (notification.type) {
		case "order_confirmed":
			return {
				icon: "checkmark-circle-outline",
				bg: "#DCFCE7",
				fg: "#22C55E",
			};
		case "order_rejected":
			return {
				icon: "close-circle-outline",
				bg: "#FEE2E2",
				fg: "#EF4444",
			};
		case "price_updated":
			return {
				icon: "trending-up-outline",
				bg: "#DBEAFE",
				fg: "#3B82F6",
			};
		case "order_status_updated":
			return {
				icon: "alert-outline",
				bg: "#FEF3C7",
				fg: "#F59E0B",
			};
		default:
			return {
				icon: "notifications-outline",
				bg: "#F3F4F6",
				fg: "#71727A",
			};
	}
}

function formatRelativeTime(value: string) {
	const diffMs = Date.now() - new Date(value).getTime();
	const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

	if (diffMinutes < 1) return "vừa xong";
	if (diffMinutes < 60) return `${diffMinutes} phút trước`;

	const diffHours = Math.floor(diffMinutes / 60);

	if (diffHours < 24) return `${diffHours} giờ trước`;

	const diffDays = Math.floor(diffHours / 24);

	if (diffDays < 7) return `${diffDays} ngày trước`;

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(value));
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
	header: {
		height: 86,
		paddingHorizontal: 18,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 12,
		elevation: 3,
	},
	backButton: {
		width: 38,
		height: 38,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	markAllButton: {
		width: 38,
		height: 38,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		paddingTop: 10,
		paddingBottom: 116,
	},
	stateBox: {
		minHeight: 260,
		alignItems: "center",
		justifyContent: "center",
	},
	stateTitle: {
		marginTop: 10,
		fontSize: 14,
		fontWeight: "800",
		color: "#71727A",
	},
	list: {
		backgroundColor: "#FFFFFF",
	},
	notificationRow: {
		minHeight: 78,
		paddingHorizontal: 18,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "flex-start",
		borderBottomWidth: 1,
		borderBottomColor: "#F0F0F0",
		backgroundColor: "#FFFFFF",
	},
	iconWrap: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	notificationContent: {
		flex: 1,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 7,
	},
	notificationTitle: {
		flex: 1,
		fontSize: 13,
		fontWeight: "900",
		color: "#1E1E1E",
	},
	unreadDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: "#EF4444",
	},
	timeText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#C5C6CC",
	},
	notificationBody: {
		marginTop: 4,
		fontSize: 11,
		lineHeight: 15,
		color: "#494A50",
	},
});
