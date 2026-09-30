export interface LogContext {
  event: string;
  correlationId?: string;
  interactionId?: string;
  command?: string;
  serverId?: string;
  durationMs?: number;
  status?: string;
  error?: string;
  [key: string]: any;
}

function sanitize(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const clone = { ...obj };
  const sensitiveKeys = [
    "token",
    "bot_token",
    "jwt_secret",
    "password",
    "passwordhash",
    "authorization",
    "secret",
    "webhook_url",
  ];
  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      clone[key] = "[REDACTED]";
    } else if (typeof clone[key] === "object") {
      clone[key] = sanitize(clone[key]);
    }
  }
  return clone;
}

export const logger = {
  info: (context: LogContext, message?: string) => {
    const payload = sanitize({
      level: "INFO",
      timestamp: new Date().toISOString(),
      message,
      ...context,
    });
    console.log(JSON.stringify(payload));
  },
  warn: (context: LogContext, message?: string) => {
    const payload = sanitize({
      level: "WARN",
      timestamp: new Date().toISOString(),
      message,
      ...context,
    });
    console.warn(JSON.stringify(payload));
  },
  error: (context: LogContext, message?: string) => {
    const payload = sanitize({
      level: "ERROR",
      timestamp: new Date().toISOString(),
      message,
      ...context,
    });
    console.error(JSON.stringify(payload));
  },
};
