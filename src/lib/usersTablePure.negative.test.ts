import { describe, expect, it } from "vitest";
import type { UserRow } from "@/types/users";
import {
  filterUsersByQuery,
  normalizeUserDetailResponse,
  normalizeUsersResponse,
  paginateLocal,
  readNumericTotal,
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

describe("toOptionalBool (negative)", () => {
  it.each([null, undefined, "maybe", 2, {}, []])(
    "returns undefined for non-boolean coercibles: %s",
    (input) => {
      expect(toOptionalBool(input)).toBeUndefined();
    },
  );
});

describe("toUserStatus (negative)", () => {
  it.each(["unknown", "", null, 99, "ACTIVE"])(
    "maps invalid values to inactive: %s",
    (bad) => {
      expect(toUserStatus(bad)).toBe("inactive");
    },
  );
});

describe("toUserRow (negative / edge)", () => {
  it("fills defaults when fields are missing", () => {
    const row = toUserRow({}, 2);
    expect(row).toMatchObject({
      id: "3",
      organization: "Unknown org",
      username: "Unknown",
      email: "unknown@example.com",
      phone: "-",
      dateJoined: "-",
      status: "inactive",
    });
    expect(row.hasLoan).toBeUndefined();
    expect(row.hasSavings).toBeUndefined();
  });
});

describe("filterUsersByQuery (negative)", () => {
  it("returns no rows when nothing matches", () => {
    expect(filterUsersByQuery(sampleRows, "zzz")).toEqual([]);
    expect(filterUsersByQuery(sampleRows, "not-in-data")).toEqual([]);
  });
});

describe("normalizeUsersResponse (negative)", () => {
  it("returns empty array for nullish or non-list payloads", () => {
    expect(normalizeUsersResponse(null)).toEqual([]);
    expect(normalizeUsersResponse(undefined)).toEqual([]);
    expect(normalizeUsersResponse({ data: "nope" })).toEqual([]);
    expect(normalizeUsersResponse({})).toEqual([]);
    expect(normalizeUsersResponse("string")).toEqual([]);
  });

  it("skips non-object entries in arrays", () => {
    const rows = normalizeUsersResponse([
      null,
      { id: "1", username: "a", email: "a@a.com", organization: "o" },
      "bad",
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("1");
  });
});

describe("readNumericTotal (negative)", () => {
  it("returns null when no usable total exists", () => {
    expect(readNumericTotal({})).toBeNull();
    expect(readNumericTotal({ total: NaN })).toBeNull();
    expect(readNumericTotal({ total: "12a" })).toBeNull();
  });

  it("rejects negative numbers", () => {
    expect(readNumericTotal({ total: -1 })).toBeNull();
    expect(readNumericTotal({ total: -5 })).toBeNull();
  });
});

describe("paginateLocal (negative / edge)", () => {
  const rows = sampleRows;

  it("handles empty rows", () => {
    const { items, total } = paginateLocal([], 5, 10);
    expect(total).toBe(0);
    expect(items).toEqual([]);
  });

  it("clamps page below 1 to page 1", () => {
    const { items } = paginateLocal(rows, 0, 10);
    expect(items).toEqual(rows);
  });
});

describe("normalizeUserDetailResponse (negative)", () => {
  it("returns undefined without valid object profile", () => {
    expect(normalizeUserDetailResponse(null, "1")).toBeUndefined();
    expect(normalizeUserDetailResponse(undefined, "1")).toBeUndefined();
    expect(normalizeUserDetailResponse("x", "1")).toBeUndefined();
    expect(
      normalizeUserDetailResponse(
        { id: "1", username: "u", email: "e", organization: "o", profile: null },
        "1",
      ),
    ).toBeUndefined();
    expect(
      normalizeUserDetailResponse(
        { id: "1", username: "u", email: "e", organization: "o" },
        "1",
      ),
    ).toBeUndefined();
  });
});
