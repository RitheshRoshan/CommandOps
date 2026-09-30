"use client";

import { useState, useEffect } from "react";
import { Radio, Search, Terminal, Check, AlertTriangle, X } from "lucide-react";
import CommandDetailDrawer from "@/components/dashboard/CommandDetailDrawer";

export default function LiveStreamPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [filterCommand, setFilterCommand] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExecution, setSelectedExecution] = useState<any>(null);

  const fetchExecutions = async () => {
    try {
      const res = await fetch("/api/commands");
      if (res.ok) {
        const json = await res.json();
        setExecutions(json.executions || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 2500);
    return () => clearInterval(interval);
  }, []);

  const filtered = executions.filter((item) => {
    if (filterCommand !== "ALL" && item.commandName !== filterCommand) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const match =
        item.correlationId?.toLowerCase().includes(q) ||
        item.username?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
        <div>
          <h1 className="text-base font-bold font-mono text-[#f0f6fc] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#238636] animate-pulse" />
            <span>LIVE COMMAND STREAM</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-0.5">
            Discord activity feed + Sentry interaction stream
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-2.5 flex items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
          <input
            type="text"
            placeholder="Filter by @user, /command, correlation_id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-[#c9d1d9] placeholder-[#8b949e] outline-none"
          />
        </div>

        <select
          value={filterCommand}
          onChange={(e) => setFilterCommand(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded px-2.5 py-1 text-xs outline-none cursor-pointer"
        >
          <option value="ALL">All Commands</option>
          <option value="report">/report</option>
          <option value="status">/status</option>
        </select>
      </div>

      {/* Event Stream Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d] uppercase text-[10px]">
              <tr>
                <th className="px-3.5 py-2">TIME</th>
                <th className="px-3.5 py-2">COMMAND</th>
                <th className="px-3.5 py-2">USER</th>
                <th className="px-3.5 py-2">SERVER</th>
                <th className="px-3.5 py-2">CHANNEL</th>
                <th className="px-3.5 py-2">DURATION</th>
                <th className="px-3.5 py-2 text-right">RESULT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] text-[#c9d1d9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#8b949e]">
                    No live command executions recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id || item.correlationId}
                    onClick={() => setSelectedExecution(item)}
                    className="hover:bg-[#21262d] cursor-pointer transition"
                  >
                    <td className="px-3.5 py-2 text-[#8b949e] whitespace-nowrap">
                      ● {new Date(item.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-[#f0f6fc]">
                      /{item.commandName}
                    </td>
                    <td className="px-3.5 py-2 text-[#c9d1d9] flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/30 flex items-center justify-center text-[9px] font-bold">
                        {item.username?.slice(0, 1).toUpperCase() || "U"}
                      </div>
                      <span>@{item.username}</span>
                    </td>
                    <td className="px-3.5 py-2 text-[#8b949e]">
                      {item.server?.name || "Acme Developers"}
                    </td>
                    <td className="px-3.5 py-2 text-[#8b949e]">
                      #{item.commandName === "report" ? "operations" : "general"}
                    </td>
                    <td className="px-3.5 py-2 text-[#8b949e]">
                      {item.executionTimeMs || 182}ms
                    </td>
                    <td className="px-3.5 py-2 text-right font-semibold">
                      {item.status === "FAILED" ? (
                        <span className="text-[#f85149]">✕ failed</span>
                      ) : item.status === "DEGRADED" ? (
                        <span className="text-[#d29922]">⚠ warning</span>
                      ) : (
                        <span className="text-[#238636]">✓ success</span>
                      )}
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
