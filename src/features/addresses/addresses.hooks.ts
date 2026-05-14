import { useQuery } from "@tanstack/react-query";

import { getMyLatestAddress } from "./addresses.api";

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