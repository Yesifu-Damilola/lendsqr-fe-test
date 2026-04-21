import type { LoginResponse } from "@/types/auth";

const STORAGE_KEY = "lendsqr:auth-session";

export type AuthSession = {
  token: string;
  user: {
    email: string;
    name?: string;
  };
};

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  const user = o.user;
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  return typeof o.token === "string" && typeof u.email === "string";
}

export function readAuthSessionFromStorage(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeAuthSessionFromStorage(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Quota or private mode — ignore
  }
}

/** Normalize API payload; use `fallbackEmail` when the API omits `user.email`. */
export function loginResponseToSession(
  data: LoginResponse,
  fallbackEmail: string,
): AuthSession {
  return {
    token: data.token,
    user: {
      email: (data.user?.email ?? fallbackEmail).trim(),
      name: data.user?.name,
    },
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0] + parts[1]![0]).toUpperCase();
  }
  const single = parts[0] ?? "";
  return single.slice(0, 2).toUpperCase() || "?";
}

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.slice(0, 2).toUpperCase() || "?";
}

export function profileFromSession(session: AuthSession | null): {
  displayName: string;
  initials: string;
} {
  if (!session?.user.email && !session?.user.name) {
    return { displayName: "Account", initials: "?" };
  }
  const name = session.user.name?.trim();
  if (name) {
    return { displayName: name, initials: initialsFromName(name) };
  }
  const email = session.user.email.trim();
  const local = email.split("@")[0] ?? email;
  const displayName = local || email || "Account";
  return { displayName, initials: initialsFromEmail(email) };
}
