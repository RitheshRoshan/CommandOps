import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().default("dev_secret_key_change_in_production_12345"),
  DISCORD_APPLICATION_ID: z.string().optional(),
  DISCORD_PUBLIC_KEY: z.string().optional(),
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_GUILD_ID: z.string().optional(),
  AI_PROVIDER: z.enum(["gemini", "fallback"]).default("fallback"),
  AI_API_KEY: z.string().optional(),
  DEFAULT_MIRROR_WEBHOOK_URL: z.string().optional(),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Environment validation failed:");
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
    
    if (process.env.NODE_ENV === "production") {
      throw new Error("Application startup failed due to invalid environment variables.");
    }
    return envSchema.parse({});
  }

  return result.data;
}

export const env = validateEnv();
