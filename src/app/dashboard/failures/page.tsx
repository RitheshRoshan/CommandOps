"use client";

import { useState, useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function FailuresPage() {
  const [failures, setFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchFailures = async () => {
    try {
      const res = await fetch("/api/failures");
      if (res.ok) {
        const data = await res.json();
        setFailures(data.failedDeliveries || data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailures();
  }, []);

  const handleRetry = async (deliveryId: string) => {
    setRetryingId(deliveryId);
    try {
      const res = await fetch(`/api/actions/${deliveryId}/retry`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchFailures();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3 font-mono">
        <div>
          <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#f85149]" />
            <span>FAILURE CENTER & INCIDENT QUEUE</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Downstream webhook delivery failures & manual exponential backoff retry control
          </p>
        </div>
        <button
          onClick={fetchFailures}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[#c9d1d9] font-mono transition text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="space-y-2 font-mono">
        {loading ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-10 text-center text-[#8b949e] flex flex-col items-center justify-center gap-2 font-mono">
            <div className="w-5 h-5 border-2 border-[#f85149] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#8b949e]">Loading failure queue & delivery backlog from database...</span>
          </div>
        ) : failures.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-8 text-center text-[#8b949e] space-y-1">
            <div className="text-[#238636] font-bold text-sm">✓ Zero Failed Downstream Actions</div>
            <div className="text-[11px] text-[#8b949e]">All webhook mirror deliveries executed cleanly.</div>
          </div>
        ) : (
          failures.map((f) => (
            <div key={f.id} className="bg-[#161b22] border border-[#30363d] rounded-md p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#f85149] font-bold">
                    ✕ {f.command ? (f.command.startsWith("/") ? f.command : `/${f.command}`) : "—"}
                  </span>
                  <span className="text-[10px] text-[#8b949e] font-bold uppercase px-1.5 py-0.5 bg-[#0d1117] border border-[#30363d] rounded">
                    {f.commandExecution?.severity || "MEDIUM"}
                  </span>
                  <span className="text-[11px] text-[#8b949e]">
                    {f.server || "Unknown server"} • {f.channel || "Unknown channel"} ({f.user || "—"})
                  </span>
                </div>

                <button
                  onClick={() => handleRetry(f.id)}
                  disabled={retryingId === f.id}
                  className="bg-[#388bfd] hover:bg-[#1f6feb] disabled:bg-[#21262d] text-white px-3 py-1 rounded text-xs transition flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${retryingId === f.id ? "animate-spin" : ""}`} />
                  <span>Retry Delivery</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px] text-[#8b949e] bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                <div className="col-span-2">
                  Error: <span className="text-[#f85149] font-bold">{f.lastError || "Webhook delivery failed"}</span>
                </div>
                <div>
                  Attempt Count: <span className="text-[#c9d1d9] font-bold">{f.attempts} / {f.maxAttempts || 3}</span>
                </div>
                <div>
                  Last Attempt: <span className="text-[#c9d1d9]">{f.updatedAt ? new Date(f.updatedAt).toLocaleTimeString() : "—"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
