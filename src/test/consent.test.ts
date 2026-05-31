import { describe, it, expect, beforeEach } from "vitest";
import { hasSessionConsent, rememberSessionConsent } from "@/components/AiAuditConsentModal";

describe("AI consent session helpers (X8)", () => {
  beforeEach(() => sessionStorage.clear());

  it("returns false when no consent stored", () => {
    expect(hasSessionConsent("audit")).toBe(false);
    expect(hasSessionConsent("apply")).toBe(false);
  });

  it("persists audit consent independently from apply consent", () => {
    rememberSessionConsent("audit");
    expect(hasSessionConsent("audit")).toBe(true);
    expect(hasSessionConsent("apply")).toBe(false);
  });

  it("persists apply consent independently from audit consent", () => {
    rememberSessionConsent("apply");
    expect(hasSessionConsent("apply")).toBe(true);
    expect(hasSessionConsent("audit")).toBe(false);
  });
});
