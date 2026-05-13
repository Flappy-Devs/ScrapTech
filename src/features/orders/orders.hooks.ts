import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    cancelPickupOrder,
    createPickupOrder,
    getMyPickupOrders,
    getPickupOrderById,
} from "./orders.api";

export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    detail: (orderId: string) =>
        [...orderKeys.all, "detail", orderId] as const,
};

export function useMyPickupOrders() {
    return useQuery({
        queryKey: orderKeys.lists(),
        queryFn: getMyPickupOrders,
    });
}

export function usePickupOrder(orderId: string) {
    return useQuery({
        queryKey: orderKeys.detail(orderId),
        queryFn: () => getPickupOrderById(orderId),
        enabled: Boolean(orderId),
    });
}

export function useCreatePickupOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPickupOrder,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: orderKeys.lists(),
            });
        },
    });
}

export function useCancelPickupOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelPickupOrder,
        onSuccess: async (_, orderId) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: orderKeys.lists(),
                }),
                queryClient.invalidateQueries({
                    queryKey: orderKeys.detail(orderId),
                }),
            ]);
        },
    });
}