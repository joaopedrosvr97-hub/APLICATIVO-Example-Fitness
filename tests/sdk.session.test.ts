import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("sdk session validation", () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalAppId = process.env.EXPO_PUBLIC_APP_ID;

  beforeEach(() => {
    vi.resetModules();
    process.env.JWT_SECRET = "test-secret";
    process.env.EXPO_PUBLIC_APP_ID = "f3fitness-test";
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.EXPO_PUBLIC_APP_ID = originalAppId;
  });

  it("rejects a session token issued for a different appId", async () => {
    vi.doMock("../server/db", () => ({
      getUserById: vi.fn(),
    }));

    const { sdk } = await import("../server/_core/sdk");

    const mismatchedToken = await sdk.signSession({
      userId: 1,
      appId: "other-app",
      name: "Sample User",
    });

    const session = await sdk.verifySession(mismatchedToken);

    expect(session).toBeNull();
  });
});
