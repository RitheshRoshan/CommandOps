"use client";

import { useState, useEffect } from "react";
import { Server, Plus, Check, Trash2, Hash } from "lucide-react";
import ServerConnectModal from "@/components/dashboard/ServerConnectModal";

export default function ServersPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "channels" | "commands">("overview");

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/servers");
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const deleteServer = async (id: string) => {
    try {
      await fetch(`/api/servers/${id}`, { method: "DELETE" });
      fetchServers();
    } catch (e) {}
  };

  const sampleChannels = [
    { name: "operations", commands: 12, executions: "4,291", lastActivity: "2 min ago" },
    { name: "general", commands: 8, executions: "1,842", lastActivity: "14 min ago" },
    { name: "engineering", commands: 6, executions: "982", lastActivity: "1 hour ago" },
    { name: "bot-commands", commands: 15, executions: "5,102", lastActivity: "30 sec ago" },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Active Server Operational Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5865f2] text-white flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#f0f6fc]">Acme Developers</h1>
                <span className="text-[10px] text-[#238636] font-bold">● Bot Online</span>
              </div>
              <div className="text-[11px] text-[#8b949e]">
                3,842 Members • 42 Channels • 18 Commands
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-mono font-medium text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Server</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 text-xs font-mono border-b border-[#30363d] pb-2">
          {(["overview", "channels", "commands"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize transition pb-1 border-b-2 ${
                activeTab === tab
                  ? "border-[#5865f2] text-[#f0f6fc] font-bold"
                  : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: Channels Operations View */}
      {activeTab === "channels" && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden font-mono text-xs">
          <div className="p-3 bg-[#0d1117] border-b border-[#30363d] font-bold uppercase text-[10px] text-[#8b949e]">
            CONFIGURED SERVER CHANNELS
          </div>
          <div className="divide-y divide-[#30363d]">
            {sampleChannels.map((ch) => (
              <div key={ch.name} className="p-3 flex items-center justify-between hover:bg-[#21262d] transition">
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span className="font-bold text-[#f0f6fc]">{ch.name}</span>
                </div>
                <div className="flex items-center gap-6 text-[11px] text-[#8b949e]">
                  <span>Commands: <strong className="text-[#c9d1d9]">{ch.commands}</strong></span>
                  <span>Executions: <strong className="text-[#c9d1d9]">{ch.executions}</strong></span>
                  <span>Last Activity: <strong className="text-[#388bfd]">{ch.lastActivity}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Overview List */}
      {activeTab === "overview" && (
        <div className="space-y-3 font-mono">
          <div className="text-[10px] uppercase text-[#8b949e] font-bold tracking-wider">
            REGISTERED DISCORD SERVERS ({servers.length})
          </div>
          <div className="divide-y divide-[#30363d] bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-[#8b949e]">Loading servers...</div>
            ) : (
              servers.map((srv) => (
                <div key={srv.id} className="p-3 flex items-center justify-between hover:bg-[#21262d] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center font-bold text-xs text-[#f0f6fc]">
                      {srv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[#f0f6fc] text-xs">{srv.name}</div>
                      <div className="text-[10px] text-[#8b949e]">Guild ID: {srv.discordGuildId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-[#8b949e]">
                    <span className="text-[#238636] font-semibold">● Bot Online</span>
                    <button
                      onClick={() => deleteServer(srv.id)}
                      className="p-1 hover:bg-[#f85149]/20 text-[#8b949e] hover:text-[#f85149] rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ServerConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onServerAdded={fetchServers}
      />
    </div>
  );
}
