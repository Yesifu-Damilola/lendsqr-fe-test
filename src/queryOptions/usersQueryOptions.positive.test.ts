import { describe, expect, it, vi } from "vitest";
import type { PaginatedUsersResult } from "@/api/usersApi";
import {
  USERS_FULL_TABLE_FETCH_LIMIT,
  usersQueryKey,
  usersQueryOptions,
} from "./usersQueryOptions";
import { fetchUsersForTablePaginated } from "@/api/usersApi";

async function runUsersQueryFn(
  opts: ReturnType<typeof usersQueryOptions>,
): Promise<PaginatedUsersResult> {
  const fn = opts.queryFn;
  if (typeof fn !== "function") {
    throw new Error("Expected queryFn to be a function");
  }
  return fn({} as never);
}

vi.mock("@/api/usersApi", () => ({
  fetchUsersForTablePaginated: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchUsersForTablePaginated);

describe("usersQueryKey (positive)", () => {
  it("uses stable full-fetch key when fetchAll is true", () => {
    expect(
      usersQueryKey({
        searchQuery: "acme",
        page: 2,
        pageSize: 10,
        fetchAll: true,
      }),
    ).toEqual(["users", "full", "acme"]);
  });

  it("includes pagination params when fetchAll is false", () => {
    expect(
      usersQueryKey({
        searchQuery: "",
        page: 3,
        pageSize: 20,
        fetchAll: false,
      }),
    ).toEqual(["users", "page", "", 3, 20]);
  });
});

describe("usersQueryOptions (positive)", () => {
  it("requests a single large page when fetchAll is true", async () => {
    mockedFetch.mockResolvedValueOnce({ items: [], total: 0 });
    const opts = usersQueryOptions({
      searchQuery: "q",
      page: 5,
      pageSize: 99,
      fetchAll: true,
    });
    await runUsersQueryFn(opts);
    expect(mockedFetch).toHaveBeenCalledWith({
      searchQuery: "q",
      page: 1,
      pageSize: USERS_FULL_TABLE_FETCH_LIMIT,
    });
  });

  it("passes through page and pageSize when fetchAll is false", async () => {
    mockedFetch.mockResolvedValueOnce({ items: [], total: 0 });
    const opts = usersQueryOptions({
      searchQuery: "term",
      page: 4,
      pageSize: 15,
      fetchAll: false,
    });
    await runUsersQueryFn(opts);
    expect(mockedFetch).toHaveBeenCalledWith({
      searchQuery: "term",
      page: 4,
      pageSize: 15,
    });
  });

  it("exposes retry and cache settings", () => {
    const opts = usersQueryOptions({
      searchQuery: "",
      page: 1,
      pageSize: 10,
      fetchAll: false,
    });
    expect(opts.retry).toBe(1);
    expect(opts.staleTime).toBe(1000 * 60 * 5);
    expect(opts.gcTime).toBe(1000 * 60 * 15);
  });
});
