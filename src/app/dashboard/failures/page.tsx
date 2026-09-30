"use client";

import { useState, useEffect } from "react";
import { AlertOctagon, RefreshCw, Check } from "lucide-react";

export default function FailuresPage() {
  const [failures, setFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchFailures = async () => {
    try {
      const res = await fetch("/api/failures");
      if (res.ok) {
        const data = await res.json();
        setFailures(data.failedDeliveries || []);
      }
    } catch (e) {
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
        fetchFailures();
      }
    } catch (e) {
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="border-b border-[#30363d] pb-3 font-mono">
        <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-[#f85149]" />
          <span>FAILURE CENTER & INCIDENT MANAGEMENT</span>
        </h1>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Downstream webhook failure queue & manual retry control
        </p>
      </div>

      <div className="space-y-2 font-mono">
        {loading ? (
          <div className="text-center py-8 text-[#8b949e]">Loading Failure Queue...</div>
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
                  <span className="text-[#f85149] font-bold">✕ /{f.commandExecution?.commandName || "report"}</span>
                  <span className="text-[10px] text-[#8b949e] font-bold uppercase px-1.5 py-0.5 bg-[#0d1117] border border-[#30363d] rounded">
                    CRITICAL
                  </span>
                  <span className="text-[11px] text-[#8b949e]">
                    Production • #operations
                  </span>
                </div>

                <button
                  onClick={() => handleRetry(f.id)}
                  disabled={retryingId === f.id}
                  className="bg-[#388bfd] hover:bg-[#1f6feb] disabled:bg-[#21262d] text-white px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${retryingId === f.id ? "animate-spin" : ""}`} />
                  <span>Retry</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8b949e] bg-[#0d1117] p-2 rounded border border-[#30363d]">
                <div>
                  Error: <span className="text-[#f85149] font-bold">{f.lastError || "Webhook delivery failed"}</span>
                </div>
                <div>
                  Attempts: <span className="text-[#c9d1d9] font-bold">{f.attempts || 3} retry attempts</span>
                </div>
                <div>
                  Last Attempt: <span className="text-[#c9d1d9]">{new Date(f.createdAt || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
