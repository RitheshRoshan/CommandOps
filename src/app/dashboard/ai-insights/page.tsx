"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Info, RefreshCw, Activity } from "lucide-react";

interface IntelligenceData {
  metrics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    failureRate: number;
    avgLatencyMs: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
  };
  commandUsage: Array<{ command: string; count: number; percentage: number }>;
  trends: Array<{ date: string; count: number; failures: number }>;
  insights: Array<{ id: string; type: string; title: string; description: string; timestamp: string }>;
}

export default function CommandIntelligencePage() {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/intelligence");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  return (
    <div className="space-y-5 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3 font-mono">
        <div>
          <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#5865f2]" />
            <span>COMMAND INTELLIGENCE</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Operational usage trends, latency distributions & calculated AI advisory annotations
          </p>
        </div>
        <button
          onClick={fetchIntelligence}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[#c9d1d9] font-mono transition text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#8b949e] font-mono border border-[#30363d] rounded-md bg-[#161b22] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#c9d1d9]">Calculating system intelligence, latency percentiles & AI advisory...</span>
        </div>
      ) : !data || data.metrics.totalExecutions === 0 ? (
        <div className="p-8 text-center text-[#8b949e] font-mono border border-[#30363d] rounded bg-[#161b22]">
          Not enough data to generate an insight.
        </div>
      ) : (
        <>
          {/* Insights Annotations */}
          <div className="space-y-2">
            {data.insights.map((ins) => (
              <div
                key={ins.id}
                className="bg-[#161b22] border border-[#388bfd]/40 rounded-md p-3 flex items-start gap-2.5 font-mono text-xs text-[#c9d1d9]"
              >
                <Info className="w-4 h-4 text-[#388bfd] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#f0f6fc]">{ins.title}:</span> {ins.description}
                </div>
              </div>
            ))}
          </div>

          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
              <span className="text-[10px] text-[#8b949e] uppercase">Total Executions</span>
              <p className="text-base font-bold text-[#f0f6fc] mt-1">{data.metrics.totalExecutions}</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
              <span className="text-[10px] text-[#8b949e] uppercase">Success Rate</span>
              <p className="text-base font-bold text-[#238636] mt-1">{data.metrics.successRate}%</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
              <span className="text-[10px] text-[#8b949e] uppercase">Average Lifecycle</span>
              <p className="text-base font-bold text-[#388bfd] mt-1">{data.metrics.avgLatencyMs >= 1000 ? `${(data.metrics.avgLatencyMs / 1000).toFixed(1)}s` : `${data.metrics.avgLatencyMs}ms`}</p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
              <span className="text-[10px] text-[#8b949e] uppercase">P95 Lifecycle</span>
              <p className="text-base font-bold text-[#d29922] mt-1">{data.metrics.p95LatencyMs >= 1000 ? `${(data.metrics.p95LatencyMs / 1000).toFixed(1)}s` : `${data.metrics.p95LatencyMs}ms`}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {/* Usage Breakdown */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3">
              <div className="text-xs font-bold uppercase text-[#8b949e] border-b border-[#30363d] pb-2 flex items-center justify-between">
                <span>Command Usage Breakdown</span>
                <Activity className="w-3.5 h-3.5 text-[#388bfd]" />
              </div>
              <div className="divide-y divide-[#30363d]">
                {data.commandUsage.map((u) => (
                  <div key={u.command} className="py-2 flex items-center justify-between">
                    <span className="font-bold text-[#f0f6fc]">{u.command}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#8b949e] text-[11px]">({u.percentage}%)</span>
                      <span className="text-[#388bfd] font-bold">{u.count} executions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latency Percentiles Performance Table */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 space-y-3">
              <div className="text-xs font-bold uppercase text-[#8b949e] border-b border-[#30363d] pb-2">
                Calculated Lifecycle Duration Percentiles
              </div>
              <table className="w-full text-left text-xs">
                <thead className="text-[#8b949e] border-b border-[#30363d] uppercase text-[10px]">
                  <tr>
                    <th className="py-1">METRIC</th>
                    <th className="py-1">PERCENTILE</th>
                    <th className="py-1">DURATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d] text-[#c9d1d9]">
                  <tr>
                    <td className="py-2 font-bold text-[#f0f6fc]">Median Lifecycle Duration</td>
                    <td className="py-2 text-[#8b949e]">P50</td>
                    <td className="py-2 text-[#238636] font-semibold">{data.metrics.p50LatencyMs >= 1000 ? `${(data.metrics.p50LatencyMs / 1000).toFixed(1)}s` : `${data.metrics.p50LatencyMs}ms`}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-[#f0f6fc]">95th Percentile Lifecycle</td>
                    <td className="py-2 text-[#8b949e]">P95</td>
                    <td className="py-2 text-[#d29922] font-semibold">{data.metrics.p95LatencyMs >= 1000 ? `${(data.metrics.p95LatencyMs / 1000).toFixed(1)}s` : `${data.metrics.p95LatencyMs}ms`}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-[#f0f6fc]">99th Percentile Tail Lifecycle</td>
                    <td className="py-2 text-[#8b949e]">P99</td>
                    <td className="py-2 text-[#f85149] font-semibold">{data.metrics.p99LatencyMs >= 1000 ? `${(data.metrics.p99LatencyMs / 1000).toFixed(1)}s` : `${data.metrics.p99LatencyMs}ms`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
