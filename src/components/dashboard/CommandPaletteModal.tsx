"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Terminal, Server, ShieldCheck, AlertOctagon, HeartPulse, Sliders, Radio, X } from "lucide-react";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator: () => void;
}

export default function CommandPaletteModal({ isOpen, onClose, onOpenSimulator }: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { label: "Run Command Simulator", type: "Action", icon: Terminal, action: () => { onClose(); onOpenSimulator(); } },
    { label: "/status — Service & Bot Health Check", type: "Command", icon: Terminal, action: () => { onClose(); router.push("/dashboard/commands"); } },
    { label: "/report — Submit Operational Report", type: "Command", icon: Terminal, action: () => { onClose(); router.push("/dashboard/commands"); } },
    { label: "Acme Developers Cluster", type: "Server", icon: Server, action: () => { onClose(); router.push("/dashboard/servers"); } },
    { label: "Production Discord Guild", type: "Server", icon: Server, action: () => { onClose(); router.push("/dashboard/servers"); } },
    { label: "Live Command Stream", type: "View", icon: Radio, action: () => { onClose(); router.push("/dashboard/live-stream"); } },
    { label: "Configurable Rules Engine", type: "View", icon: Sliders, action: () => { onClose(); router.push("/dashboard/rules"); } },
    { label: "Failure Center & Manual Retries", type: "View", icon: AlertOctagon, action: () => { onClose(); router.push("/dashboard/failures"); } },
    { label: "Immutable System Audit Trail", type: "View", icon: ShieldCheck, action: () => { onClose(); router.push("/dashboard/audit-trail"); } },
    { label: "System Health & Diagnostic Matrix", type: "View", icon: HeartPulse, action: () => { onClose(); router.push("/dashboard/health"); } },
  ];

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-xl shadow-2xl overflow-hidden font-sans text-xs text-[#c9d1d9]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#30363d] flex items-center gap-2 bg-[#0d1117]">
          <Search className="w-4 h-4 text-[#8b949e] shrink-0" />
          <input
            type="text"
            placeholder="Search commands, servers, channels, executions, audit logs... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[#f0f6fc] placeholder-[#8b949e] outline-none font-mono"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[#8b949e] font-mono">
              No matching commands or operations found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-[#21262d] flex items-center justify-between transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#8b949e] group-hover:text-[#5865f2] transition shrink-0" />
                    <span className="font-mono text-[#f0f6fc]">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
                    {item.type}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-[#30363d] bg-[#0d1117] text-[10px] font-mono text-[#8b949e] flex justify-between items-center">
          <span>Use <kbd className="text-[#c9d1d9] bg-[#21262d] px-1 rounded">↑</kbd> <kbd className="text-[#c9d1d9] bg-[#21262d] px-1 rounded">↓</kbd> to navigate</span>
          <span>CommandOps Console ⌘K</span>
        </div>
      </div>
    </div>
  );
}
