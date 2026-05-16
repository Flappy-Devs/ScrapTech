import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import {
	getMyLatestAddress,
	saveMyPickupAddress,
} from "./addresses.api";

export const addressKeys = {
	all: ["addresses"] as const,
	latest: () => [...addressKeys.all, "latest"] as const,
};

export function useMyLatestAddress() {
	return useQuery({
		queryKey: addressKeys.latest(),
		queryFn: getMyLatestAddress,
	});
}

export function useSaveMyPickupAddress() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: saveMyPickupAddress,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: addressKeys.all,
			});
		},
	});
}
