import {
  buildUserDetailData,
  getMockUserRowById,
  getMockUserRows,
} from "@/data/mockUsersSeed";
import type { UserDetailData, UserRow } from "@/types/users";

/** First six curated rows from the 500-record mock dataset (same ids as the design reference). */
export const MOCK_USERS: UserRow[] = getMockUserRows().slice(0, 6);

export function getUserDetail(id: string): UserDetailData | undefined {
  const row = getMockUserRowById(id);
  if (!row) return undefined;
  return buildUserDetailData(row);
}

export function getUserRow(id: string): UserRow | undefined {
  return getMockUserRowById(id);
}
