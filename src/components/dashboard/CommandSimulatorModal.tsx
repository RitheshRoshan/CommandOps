"use client";

import { useState } from "react";
import { X, Play, Terminal, AlertTriangle, CheckCircle2, Shield } from "lucide-react";

interface CommandSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandTriggered: () => void;
}

export default function CommandSimulatorModal({
  isOpen,
  onClose,
  onCommandTriggered,
}: CommandSimulatorModalProps) {
  const [command, setCommand] = useState<"status" | "report" | "metrics" | "incident">("report");
  const [title, setTitle] = useState("Payment Gateway Timeout on Checkout");
  const [description, setDescription] = useState("Customers experiencing 504 timeouts during checkout payment processing.");
  const [severity, setSeverity] = useState("HIGH");
  const [category, setCategory] = useState("PAYMENT");
  const [username, setUsername] = useState("ops_lead_alex");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/simulate-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          title,
          description,
          severity,
          category,
          username,
        }),
      });

      const data = await res.json();
      setResult(data);
      onCommandTriggered();
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Discord Command Simulator
              </h2>
              <p className="text-[11px] text-slate-400">
                Simulate a live Discord slash command execution through the secure gateway
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSimulate} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Select Slash Command
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCommand("report")}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition flex items-center justify-center gap-1 ${
                  command === "report"
                    ? "bg-blue-600/20 border-blue-500 text-blue-400 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>/report</span>
              </button>
              <button
                type="button"
                onClick={() => setCommand("status")}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition flex items-center justify-center gap-1 ${
                  command === "status"
                    ? "bg-blue-600/20 border-blue-500 text-blue-400 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>/status</span>
              </button>
              <button
                type="button"
                onClick={() => setCommand("metrics")}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition flex items-center justify-center gap-1 ${
                  command === "metrics"
                    ? "bg-blue-600/20 border-blue-500 text-blue-400 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>/metrics</span>
              </button>
              <button
                type="button"
                onClick={() => setCommand("incident")}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition flex items-center justify-center gap-1 ${
                  command === "incident"
                    ? "bg-red-600/20 border-red-500 text-red-400 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>/incident</span>
              </button>
            </div>
          </div>

          {command === "incident" && (
            <>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-red-500"
                >
                  <option value="CRITICAL">CRITICAL — Total Outage</option>
                  <option value="HIGH">HIGH — Major Impact</option>
                  <option value="MEDIUM">MEDIUM — Minor Degradation</option>
                </select>
              </div>
            </>
          )}

          {command === "report" && (
            <>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-blue-500"
                  >
                    <option value="BUG">BUG</option>
                    <option value="INCIDENT">INCIDENT</option>
                    <option value="PAYMENT">PAYMENT</option>
                    <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                    <option value="REQUEST">REQUEST</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Simulated Discord Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-medium text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Command Pipeline</span>
              </>
            )}
          </button>
        </form>

        {/* Result Preview */}
        {result && (
          <div className="px-6 pb-6 border-t border-slate-800 pt-4 bg-slate-950/80">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pipeline Executed — Correlation ID: {result.interactionId}</span>
            </div>
            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
