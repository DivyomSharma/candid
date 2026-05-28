import { describe, expect, it } from "vitest";
import { publicIdentityFromProfile } from "@/lib/candor/identity";
import { normalizeCandorPersonalProfile } from "@/lib/candor/personal-profile";

describe("candor profile identity", () => {
  it("normalizes editor payloads that use camelCase keys", () => {
    const profile = normalizeCandorPersonalProfile({
      username: "New.Name",
      displayName: "  Ada  Lovelace ",
      dob: "1990-12-31",
      genderIdentity: " woman ",
      city: " London ",
      relationshipPreference: " long term ",
    });

    expect(profile).toEqual({
      username: "new.name",
      displayName: "Ada Lovelace",
      dob: "1990-12-31",
      genderIdentity: "woman",
      city: "London",
      relationshipPreference: "long term",
    });
  });

  it("derives public identity from the saved candor profile first", () => {
    expect(
      publicIdentityFromProfile({
        username: "new.name",
        display_name: "Ada Lovelace",
      }),
    ).toEqual({
      username: "Ada Lovelace",
      handle: "@new.name",
    });
  });
});
