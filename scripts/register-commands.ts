import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || process.env.DISCORD_APPLICATION_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!BOT_TOKEN || !CLIENT_ID) {
  console.error("❌ Error: DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID must be set in your .env file.");
  process.exit(1);
}

const commands = [
  {
    name: "status",
    description: "Check operational health and processing metrics of CommandOps",
  },
  {
    name: "report",
    description: "Submit an operational report or incident to CommandOps Control Plane",
  },
  {
    name: "metrics",
    description: "View real-time latency percentiles, throughput, and system resource metrics",
  },
  {
    name: "incident",
    description: "Declare a high-severity operational incident to CommandOps SRE triage",
    options: [
      {
        name: "title",
        description: "Short summary of the operational incident",
        type: 3, // STRING
        required: true,
      },
      {
        name: "severity",
        description: "Severity level (CRITICAL, HIGH, MEDIUM)",
        type: 3, // STRING
        required: false,
        choices: [
          { name: "CRITICAL — Total Outage", value: "CRITICAL" },
          { name: "HIGH — Major Impact", value: "HIGH" },
          { name: "MEDIUM — Minor Degradation", value: "MEDIUM" },
        ],
      },
    ],
  },
];

async function registerCommands() {
  const url = GUILD_ID
    ? `https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`
    : `https://discord.com/api/v10/applications/${CLIENT_ID}/commands`;

  const scopeLabel = GUILD_ID ? `Guild (${GUILD_ID})` : "Global Applications";
  console.log(`🚀 Registering ${commands.length} slash commands to Discord ${scopeLabel}...`);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: (BOT_TOKEN || "").startsWith("Bot ") ? (BOT_TOKEN as string) : `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Discord API Error HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log(`✅ Successfully registered ${commands.length} commands with Discord!`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("❌ Failed to register Discord slash commands:", err.message);
    process.exit(1);
  }
}

registerCommands();
