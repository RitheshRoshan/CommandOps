"use client";

import { useEffect, useState } from "react";
import { Terminal, RefreshCw } from "lucide-react";

interface CommandCatalogItem {
  command: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageResponseTime: number;
  lastExecution: string | null;
  serverCount: number;
}

export default function CommandsCatalogPage() {
  const [commands, setCommands] = useState<CommandCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commands/catalog");
      if (res.ok) {
        const data = await res.json();
        setCommands(data.commands || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
        <div>
          <h1 className="text-base font-bold font-mono text-[#f0f6fc] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#388bfd]" />
            <span>COMMANDS CATALOG</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-0.5">
            Real-time Discord command performance metrics calculated live from backend database executions
          </p>
        </div>
        <button
          onClick={fetchCatalog}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[#c9d1d9] font-mono transition text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#8b949e] font-mono border border-[#30363d] rounded-md bg-[#161b22] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#c9d1d9]">Calculating live command performance metrics...</span>
        </div>
      ) : commands.length === 0 ? (
        <div className="p-8 text-center text-[#8b949e] font-mono border border-[#30363d] rounded bg-[#161b22]">
          No executions yet
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          {commands.map((cmd) => (
            <div
              key={cmd.command}
              className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3 hover:border-[#8b949e] transition"
            >
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#f0f6fc]">{cmd.command}</span>
                  <span className="text-[11px] text-[#8b949e]">
                    {cmd.command === "/status"
                      ? "Check service health telemetry"
                      : cmd.command === "/metrics"
                      ? "Real-time latency & throughput performance"
                      : cmd.command === "/incident"
                      ? "Declare high-severity operational emergency"
                      : "Operational incident/bug report"}
                  </span>
                </div>
                <span className="text-[10px] text-[#238636] font-semibold flex items-center gap-1">
                  ● ACTIVE
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#8b949e] bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                <div>
                  Server Count: <span className="text-[#c9d1d9] font-bold">{cmd.serverCount}</span>
                </div>
                <div>
                  Total Executions: <span className="text-[#c9d1d9] font-bold">{cmd.totalExecutions}</span>
                </div>
                <div>
                  Successful: <span className="text-[#238636] font-bold">{cmd.successfulExecutions}</span>
                </div>
                <div>
                  Failed: <span className="text-[#f85149] font-bold">{cmd.failedExecutions}</span>
                </div>
                <div>
                  Success Rate: <span className="text-[#238636] font-bold">{cmd.successRate}%</span>
                </div>
                <div>
                  Avg Lifecycle: <span className="text-[#388bfd] font-bold">{cmd.averageResponseTime >= 1000 ? `${(cmd.averageResponseTime / 1000).toFixed(1)}s` : `${cmd.averageResponseTime}ms`}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8b949e]">
                <span>
                  Last Executed: <span className="text-[#c9d1d9]">{cmd.lastExecution ? new Date(cmd.lastExecution).toLocaleString() : "—"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
