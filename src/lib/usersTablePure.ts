import type { UserDetailData, UserRow } from "@/types/users";

export type UnknownRecord = Record<string, unknown>;

export function replaceIdToken(value: string, id: string): string {
  return value.replace("{id}", id).replace(":id", id);
}

export function toOptionalBool(value: unknown): boolean | undefined {
  if (value === true || value === "true" || value === 1) return true;
  if (value === false || value === "false" || value === 0) return false;
  return undefined;
}

export function toUserStatus(value: unknown): UserRow["status"] {
  if (
    value === "active" ||
    value === "inactive" ||
    value === "pending" ||
    value === "blacklisted"
  ) {
    return value;
  }
  return "inactive";
}

export function toUserRow(item: UnknownRecord, index: number): UserRow {
  const hasLoan = toOptionalBool(
    item.hasLoan ?? item.has_loan ?? item.loanAccount ?? item.loans,
  );
  const hasSavings = toOptionalBool(
    item.hasSavings ?? item.has_savings ?? item.savingsAccount ?? item.savings,
  );
  return {
    id: String(item.id ?? index + 1),
    organization: String(
      item.organization ?? item.orgName ?? item.org ?? "Unknown org",
    ),
    username: String(item.username ?? item.userName ?? item.name ?? "Unknown"),
    email: String(item.email ?? "unknown@example.com"),
    phone: String(item.phone ?? item.phoneNumber ?? "-"),
    dateJoined: String(item.dateJoined ?? item.createdAt ?? "-"),
    status: toUserStatus(item.status),
    ...(hasLoan !== undefined ? { hasLoan } : {}),
    ...(hasSavings !== undefined ? { hasSavings } : {}),
  };
}

export function filterUsersByQuery(rows: UserRow[], rawQuery: string): UserRow[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (u) =>
      u.organization.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q),
  );
}

export function normalizeUsersResponse(payload: unknown): UserRow[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload
      .filter(
        (item): item is UnknownRecord => !!item && typeof item === "object",
      )
      .map(toUserRow);
  }

  if (typeof payload === "object") {
    const record = payload as UnknownRecord;
    const list =
      record.data ?? record.users ?? record.results ?? record.items ?? record.list;
    if (Array.isArray(list)) {
      return list
        .filter(
          (item): item is UnknownRecord => !!item && typeof item === "object",
        )
        .map(toUserRow);
    }
  }

  return [];
}

export function readNumericTotal(record: UnknownRecord): number | null {
  const meta =
    record.meta && typeof record.meta === "object"
      ? (record.meta as UnknownRecord)
      : null;
  const pagination =
    record.pagination && typeof record.pagination === "object"
      ? (record.pagination as UnknownRecord)
      : null;

  const candidates: unknown[] = [
    record.total,
    record.totalCount,
    record.totalItems,
    record.count,
    meta?.total,
    meta?.totalCount,
    pagination?.total,
    pagination?.totalCount,
  ];

  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c) && c >= 0) return c;
    if (typeof c === "string" && /^\d+$/.test(c)) return Number(c);
  }
  return null;
}

/**
 * When the remote list endpoint returns the full dataset (no total metadata),
 * we slice locally using `page` / `pageSize`.
 */
export function paginateLocal(
  rows: UserRow[],
  page: number,
  pageSize: number,
): { items: UserRow[]; total: number } {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total,
  };
}

export function normalizeUserDetailResponse(
  payload: unknown,
  id: string,
): UserDetailData | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const root = payload as UnknownRecord;
  const source = (
    root.data && typeof root.data === "object" ? root.data : root
  ) as UnknownRecord;

  const baseRow = toUserRow(source, Number(id) || 0);
  const profile = source.profile;

  if (!profile || typeof profile !== "object") return undefined;
  return {
    ...baseRow,
    profile: profile as UserDetailData["profile"],
  } satisfies UserDetailData;
}
