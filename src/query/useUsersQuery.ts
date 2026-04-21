import { useQuery } from "@tanstack/react-query";
import {
  usersQueryOptions,
  type UsersTableQueryParams,
} from "@/queryOptions/usersQueryOptions";

export function useUsersQuery(params: UsersTableQueryParams) {
  return useQuery(usersQueryOptions(params));
}
