import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getMyNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "./notifications.api";

export const notificationKeys = {
    all: ["notifications"] as const,
    list: () => [...notificationKeys.all, "list"] as const,
};

export function useMyNotifications() {
    return useQuery({
        queryKey: notificationKeys.list(),
        queryFn: getMyNotifications,
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationKeys.list(),
            });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationKeys.list(),
            });
        },
    });
}