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

describe("usersQueryKey (negative)", () => {
  it("does not collide full-fetch key with paginated key for same numbers", () => {
    const fullKey = usersQueryKey({
      searchQuery: "",
      page: 1,
      pageSize: 10,
      fetchAll: true,
    });
    const pageKey = usersQueryKey({
      searchQuery: "",
      page: 1,
      pageSize: 10,
      fetchAll: false,
    });
    expect(fullKey).not.toEqual(pageKey);
  });
});

describe("usersQueryOptions (negative)", () => {
  it("does not pass client page through when fetchAll is true", async () => {
    mockedFetch.mockResolvedValueOnce({ items: [], total: 0 });
    const opts = usersQueryOptions({
      searchQuery: "",
      page: 5,
      pageSize: 10,
      fetchAll: true,
    });
    await runUsersQueryFn(opts);
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: USERS_FULL_TABLE_FETCH_LIMIT }),
    );
    expect(mockedFetch).not.toHaveBeenCalledWith(
      expect.objectContaining({ page: 5 }),
    );
  });
});
