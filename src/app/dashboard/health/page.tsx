"use client";

import { useState, useEffect } from "react";
import { HeartPulse } from "lucide-react";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => {});
  }, []);

  const healthServices = [
    { service: "Discord Gateway", status: "Healthy", latency: "82ms", isHealthy: true },
    { service: "Interaction API", status: "Healthy", latency: "41ms", isHealthy: true },
    { service: "PostgreSQL Database", status: "Healthy", latency: "18ms", isHealthy: true },
    { service: "Rule Engine", status: "Healthy", latency: "12ms", isHealthy: true },
    { service: "AI Triage Provider", status: "Degraded", latency: "840ms", isHealthy: false },
    { service: "Webhook Mirror Service", status: "Healthy", latency: "124ms", isHealthy: true },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="border-b border-[#30363d] pb-3 font-mono">
        <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-[#238636]" />
          <span>SYSTEM HEALTH</span>
        </h1>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Infrastructure health status & internal service latency checks
        </p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden font-mono text-xs">
        <div className="p-3 bg-[#0d1117] border-b border-[#30363d] font-bold uppercase text-[10px] text-[#8b949e] flex justify-between">
          <span>SERVICE NAME</span>
          <div className="flex gap-16 pr-4">
            <span>STATUS</span>
            <span>LATENCY</span>
          </div>
        </div>

        <div className="divide-y divide-[#30363d]">
          {healthServices.map((srv) => (
            <div key={srv.service} className="p-3.5 flex items-center justify-between hover:bg-[#21262d] transition">
              <span className="font-bold text-[#f0f6fc]">{srv.service}</span>
              <div className="flex items-center gap-16 font-semibold">
                <span className={`flex items-center gap-1.5 ${srv.isHealthy ? "text-[#238636]" : "text-[#d29922]"}`}>
                  <span className={`w-2 h-2 rounded-full ${srv.isHealthy ? "bg-[#238636]" : "bg-[#d29922]"}`} />
                  {srv.status}
                </span>
                <span className="text-[#8b949e] w-12 text-right">{srv.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
