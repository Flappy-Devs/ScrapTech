import { supabase } from "@/src/lib/supabase";
import { throwIfSupabaseError } from "@/src/lib/api-error";
import type { Notification } from "@/src/types/app.types";

export async function getMyNotifications(): Promise<Notification[]> {
	const { data, error } = await supabase
		.from("notifications")
		.select("*")
		.order("created_at", { ascending: false });

	throwIfSupabaseError(error);

	return data ?? [];
}

export async function markNotificationAsRead(
	notificationId: string
): Promise<void> {
	const { error } = await supabase
		.from("notifications")
		.update({ is_read: true })
		.eq("id", notificationId);

	throwIfSupabaseError(error);
}

export async function markAllNotificationsAsRead(): Promise<void> {
	const { error } = await supabase
		.from("notifications")
		.update({ is_read: true })
		.eq("is_read", false);

	throwIfSupabaseError(error);
}