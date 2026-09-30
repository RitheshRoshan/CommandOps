"use client";

import { BrainCircuit, Info } from "lucide-react";

export default function CommandIntelligencePage() {
  const usageTrends = [
    { command: "/status", count: "4,821" },
    { command: "/report", count: "2,183" },
    { command: "/health", count: "1,921" },
  ];

  const performanceMetrics = [
    { command: "/status", p50: "142ms", p95: "381ms", p99: "892ms" },
    { command: "/report", p50: "820ms", p95: "1.8s", p99: "3.2s" },
    { command: "/health", p50: "94ms", p95: "220ms", p99: "481ms" },
  ];

  return (
    <div className="space-y-5 font-sans text-xs">
      <div className="border-b border-[#30363d] pb-3 font-mono">
        <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#5865f2]" />
          <span>COMMAND INTELLIGENCE</span>
        </h1>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Operational usage trends, latency distributions & contextual AI advisory annotations
        </p>
      </div>

      {/* Contextual Advisory Annotation (Requirement 14) */}
      <div className="bg-[#161b22] border border-[#388bfd]/40 rounded-md p-3 flex items-start gap-2.5 font-mono text-xs text-[#c9d1d9]">
        <Info className="w-4 h-4 text-[#388bfd] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#f0f6fc]">Advisory Telemetry Notice:</span> Increased /report webhook latency detected (P95: 1.8s) compared with the previous 24h interval.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {/* Usage Trends */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3">
          <div className="text-xs font-bold uppercase text-[#8b949e] border-b border-[#30363d] pb-2">
            Usage Trends (24h Window)
          </div>
          <div className="divide-y divide-[#30363d]">
            {usageTrends.map((u) => (
              <div key={u.command} className="py-2 flex items-center justify-between">
                <span className="font-bold text-[#f0f6fc]">{u.command}</span>
                <span className="text-[#388bfd] font-bold">{u.count} executions</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latency Percentiles Performance Table */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3">
          <div className="text-xs font-bold uppercase text-[#8b949e] border-b border-[#30363d] pb-2">
            Performance Percentiles
          </div>
          <table className="w-full text-left text-xs">
            <thead className="text-[#8b949e] border-b border-[#30363d] uppercase text-[10px]">
              <tr>
                <th className="py-1">COMMAND</th>
                <th className="py-1">P50</th>
                <th className="py-1">P95</th>
                <th className="py-1">P99</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] text-[#c9d1d9]">
              {performanceMetrics.map((p) => (
                <tr key={p.command}>
                  <td className="py-2 font-bold text-[#f0f6fc]">{p.command}</td>
                  <td className="py-2 text-[#238636] font-semibold">{p.p50}</td>
                  <td className="py-2 text-[#d29922] font-semibold">{p.p95}</td>
                  <td className="py-2 text-[#f85149] font-semibold">{p.p99}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
