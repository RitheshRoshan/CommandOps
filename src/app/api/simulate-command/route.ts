import { NextRequest, NextResponse } from "next/server";
import { DiscordDispatcher } from "@/lib/discord/dispatcher";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { command, title, description, severity, category, username } = body;

  const interactionId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const activeUser = username || "demo_operator";

  if (command === "status") {
    const payload = {
      id: interactionId,
      type: 2,
      guild_id: "demo-guild-99",
      channel_id: "demo-channel-1",
      user: { id: "user-101", username: activeUser },
      data: { name: "status" },
    };

    const result = await DiscordDispatcher.handleInteraction(payload, { awaitBackground: true });
    return NextResponse.json({ success: true, interactionId, result });
  }

  if (command === "report") {
    // Simulate Modal Submission Directly
    const payload = {
      id: interactionId,
      type: 5,
      guild_id: "demo-guild-99",
      channel_id: "demo-channel-1",
      user: { id: "user-101", username: activeUser },
      data: {
        custom_id: "report_modal",
        components: [
          {
            type: 1,
            components: [
              { type: 4, custom_id: "report_title", value: title || "Simulated Checkout Outage" },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "report_desc",
                value: description || "Payment gateway returning 502 errors on UPI transaction endpoint.",
              },
            ],
          },
          {
            type: 1,
            components: [
              { type: 4, custom_id: "report_severity", value: severity || "HIGH" },
            ],
          },
          {
            type: 1,
            components: [
              { type: 4, custom_id: "report_category", value: category || "PAYMENT" },
            ],
          },
        ],
      },
    };

    const result = await DiscordDispatcher.handleInteraction(payload, { awaitBackground: true });
    return NextResponse.json({ success: true, interactionId, result });
  }

  return NextResponse.json({ error: "Unknown command simulation" }, { status: 400 });
}
