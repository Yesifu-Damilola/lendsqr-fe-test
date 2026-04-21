/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { readUserDetailFromStorage } from "./userDetailStorage";

describe("userDetailStorage (negative)", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns null when key is missing", () => {
    expect(readUserDetailFromStorage("missing")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    window.localStorage.setItem("lendsqr:user-detail:bad", "{not json");
    expect(readUserDetailFromStorage("bad")).toBeNull();
  });

  it("returns null when shape is not UserDetailData", () => {
    window.localStorage.setItem(
      "lendsqr:user-detail:noid",
      JSON.stringify({ profile: {} }),
    );
    expect(readUserDetailFromStorage("noid")).toBeNull();

    window.localStorage.setItem(
      "lendsqr:user-detail:badprofile",
      JSON.stringify({ id: "x", profile: null }),
    );
    expect(readUserDetailFromStorage("badprofile")).toBeNull();

    window.localStorage.setItem(
      "lendsqr:user-detail:badid",
      JSON.stringify({ id: 99, profile: {} }),
    );
    expect(readUserDetailFromStorage("badid")).toBeNull();
  });
});
