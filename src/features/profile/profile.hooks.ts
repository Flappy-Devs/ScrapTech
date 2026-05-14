import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "./profile.api";

export const profileKeys = {
	all: ["profile"] as const,
	me: () => [...profileKeys.all, "me"] as const,
};

export function useMyProfile() {
	return useQuery({
		queryKey: profileKeys.me(),
		queryFn: getMyProfile,
	});
}