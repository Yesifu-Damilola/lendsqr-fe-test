import type { UseQueryOptions } from "@tanstack/react-query";
import type { PaginatedUsersResult } from "@/api/usersApi";
import { fetchUsersForTablePaginated } from "@/api/usersApi";

/** Max rows fetched in one request for dashboard stats and advanced filters. */
export const USERS_FULL_TABLE_FETCH_LIMIT = 10_000;

export type UsersTableQueryParams = {
  searchQuery: string;
  page: number;
  pageSize: number;
  /** Load all rows once for client-side advanced filters + pagination. */
  fetchAll: boolean;
};

export function usersQueryKey(params: UsersTableQueryParams) {
  if (params.fetchAll) {
    return ["users", "full", params.searchQuery] as const;
  }
  return [
    "users",
    "page",
    params.searchQuery,
    params.page,
    params.pageSize,
  ] as const;
}

export function usersQueryOptions(
  params: UsersTableQueryParams,
): UseQueryOptions<PaginatedUsersResult, Error> {
  return {
    queryKey: usersQueryKey(params),
    queryFn: () => {
      if (params.fetchAll) {
        return fetchUsersForTablePaginated({
          searchQuery: params.searchQuery,
          page: 1,
          pageSize: USERS_FULL_TABLE_FETCH_LIMIT,
        });
      }
      return fetchUsersForTablePaginated({
        searchQuery: params.searchQuery,
        page: params.page,
        pageSize: params.pageSize,
      });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
  };
}
