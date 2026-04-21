"use client";

import { useQuery } from "@tanstack/react-query";
import {
  usersQueryOptions,
  type UsersTableQueryParams,
} from "@/queryOptions/usersQueryOptions";

/**
 * React Query hook for the dashboard users table (paginated API list).
 */
export function useUsersTableQuery(params: UsersTableQueryParams) {
  return useQuery(usersQueryOptions(params));
}
