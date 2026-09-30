"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Settings } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  hash?: boolean;
  icon?: any;
  unread?: boolean;
}

interface NavSection {
  category: string | null;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      category: null,
      items: [{ href: "/dashboard", label: "Overview", icon: Activity }],
    },
    {
      category: "OPERATIONS",
      items: [
        { href: "/dashboard/commands", label: "Commands", hash: true },
        { href: "/dashboard/live-stream", label: "Live Stream", hash: true, unread: true },
        { href: "/dashboard/rules", label: "Rules", hash: true },
        { href: "/dashboard/failures", label: "Failures", hash: true },
      ],
    },
    {
      category: "INFRASTRUCTURE",
      items: [
        { href: "/dashboard/servers", label: "Servers", hash: true },
        { href: "/dashboard/health", label: "System Health", hash: true },
      ],
    },
    {
      category: "GOVERNANCE",
      items: [{ href: "/dashboard/audit-trail", label: "Audit Log", hash: true }],
    },
    {
      category: "INTELLIGENCE",
      items: [{ href: "/dashboard/ai-insights", label: "Command Intelligence", hash: true }],
    },
  ];

  const discordServers = [
    { name: "Acme Developers", active: true, color: "bg-[#5865f2]" },
    { name: "Production", active: false, color: "bg-[#10b981]" },
    { name: "Community", active: false, color: "bg-[#3b82f6]" },
    { name: "Testing", active: false, color: "bg-[#f59e0b]" },
  ];

  return (
    <aside className="w-56 bg-[#090d16] border-r border-[#1e293b] flex flex-col justify-between shrink-0 min-h-[calc(100vh-3rem)] p-3 font-sans text-xs select-none">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-2 px-2 py-1 border-b border-[#1e293b] pb-2.5">
          <div className="w-5 h-5 rounded bg-[#5865f2] text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-sm">
            CO
          </div>
          <span className="font-mono font-bold text-[#f8fafc] tracking-tight text-xs">CommandOps</span>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-3">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {sec.category && (
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 pt-1 font-semibold">
                  {sec.category}
                </div>
              )}
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2 py-1.5 rounded font-mono text-xs transition ${
                      isActive
                        ? "bg-[#1e293b] text-[#f8fafc] font-semibold border-l-2 border-[#5865f2]"
                        : "text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#0f172a]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {item.hash ? (
                        <span className="text-[#64748b] font-mono">#</span>
                      ) : item.icon ? (
                        <item.icon className="w-3.5 h-3.5 text-[#64748b]" />
                      ) : (
                        <span className="text-[#5865f2]">◉</span>
                      )}
                      <span>{item.label}</span>
                    </div>
                    {item.unread && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Discord Servers Section */}
        <div className="pt-2 border-t border-[#1e293b] space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 font-semibold">
            DISCORD SERVERS
          </div>
          <div className="space-y-1">
            {discordServers.map((srv, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  srv.active ? "bg-[#0f172a] text-[#f8fafc] font-medium" : "text-[#94a3b8] hover:text-[#f8fafc]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${srv.color}`} />
                <span className="truncate">{srv.name}</span>
                {srv.active && <span className="ml-auto text-[9px] text-[#10b981]">●</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="pt-2 border-t border-[#1e293b]">
        <Link
          href="/dashboard/health"
          className="flex items-center gap-2 px-2 py-1.5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#0f172a] rounded transition font-mono"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>⚙ Settings</span>
        </Link>
      </div>
    </aside>
  );
}
