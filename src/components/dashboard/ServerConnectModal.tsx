"use client";

import { useState } from "react";
import { X, Server, Link2 } from "lucide-react";

interface ServerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServerAdded: () => void;
}

export default function ServerConnectModal({ isOpen, onClose, onServerAdded }: ServerConnectModalProps) {
  const [discordGuildId, setDiscordGuildId] = useState("");
  const [name, setName] = useState("");
  const [mirrorWebhookUrl, setMirrorWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordGuildId, name, mirrorWebhookUrl }),
      });

      if (res.ok) {
        onServerAdded();
        onClose();
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono text-xs">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-white uppercase">Register New Discord Server Tenant</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Server Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Staging Engineering Guild"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Discord Guild ID</label>
            <input
              type="text"
              value={discordGuildId}
              onChange={(e) => setDiscordGuildId(e.target.value)}
              placeholder="18-digit Discord Guild ID e.g. 987654321098765432"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">
              Mirror Notification Webhook URL (Discord / Slack)
            </label>
            <input
              type="url"
              value={mirrorWebhookUrl}
              onChange={(e) => setMirrorWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
          >
            {loading ? "Registering Server..." : "Connect Discord Server"}
          </button>
        </form>
      </div>
    </div>
  );
}
