"use client";

import { useState, useEffect } from "react";
import { Radio, ArrowUpRight, Check, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import CommandDetailDrawer from "@/components/dashboard/CommandDetailDrawer";

export default function OverviewDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<any>(null);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/dashboard/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-[#8b949e] flex items-center justify-center gap-2">
        <span className="w-3 h-3 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
        <span>Loading operational telemetry...</span>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalExecutions: 1284,
    successfulExecutions: 1241,
    failedExecutions: 23,
    activeServers: 8,
    avgLatencyMs: 184,
  };

  const recentExecutions = data?.recentExecutions || [];

  return (
    <div className="space-y-5 font-sans text-xs">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-3">
        <h1 className="text-base font-bold text-[#f0f6fc] font-mono tracking-tight">
          Good morning, Admin
        </h1>
        <p className="text-xs text-[#8b949e] font-mono mt-0.5">
          CommandOps operations overview & active execution stream
        </p>
      </div>

      {/* Compact Engineering Metrics Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-3 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-6 divide-x divide-[#30363d]">
          <div className="pr-6">
            <span className="text-[10px] text-[#8b949e] uppercase block">Commands</span>
            <span className="text-base font-bold text-[#f0f6fc]">{metrics.totalExecutions}</span>
          </div>
          <div className="px-6">
            <span className="text-[10px] text-[#8b949e] uppercase block">Successful</span>
            <span className="text-base font-bold text-[#238636]">{metrics.successfulExecutions}</span>
          </div>
          <div className="px-6">
            <span className="text-[10px] text-[#8b949e] uppercase block">Failed</span>
            <span className="text-base font-bold text-[#f85149]">{metrics.failedExecutions}</span>
          </div>
          <div className="px-6">
            <span className="text-[10px] text-[#8b949e] uppercase block">Servers</span>
            <span className="text-base font-bold text-[#c9d1d9]">{metrics.activeServers}</span>
          </div>
          <div className="pl-6">
            <span className="text-[10px] text-[#8b949e] uppercase block">Avg Response</span>
            <span className="text-base font-bold text-[#388bfd]">{metrics.avgLatencyMs}ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#238636]">
          <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
          <span>Gateway Active</span>
        </div>
      </div>

      {/* Recent Command Activity Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
        <div className="p-3 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#238636]" />
            <h2 className="font-mono text-xs font-bold uppercase text-[#f0f6fc]">
              Recent Command Activity
            </h2>
          </div>
          <Link
            href="/dashboard/live-stream"
            className="text-[11px] font-mono text-[#5865f2] hover:underline flex items-center gap-1"
          >
            <span>Live Stream</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d] uppercase text-[10px]">
              <tr>
                <th className="px-3.5 py-2">TIME</th>
                <th className="px-3.5 py-2">COMMAND</th>
                <th className="px-3.5 py-2">USER</th>
                <th className="px-3.5 py-2">SERVER</th>
                <th className="px-3.5 py-2">RESULT</th>
                <th className="px-3.5 py-2 text-right">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] text-[#c9d1d9]">
              {recentExecutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-[#8b949e]">
                    No command executions recorded yet. Click &ldquo;Simulator&rdquo; to send a test command!
                  </td>
                </tr>
              ) : (
                recentExecutions.map((exec: any) => (
                  <tr
                    key={exec.id || exec.correlationId}
                    onClick={() => setSelectedExecution(exec)}
                    className="hover:bg-[#21262d] cursor-pointer transition"
                  >
                    <td className="px-3.5 py-2 text-[#8b949e]">
                      {new Date(exec.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-[#f0f6fc]">
                      /{exec.commandName}
                    </td>
                    <td className="px-3.5 py-2 text-[#8b949e]">
                      <span className="text-[#c9d1d9]">@{exec.username}</span>
                    </td>
                    <td className="px-3.5 py-2 text-[#8b949e]">
                      {exec.server?.name || "Acme Developers"}
                    </td>
                    <td className="px-3.5 py-2 font-semibold">
                      {exec.status === "FAILED" ? (
                        <span className="text-[#f85149] flex items-center gap-1">
                          ✕ Failed
                        </span>
                      ) : exec.status === "DEGRADED" ? (
                        <span className="text-[#d29922] flex items-center gap-1">
                          ⚠ {exec.executionTimeMs || 423}ms
                        </span>
                      ) : (
                        <span className="text-[#238636] flex items-center gap-1">
                          ✓ {exec.executionTimeMs || 182}ms
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 text-right text-[#5865f2]">
                      Drawer &rarr;
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CommandDetailDrawer
        execution={selectedExecution}
        onClose={() => setSelectedExecution(null)}
      />
    </div>
  );
}
