import { describe, expect, it } from "vitest";
import { publicIdentityFromProfile } from "@/lib/candid/identity";
import { normalizeCandidPersonalProfile } from "@/lib/candid/personal-profile";

describe("candid profile identity", () => {
  it("normalizes editor payloads that use camelCase keys", () => {
    const profile = normalizeCandidPersonalProfile({
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
      shortBio: null,
      occupation: null,
      education: null,
    });
  });

  it("derives public identity from the saved candid profile first", () => {
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
