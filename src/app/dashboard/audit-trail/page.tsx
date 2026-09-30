"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Search, Filter } from "lucide-react";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.auditLogs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const match =
        log.action?.toLowerCase().includes(q) ||
        log.resource?.toLowerCase().includes(q) ||
        log.admin?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="border-b border-[#30363d] pb-3 font-mono">
        <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#238636]" />
          <span>AUDIT LOG</span>
        </h1>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Dense administrative activity log & governance records
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-2.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
          <input
            type="text"
            placeholder="Search by actor, action, resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-[#c9d1d9] outline-none"
          />
        </div>

        <div className="text-[11px] text-[#8b949e]">
          Append-only governance trail ({filtered.length} entries)
        </div>
      </div>

      {/* Dense Audit Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d] uppercase text-[10px]">
              <tr>
                <th className="px-3.5 py-2">TIME</th>
                <th className="px-3.5 py-2">ACTOR</th>
                <th className="px-3.5 py-2">SERVER</th>
                <th className="px-3.5 py-2">ACTION</th>
                <th className="px-3.5 py-2">RESOURCE</th>
                <th className="px-3.5 py-2">RESULT</th>
                <th className="px-3.5 py-2">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] text-[#c9d1d9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#8b949e]">
                    Loading Audit Records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#8b949e]">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#21262d] transition">
                    <td className="px-3.5 py-2 text-[#8b949e] whitespace-nowrap">
                      {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="px-3.5 py-2 text-[#f0f6fc] font-semibold">
                      @{log.admin?.name || log.admin?.email || "rithesh"}
                    </td>
                    <td className="px-3.5 py-2 text-[#8b949e]">Acme Developers</td>
                    <td className="px-3.5 py-2 text-[#5865f2] font-semibold">{log.action}</td>
                    <td className="px-3.5 py-2 text-[#c9d1d9]">{log.resource}</td>
                    <td className="px-3.5 py-2 text-[#238636] font-semibold">Success</td>
                    <td className="px-3.5 py-2 text-[#8b949e]">10.2.4.12</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
