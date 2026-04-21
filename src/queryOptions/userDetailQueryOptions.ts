import type { UseQueryOptions } from "@tanstack/react-query";
import { getUserDetailById } from "@/api/usersApi";
import { readUserDetailFromStorage } from "@/lib/userDetailStorage";
import type { UserDetailData } from "@/types/users";

export function userDetailQueryKey(id: string) {
  return ["user-detail", id] as const;
}

export function userDetailQueryOptions(
  id: string,
): UseQueryOptions<UserDetailData | null, Error> {
  return {
    queryKey: userDetailQueryKey(id),
    queryFn: () => getUserDetailById(id),
    placeholderData: () => readUserDetailFromStorage(id) ?? undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
    enabled: Boolean(id),
  };
}
