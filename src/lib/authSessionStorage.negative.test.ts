/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import type { LoginResponse } from "@/types/auth";
import {
  loginResponseToSession,
  profileFromSession,
  readAuthSessionFromStorage,
} from "@/lib/authSessionStorage";

describe("authSessionStorage (negative)", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  describe("readAuthSessionFromStorage", () => {
    it("returns null when storage is empty", () => {
      expect(readAuthSessionFromStorage()).toBeNull();
    });

    it("returns null for invalid JSON", () => {
      window.localStorage.setItem("lendsqr:auth-session", "{");
      expect(readAuthSessionFromStorage()).toBeNull();
    });

    it("returns null when shape is not AuthSession", () => {
      window.localStorage.setItem("lendsqr:auth-session", JSON.stringify({ token: 1 }));
      expect(readAuthSessionFromStorage()).toBeNull();

      window.localStorage.setItem(
        "lendsqr:auth-session",
        JSON.stringify({ token: "t", user: "not-object" }),
      );
      expect(readAuthSessionFromStorage()).toBeNull();

      window.localStorage.setItem(
        "lendsqr:auth-session",
        JSON.stringify({ token: "t", user: { name: "x" } }),
      );
      expect(readAuthSessionFromStorage()).toBeNull();
    });
  });

  describe("loginResponseToSession", () => {
    it("still produces session when user object is missing (uses fallback)", () => {
      const data = { token: "only-token" } as LoginResponse;
      const s = loginResponseToSession(data, "only@fallback.com");
      expect(s.token).toBe("only-token");
      expect(s.user.email).toBe("only@fallback.com");
    });
  });

  describe("profileFromSession", () => {
    it("returns safe defaults when session is null", () => {
      expect(profileFromSession(null)).toEqual({ displayName: "Account", initials: "?" });
    });

    it("returns defaults when user has no usable name or email", () => {
      expect(
        profileFromSession({ token: "t", user: { email: "", name: undefined } }),
      ).toEqual({ displayName: "Account", initials: "?" });
    });
  });
});
