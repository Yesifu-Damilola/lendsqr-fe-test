import { describe, expect, it } from "vitest";
import type { UserRow } from "@/types/users";
import {
  filterUsersByQuery,
  normalizeUserDetailResponse,
  normalizeUsersResponse,
  paginateLocal,
  readNumericTotal,
  replaceIdToken,
  toOptionalBool,
  toUserRow,
  toUserStatus,
} from "./usersTablePure";

const sampleRows: UserRow[] = [
  {
    id: "1",
    organization: "Lendsqr",
    username: "debby",
    email: "debby@example.com",
    phone: "08012345678",
    dateJoined: "2020-01-01",
    status: "active",
  },
  {
    id: "2",
    organization: "Other Org",
    username: "john",
    email: "john@other.com",
    phone: "09099999999",
    dateJoined: "2021-06-01",
    status: "pending",
  },
];

describe("replaceIdToken (positive)", () => {
  it("replaces {id} and :id tokens", () => {
    expect(replaceIdToken("/users/{id}/profile", "42")).toBe("/users/42/profile");
    expect(replaceIdToken("/users/:id", "abc")).toBe("/users/abc");
  });

  it("leaves strings without tokens unchanged", () => {
    expect(replaceIdToken("/users", "x")).toBe("/users");
  });
});

describe("toOptionalBool (positive)", () => {
  it.each([
    [true, true],
    ["true", true],
    [1, true],
    [false, false],
    ["false", false],
    [0, false],
  ] as const)("coerces %s to %s", (input, expected) => {
    expect(toOptionalBool(input)).toBe(expected);
  });
});

describe("toUserStatus (positive)", () => {
  it.each(["active", "inactive", "pending", "blacklisted"] as const)(
    "preserves known status %s",
    (status) => {
      expect(toUserStatus(status)).toBe(status);
    },
  );
});

describe("toUserRow (positive)", () => {
  it("maps API-shaped objects with aliases", () => {
    const row = toUserRow(
      {
        id: 5,
        orgName: "Acme",
        userName: "jane",
        email: "j@ac.me",
        phoneNumber: "111",
        createdAt: "today",
        status: "blacklisted",
        has_loan: true,
        savingsAccount: false,
      },
      0,
    );
    expect(row).toMatchObject({
      id: "5",
      organization: "Acme",
      username: "jane",
      email: "j@ac.me",
      phone: "111",
      dateJoined: "today",
      status: "blacklisted",
      hasLoan: true,
      hasSavings: false,
    });
  });
});

describe("filterUsersByQuery (positive)", () => {
  it("returns all rows for empty or whitespace query", () => {
    expect(filterUsersByQuery(sampleRows, "")).toEqual(sampleRows);
    expect(filterUsersByQuery(sampleRows, "   ")).toEqual(sampleRows);
  });

  it("matches organization, username, email, or phone case-insensitively", () => {
    expect(filterUsersByQuery(sampleRows, "lendsqr").map((u) => u.id)).toEqual(["1"]);
    expect(filterUsersByQuery(sampleRows, "DEBBY").map((u) => u.id)).toEqual(["1"]);
    expect(filterUsersByQuery(sampleRows, "other.com").map((u) => u.id)).toEqual(["2"]);
    expect(filterUsersByQuery(sampleRows, "0801234").map((u) => u.id)).toEqual(["1"]);
  });
});

describe("normalizeUsersResponse (positive)", () => {
  it("normalizes a bare array of users", () => {
    const rows = normalizeUsersResponse([
      { id: "a", username: "u", email: "e@e.com", organization: "o" },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("a");
  });

  it.each(["data", "users", "results", "items", "list"] as const)(
    "unwraps wrapped payload key %s",
    (key) => {
      const rows = normalizeUsersResponse({
        [key]: [{ id: "x", username: "u", email: "e@e.com", organization: "o" }],
      });
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe("x");
    },
  );
});

describe("readNumericTotal (positive)", () => {
  it("reads total from root, meta, or pagination", () => {
    expect(readNumericTotal({ total: 100 })).toBe(100);
    expect(readNumericTotal({ totalCount: "50" })).toBe(50);
    expect(readNumericTotal({ meta: { total: 7 } })).toBe(7);
    expect(readNumericTotal({ pagination: { totalCount: "12" } })).toBe(12);
  });
});

describe("paginateLocal (positive)", () => {
  const rows = sampleRows;

  it("returns first page slice", () => {
    const { items, total } = paginateLocal(rows, 1, 1);
    expect(total).toBe(2);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("1");
  });

  it("returns last page when page is beyond range", () => {
    const { items } = paginateLocal(rows, 99, 1);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("2");
  });
});

describe("normalizeUserDetailResponse (positive)", () => {
  const profile = { tierLabel: "A" };

  it("unwraps data and merges profile", () => {
    const detail = normalizeUserDetailResponse(
      {
        data: {
          id: "9",
          username: "x",
          email: "x@x.com",
          organization: "o",
          phone: "1",
          dateJoined: "d",
          status: "active",
          profile,
        },
      },
      "9",
    );
    expect(detail).toBeDefined();
    expect(detail!.profile).toEqual(profile);
    expect(detail!.id).toBe("9");
  });
});
