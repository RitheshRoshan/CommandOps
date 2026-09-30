import { describe, it, expect } from "vitest";
import { GET as getHealth } from "@/app/api/health/route.ts";
import { GET as getLiveHealth } from "@/app/api/health/live/route.ts";

describe("Dashboard & Health Monitoring APIs", () => {
  it("GET /api/health returns operational status and component checks", async () => {
    const res = await getHealth();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBeDefined();
    expect(json.checks).toBeDefined();
    expect(json.checks.database).toBeDefined();
    expect(json.checks.discordGateway).toBeDefined();
    expect(json.checks.aiProvider).toBeDefined();
  });

  it("GET /api/health/live returns process liveness probe", async () => {
    const res = await getLiveHealth();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("alive");
    expect(json.uptime).toBeGreaterThan(0);
  });
});
