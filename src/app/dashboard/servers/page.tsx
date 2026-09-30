"use client";

import { useState, useEffect } from "react";
import { Server, Plus, Trash2, Hash, RefreshCw } from "lucide-react";
import ServerConnectModal from "@/components/dashboard/ServerConnectModal";

export default function ServersPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "channels">("overview");

  const fetchServers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/servers");
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
      }
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
    }
  };

  const primaryServer = servers[0] || null;

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Active Server Operational Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5865f2] text-white flex items-center justify-center font-bold text-sm">
              {primaryServer ? primaryServer.name.slice(0, 2).toUpperCase() : "CO"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#f0f6fc]">{primaryServer ? primaryServer.name : "No Server Connected"}</h1>
                <span className="text-[10px] text-[#238636] font-bold">
                  ● {primaryServer?.status || "ONLINE"}
                </span>
              </div>
              <div className="text-[11px] text-[#8b949e]">
                {primaryServer
                  ? `${primaryServer.channelCount} Channels • ${primaryServer.commandCount} Rules • ${primaryServer.executionCount} Executions`
                  : "Connect a Discord Guild to monitor slash command operations"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchServers}
              disabled={loading}
              className="px-2.5 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[#c9d1d9] font-mono transition text-xs flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-mono font-medium text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Server</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 text-xs font-mono border-b border-[#30363d] pb-2">
          {(["overview", "channels"] as const).map((tab) => (
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
            CONFIGURED SERVER CHANNELS FROM DATABASE
          </div>
          {servers.every((s) => !s.channels || s.channels.length === 0) ? (
            <div className="p-8 text-center text-[#8b949e]">
              No channel records persisted for registered servers.
            </div>
          ) : (
            <div className="divide-y divide-[#30363d]">
              {servers.flatMap((s) =>
                (s.channels || []).map((ch: any) => (
                  <div key={ch.id} className="p-3 flex items-center justify-between hover:bg-[#21262d] transition">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span className="font-bold text-[#f0f6fc]">#{ch.name}</span>
                      <span className="text-[10px] text-[#8b949e] font-mono">({s.name})</span>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] text-[#8b949e]">
                      <span>Type: <strong className="text-[#c9d1d9]">{ch.type || "GUILD_TEXT"}</strong></span>
                      <span>Channel ID: <strong className="text-[#388bfd]">{ch.discordChannelId}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
              <div className="p-6 text-center text-[#8b949e]">Loading servers from database...</div>
            ) : servers.length === 0 ? (
              <div className="p-8 text-center text-[#8b949e]">No servers connected yet.</div>
            ) : (
              servers.map((srv) => (
                <div key={srv.id} className="p-3.5 flex items-center justify-between hover:bg-[#21262d] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center font-bold text-xs text-[#f0f6fc]">
                      {srv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[#f0f6fc] text-xs">{srv.name}</div>
                      <div className="text-[10px] text-[#8b949e]">Guild ID: {srv.discordGuildId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-[11px] text-[#8b949e]">
                    <span>Executions: <strong className="text-[#c9d1d9]">{srv.executionCount}</strong></span>
                    <span>Channels: <strong className="text-[#c9d1d9]">{srv.channelCount}</strong></span>
                    <span>Rules: <strong className="text-[#c9d1d9]">{srv.commandCount}</strong></span>
                    <span className="text-[#238636] font-semibold">● {srv.status}</span>
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
