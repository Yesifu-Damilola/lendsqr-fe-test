import axios, { isAxiosError } from "axios";
import type { UserDetailData, UserRow } from "@/types/users";
import { getUserDetail } from "@/data/mockUsers";
import { getMockUserRows } from "@/data/mockUsersSeed";
import { httpClient } from "./httpClient";
import {
  readUserDetailFromStorage,
  writeUserDetailToStorage,
} from "@/lib/userDetailStorage";
import {
  filterUsersByQuery,
  normalizeUserDetailResponse,
  normalizeUsersResponse,
  paginateLocal,
  readNumericTotal,
  replaceIdToken,
} from "@/lib/usersTablePure";
import type { UnknownRecord } from "@/lib/usersTablePure";

const USERS_ENDPOINT = "users";
const USER_DETAIL_ENDPOINT = "users/{id}";
const USERS_URL = process.env.NEXT_PUBLIC_USERS_URL?.trim();
const USER_DETAIL_URL = process.env.NEXT_PUBLIC_USER_DETAILS_URL?.trim();

/** Official Lendsqr assessment list (used when `NEXT_PUBLIC_MOCK_API_BASE_URL` is set without `NEXT_PUBLIC_USERS_URL`). */
const LENDSQR_PUBLIC_USERS_LIST_URL =
  "https://6270020422c706a0ae70b72c.mockapi.io/lendsqr/api/v1/users";

function usesBuiltInUsersMock(): boolean {
  return !USERS_URL && !process.env.NEXT_PUBLIC_MOCK_API_BASE_URL?.trim();
}

function usersListRequestTarget(): string {
  if (USERS_URL) return USERS_URL;
  if (process.env.NEXT_PUBLIC_MOCK_API_BASE_URL?.trim()) return USERS_ENDPOINT;
  return LENDSQR_PUBLIC_USERS_LIST_URL;
}

function userDetailRequestTarget(id: string): string {
  if (USER_DETAIL_URL) return replaceIdToken(USER_DETAIL_URL, id);
  if (process.env.NEXT_PUBLIC_MOCK_API_BASE_URL?.trim()) {
    return replaceIdToken(USER_DETAIL_ENDPOINT, id);
  }
  return `${LENDSQR_PUBLIC_USERS_LIST_URL}/${encodeURIComponent(id)}`;
}

export type PaginatedUsersResult = {
  items: UserRow[];
  total: number;
};

async function fetchBuiltInUsersPage(params: {
  searchQuery: string;
  page: number;
  pageSize: number;
}): Promise<PaginatedUsersResult> {
  const origin =
    typeof window !== "undefined" ? window.location.origin : null;
  if (!origin) {
    const rows = getMockUserRows();
    const q = params.searchQuery.trim();
    const filtered = q ? filterUsersByQuery(rows, q) : rows;
    return paginateLocal(filtered, params.page, params.pageSize);
  }

  const q = params.searchQuery.trim();
  const sp = new URLSearchParams({
    page: String(params.page),
    limit: String(params.pageSize),
  });
  if (q) sp.set("query", q);

  const res = await fetch(`${origin}/api/users?${sp}`);
  if (!res.ok) {
    throw new Error(`Mock users API error: ${res.status}`);
  }
  const data: unknown = await res.json();
  const rows = normalizeUsersResponse(data);
  const filtered = q ? filterUsersByQuery(rows, q) : rows;

  if (filtered.length === 0) {
    if (!q) {
      throw new Error("Empty or invalid users response from mock API.");
    }
    return { items: [], total: 0 };
  }

  if (typeof data === "object" && data !== null) {
    const total = readNumericTotal(data as UnknownRecord);
    if (total !== null && total > filtered.length) {
      return { items: filtered, total };
    }
  }

  return paginateLocal(filtered, params.page, params.pageSize);
}

export async function getUsers(searchQuery?: string): Promise<UserRow[]> {
  const { items } = await fetchUsersForTablePaginated({
    searchQuery,
    page: 1,
    pageSize: 50_000,
  });
  return items;
}

export async function fetchUsersForTablePaginated({
  searchQuery = "",
  page,
  pageSize,
}: {
  searchQuery?: string;
  page: number;
  pageSize: number;
}): Promise<PaginatedUsersResult> {
  const q = searchQuery.trim();

  if (usesBuiltInUsersMock()) {
    try {
      return await fetchBuiltInUsersPage({ searchQuery: q, page, pageSize });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        const rows = getMockUserRows();
        const filtered = q ? filterUsersByQuery(rows, q) : [...rows];
        return paginateLocal(filtered, page, pageSize);
      }
      throw error;
    }
  }

  const params: Record<string, string | number> = {
    page,
    limit: pageSize,
  };
  if (q) params.query = q;

  try {
    const target = usersListRequestTarget();
    const { data } = USERS_URL
      ? await axios.get<unknown>(USERS_URL, { params })
      : await httpClient.get<unknown>(target, { params });
    const rows = normalizeUsersResponse(data);
    const filtered = q ? filterUsersByQuery(rows, q) : rows;

    if (filtered.length === 0) {
      if (!q) {
        throw new Error("Empty or invalid users response from mock API.");
      }
      return { items: [], total: 0 };
    }

    if (typeof data === "object" && data !== null) {
      const total = readNumericTotal(data as UnknownRecord);
      if (total !== null && total > filtered.length) {
        return { items: filtered, total };
      }
    }

    return paginateLocal(filtered, page, pageSize);
  } catch (error) {
    if (
      process.env.NODE_ENV !== "production" &&
      isAxiosError(error) &&
      !error.response
    ) {
      const rows = getMockUserRows();
      const base = q ? filterUsersByQuery(rows, q) : [...rows];
      return paginateLocal(base, page, pageSize);
    }
    throw error;
  }
}

function userDetailFromCacheOrSeed(id: string): UserDetailData | null {
  return readUserDetailFromStorage(id) ?? getUserDetail(id) ?? null;
}

export async function getUserDetailById(
  id: string,
): Promise<UserDetailData | null> {
  if (usesBuiltInUsersMock()) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : null;
    if (origin) {
      try {
        const res = await fetch(
          `${origin}/api/users/${encodeURIComponent(id)}`,
        );
        if (res.ok) {
          const data: unknown = await res.json();
          const normalized = normalizeUserDetailResponse(data, id) ?? null;
          if (normalized) {
            writeUserDetailToStorage(normalized);
            return normalized;
          }
        }
      } catch {
        // fall through to cache / seed
      }
    }
    return userDetailFromCacheOrSeed(id);
  }

  try {
    const target = userDetailRequestTarget(id);
    const { data } = await httpClient.get<unknown>(target);
    const normalized = normalizeUserDetailResponse(data, id) ?? null;
    if (normalized) {
      writeUserDetailToStorage(normalized);
      return normalized;
    }
    return null;
  } catch (error) {
    const cached = readUserDetailFromStorage(id);
    if (cached) return cached;
    if (
      process.env.NODE_ENV !== "production" &&
      isAxiosError(error) &&
      !error.response
    ) {
      return getUserDetail(id) ?? null;
    }
    throw error;
  }
}
