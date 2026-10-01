"use client";

import { useState, useEffect } from "react";
import { HeartPulse, RefreshCw } from "lucide-react";

interface HealthCheckData {
  status: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: string;
    application: string;
    discordGateway: string;
    aiProvider: string;
    notificationMirror: string;
  };
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const healthServices = health
    ? [
        {
          service: "PostgreSQL Database",
          status: health.checks.database,
          isHealthy: health.checks.database === "Healthy",
        },
        {
          service: "CommandOps Application",
          status: health.checks.application,
          isHealthy: health.checks.application === "Healthy",
        },
        {
          service: "Discord Public Key Configuration",
          status: health.checks.discordGateway,
          isHealthy: health.checks.discordGateway === "Configured",
        },
        {
          service: "AI Triage Provider",
          status: health.checks.aiProvider,
          isHealthy: health.checks.aiProvider.startsWith("Configured"),
        },
        {
          service: "Webhook Mirror Delivery",
          status: health.checks.notificationMirror,
          isHealthy: health.checks.notificationMirror === "Configured",
        },
      ]
    : [];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3 font-mono">
        <div>
          <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#238636]" />
            <span>SYSTEM HEALTH & DEPLOYMENT DIAGNOSTICS</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Infrastructure verification checks fetched live from backend probe endpoints
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[#c9d1d9] font-mono transition text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Probes</span>
        </button>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden font-mono text-xs">
        <div className="p-3 bg-[#0d1117] border-b border-[#30363d] font-bold uppercase text-[10px] text-[#8b949e] flex justify-between">
          <span>COMPONENT NAME</span>
          <span>SYSTEM VERIFICATION STATE</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[#8b949e] flex flex-col items-center justify-center gap-2 font-mono">
            <div className="w-5 h-5 border-2 border-[#238636] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#8b949e]">Probing backend system health & infrastructure checks...</span>
          </div>
        ) : (
          <div className="divide-y divide-[#30363d]">
            {healthServices.map((srv) => (
              <div key={srv.service} className="p-3.5 flex items-center justify-between hover:bg-[#21262d] transition">
                <span className="font-bold text-[#f0f6fc]">{srv.service}</span>
                <div className="flex items-center gap-2 font-semibold">
                  <span className={`flex items-center gap-1.5 ${srv.isHealthy ? "text-[#238636]" : "text-[#d29922]"}`}>
                    <span className={`w-2 h-2 rounded-full ${srv.isHealthy ? "bg-[#238636]" : "bg-[#d29922]"}`} />
                    {srv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
