"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, LogOut, Play, Server, ChevronDown, Check, Radio, Terminal, Shield } from "lucide-react";

interface HeaderProps {
  onOpenSimulator: () => void;
  onOpenCommandPalette: () => void;
  sseConnected: boolean;
  selectedServerId: string;
  onServerSelect: (serverId: string) => void;
  servers: Array<{ id: string; name: string; discordGuildId: string }>;
}

export default function Header({
  onOpenSimulator,
  onOpenCommandPalette,
  sseConnected,
  selectedServerId,
  onServerSelect,
  servers,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const getPageTitle = () => {
    if (pathname.includes("/live-stream")) return "Live Stream";
    if (pathname.includes("/commands")) return "Commands Catalog";
    if (pathname.includes("/rules")) return "Rules Engine";
    if (pathname.includes("/servers")) return "Servers & Tenants";
    if (pathname.includes("/failures")) return "Failures & Retries";
    if (pathname.includes("/audit-trail")) return "Audit Log";
    if (pathname.includes("/ai-insights")) return "Command Intelligence";
    if (pathname.includes("/health")) return "System Health";
    return "Overview";
  };

  const selectedServer = servers.find((s) => s.id === selectedServerId) || {
    name: "Acme Developers",
  };

  return (
    <header className="h-12 bg-[#0f172a] border-b border-[#1e293b] px-4 flex items-center justify-between sticky top-0 z-30 font-sans text-xs select-none">
      {/* Left: Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-[#f8fafc] font-semibold">
          <div className="w-5 h-5 rounded-md bg-[#5865f2] text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-sm">
            CO
          </div>
          <span className="font-mono text-xs text-[#f8fafc]">
            {selectedServerId === "ALL" ? "Acme Developers" : selectedServer.name}
          </span>
        </div>
        <span className="text-[#64748b] font-mono">/</span>
        <span className="font-mono text-[#94a3b8]">CommandOps</span>
        <span className="text-[#64748b] font-mono">/</span>
        <span className="font-mono text-[#5865f2] font-semibold">{getPageTitle()}</span>

        {/* Environment Tag */}
        <div className="ml-3 hidden lg:flex items-center gap-1.5 bg-[#090d16] border border-[#1e293b] rounded px-2 py-0.5 text-[10px] font-mono text-[#94a3b8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span>Production</span>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2.5">
        {/* Server Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedServerId}
            onChange={(e) => onServerSelect(e.target.value)}
            className="bg-[#090d16] text-[#f8fafc] border border-[#1e293b] rounded px-2.5 py-1 text-xs font-mono outline-none cursor-pointer hover:border-[#334155] transition"
          >
            <option value="ALL">● Acme Developers (Prod)</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                ● {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Global Search ⌘K */}
        <button
          onClick={onOpenCommandPalette}
          className="bg-[#090d16] hover:bg-[#1e293b] border border-[#1e293b] rounded px-2.5 py-1 text-xs font-mono text-[#94a3b8] hover:text-[#f8fafc] transition flex items-center gap-2 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#64748b]" />
          <span>⌘K Search</span>
        </button>

        {/* System Health Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#090d16] border border-[#1e293b] rounded text-[11px] font-mono text-[#10b981]">
          <span className={`w-2 h-2 rounded-full ${sseConnected ? "bg-[#10b981] animate-pulse" : "bg-[#f59e0b]"}`} />
          <span>{sseConnected ? "All Systems Operational" : "Polling Mode"}</span>
        </div>

        {/* Command Simulator Trigger */}
        <button
          onClick={onOpenSimulator}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-mono font-medium text-xs px-2.5 py-1 rounded transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Run Simulator</span>
        </button>

        {/* Admin Profile / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1e293b]">
          <div
            className="w-6 h-6 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[10px] font-mono text-[#f8fafc] font-bold cursor-default"
            title="Logged in as @admin (admin@commandops.io)"
          >
            AD
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1 hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#ef4444] rounded transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
