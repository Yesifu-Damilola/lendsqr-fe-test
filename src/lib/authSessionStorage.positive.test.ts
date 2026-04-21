/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import type { LoginResponse } from "@/types/auth";
import {
  loginResponseToSession,
  profileFromSession,
  readAuthSessionFromStorage,
  writeAuthSessionFromStorage,
} from "@/lib/authSessionStorage";

describe("authSessionStorage (positive)", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  describe("storage round-trip", () => {
    it("writes and reads a valid session", () => {
      const session = {
        token: "t1",
        user: { email: "a@b.com", name: "Ada Lovelace" },
      };
      writeAuthSessionFromStorage(session);
      expect(readAuthSessionFromStorage()).toEqual(session);
    });
  });

  describe("loginResponseToSession", () => {
    it("maps API payload with user email and name", () => {
      const data: LoginResponse = {
        token: "tok",
        user: { email: " u@x.com ", name: "  Sam  " },
      };
      const s = loginResponseToSession(data, "fallback@x.com");
      expect(s.token).toBe("tok");
      expect(s.user.email).toBe("u@x.com");
      expect(s.user.name).toBe("  Sam  ");
    });

    it("uses trimmed fallback email when API omits user email", () => {
      const data = {
        token: "tok",
        user: { name: "Only Name" },
      } as LoginResponse;
      const s = loginResponseToSession(data, "  fb@y.com  ");
      expect(s.user.email).toBe("fb@y.com");
    });
  });

  describe("profileFromSession", () => {
    it("prefers display name and initials from user name", () => {
      expect(
        profileFromSession({
          token: "t",
          user: { email: "e@e.com", name: "Ada Lovelace" },
        }),
      ).toEqual({ displayName: "Ada Lovelace", initials: "AL" });
    });

    it("derives display name and initials from email when name absent", () => {
      expect(
        profileFromSession({
          token: "t",
          user: { email: "sam.carter@sgc.mil" },
        }),
      ).toEqual({ displayName: "sam.carter", initials: "SA" });
    });
  });
});
