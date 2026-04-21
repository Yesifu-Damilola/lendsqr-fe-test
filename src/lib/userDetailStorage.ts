import type { UserDetailData } from "@/types/users";

const STORAGE_KEY_PREFIX = "lendsqr:user-detail:";

function isUserDetailData(value: unknown): value is UserDetailData {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    o.profile !== null &&
    typeof o.profile === "object"
  );
}

export function readUserDetailFromStorage(id: string): UserDetailData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + id);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isUserDetailData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeUserDetailToStorage(detail: UserDetailData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY_PREFIX + detail.id,
      JSON.stringify(detail),
    );
  } catch {
    // Quota or private mode — ignore
  }
}
