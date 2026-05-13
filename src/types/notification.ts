export type NotificationType =
    | "order_confirmed"
    | "order_rejected"
    | "order_status_updated"
    | "price_updated"
    | "general";

export interface Notification {
    id: string;
    user_id: string;
    order_id: string | null;
    type: NotificationType;
    title: string;
    body: string | null;
    is_read: boolean;
    created_at: string;
}