import { describe, it, expect } from "vitest";
import { signToken, verifyToken, verifyPassword, hashPassword } from "@/lib/auth";

describe("Authentication & Multi-Server Isolation", () => {
  it("Hashes and verifies admin passwords securely", async () => {
    const password = "secure_production_password_999!";
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hash);
    const isInvalid = await verifyPassword("wrong_password", hash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it("Signs and verifies JWT admin session tokens", async () => {
    const payload = {
      sub: "admin-uuid-101",
      email: "admin@commandops.io",
      name: "SRE Admin",
      role: "ADMIN",
    };

    const token = await signToken(payload);
    expect(token).toBeDefined();

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe("admin-uuid-101");
    expect(verified?.email).toBe("admin@commandops.io");
  });

  it("Rejects malformed or forged JWT session tokens", async () => {
    const forged = await verifyToken("invalid.jwt.token.string");
    expect(forged).toBeNull();
  });
});
