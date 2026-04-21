/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import type { UserDetailData } from "@/types/users";
import { readUserDetailFromStorage, writeUserDetailToStorage } from "./userDetailStorage";

const minimalDetail = {
  id: "user-1",
  organization: "Org",
  username: "u",
  email: "e@e.com",
  phone: "1",
  dateJoined: "d",
  status: "active" as const,
  profile: { anyKey: "v" },
} as unknown as UserDetailData;

describe("userDetailStorage (positive)", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a valid user detail", () => {
    writeUserDetailToStorage(minimalDetail);
    const read = readUserDetailFromStorage("user-1");
    expect(read).not.toBeNull();
    expect(read!.id).toBe("user-1");
    expect(read!.profile).toEqual({ anyKey: "v" });
  });
});
