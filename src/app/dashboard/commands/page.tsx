"use client";

import { Terminal } from "lucide-react";

export default function CommandsCatalogPage() {
  const commands = [
    {
      name: "status",
      description: "Check service and bot health telemetry",
      scope: "All",
      usage: "4,821",
      successRate: "99.8%",
      avgResponse: "182ms",
      status: "Active",
      type: "Fast Path (<50ms)",
      parameters: ["None"],
    },
    {
      name: "report",
      description: "Generate operational incident/bug report",
      scope: "Production",
      usage: "2,183",
      successRate: "98.4%",
      avgResponse: "1.2s",
      status: "Active",
      type: "Interactive Modal Flow",
      parameters: ["Title", "Description", "Severity (LOW|MED|HIGH|CRITICAL)", "Category"],
    },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="border-b border-[#30363d] pb-3">
        <h1 className="text-base font-bold font-mono text-[#f0f6fc] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#388bfd]" />
          <span>COMMANDS CATALOG</span>
        </h1>
        <p className="text-xs text-[#8b949e] font-mono mt-0.5">
          Registered Discord Application Commands & developer tooling definitions
        </p>
      </div>

      <div className="space-y-3 font-mono">
        {commands.map((cmd) => (
          <div
            key={cmd.name}
            className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3 hover:border-[#8b949e] transition"
          >
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#f0f6fc]">/{cmd.name}</span>
                <span className="text-[11px] text-[#8b949e]">{cmd.description}</span>
              </div>
              <span className="text-[10px] text-[#238636] font-semibold flex items-center gap-1">
                ● {cmd.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#8b949e] bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
              <div>
                Server Scope: <span className="text-[#c9d1d9] font-bold">{cmd.scope}</span>
              </div>
              <div>
                Usage: <span className="text-[#c9d1d9] font-bold">{cmd.usage}</span>
              </div>
              <div>
                Success Rate: <span className="text-[#238636] font-bold">{cmd.successRate}</span>
              </div>
              <div>
                Avg Response: <span className="text-[#388bfd] font-bold">{cmd.avgResponse}</span>
              </div>
              <div>
                Pipeline: <span className="text-[#c9d1d9]">{cmd.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
              <span>Parameters:</span>
              {cmd.parameters.map((p) => (
                <span key={p} className="px-2 py-0.5 bg-[#21262d] text-[#c9d1d9] rounded border border-[#30363d]">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
