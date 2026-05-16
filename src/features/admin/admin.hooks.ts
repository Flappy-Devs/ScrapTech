import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import {
	createAdminScrapPrice,
	deleteAdminScrapPrice,
	getAdminPickupOrderById,
	getAdminPickupOrders,
	getAdminScrapPriceCatalog,
	updateAdminPickupOrder,
	updateAdminScrapPrice,
	type AdminOrderBucket,
} from "./admin.api";

export const adminOrderKeys = {
	all: ["admin", "orders"] as const,
	list: (bucket: AdminOrderBucket) =>
		[...adminOrderKeys.all, "list", bucket] as const,
	detail: (orderId: string) =>
		[...adminOrderKeys.all, "detail", orderId] as const,
};

export const adminPriceKeys = {
	all: ["admin", "prices"] as const,
	catalog: () => [...adminPriceKeys.all, "catalog"] as const,
};

export function useAdminPickupOrders(bucket: AdminOrderBucket) {
	return useQuery({
		queryKey: adminOrderKeys.list(bucket),
		queryFn: () => getAdminPickupOrders(bucket),
	});
}

export function useAdminPickupOrder(
	orderId: string,
	enabled = true
) {
	return useQuery({
		queryKey: adminOrderKeys.detail(orderId),
		queryFn: () => getAdminPickupOrderById(orderId),
		enabled: enabled && Boolean(orderId),
	});
}

export function useUpdateAdminPickupOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateAdminPickupOrder,
		onSuccess: async (_, input) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: adminOrderKeys.all,
				}),
				queryClient.invalidateQueries({
					queryKey: adminOrderKeys.detail(input.orderId),
				}),
			]);
		},
	});
}

export function useAdminScrapPriceCatalog() {
	return useQuery({
		queryKey: adminPriceKeys.catalog(),
		queryFn: getAdminScrapPriceCatalog,
	});
}

export function useCreateAdminScrapPrice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAdminScrapPrice,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: adminPriceKeys.all,
			});
		},
	});
}

export function useUpdateAdminScrapPrice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateAdminScrapPrice,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: adminPriceKeys.all,
			});
		},
	});
}

export function useDeleteAdminScrapPrice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAdminScrapPrice,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: adminPriceKeys.all,
			});
		},
	});
}