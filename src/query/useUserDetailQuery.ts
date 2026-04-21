import { useQuery } from "@tanstack/react-query";
import { userDetailQueryOptions } from "@/queryOptions/userDetailQueryOptions";

export function useUserDetailQuery(id: string) {
  return useQuery(userDetailQueryOptions(id));
}
