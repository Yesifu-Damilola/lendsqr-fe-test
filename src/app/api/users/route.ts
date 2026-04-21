import { NextResponse, type NextRequest } from "next/server";
import { getMockUserRows } from "@/data/mockUsersSeed";
import type { UserRow } from "@/types/users";

function filterByQuery(rows: UserRow[], rawQuery: string): UserRow[] {
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

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(
    500,
    Math.max(1, Number(searchParams.get("limit") ?? 100) || 100),
  );
  const query = searchParams.get("query") ?? "";

  const all = getMockUserRows();
  const filtered = filterByQuery(all, query);
  const total = filtered.length;
  const start = (page - 1) * limit;
  const users = filtered.slice(start, start + limit);

  return NextResponse.json({ users, total });
}
