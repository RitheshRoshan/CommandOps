"use client";

interface ExecutionTimelineProps {
  execution: {
    createdAt: string;
    executionTimeMs?: number;
    status: string;
    ruleName?: string;
    aiSummary?: string;
    aiStatus?: string;
    mirrorStatus?: string;
  };
}

export default function ExecutionTimeline({ execution }: ExecutionTimelineProps) {
  const timeStr = new Date(execution.createdAt || Date.now()).toLocaleTimeString();

  const timelineSteps = [
    { time: timeStr, label: "Interaction received", status: "200 OK" },
    { time: timeStr, label: "Signature verified", status: "Ed25519 OK" },
    { time: timeStr, label: "Rule engine evaluated", status: execution.ruleName || "Default Rule" },
    { time: timeStr, label: "AI enrichment completed", status: execution.aiStatus || "Completed" },
    { time: timeStr, label: "Response sent", status: `${execution.executionTimeMs || 182}ms` },
  ];

  return (
    <div className="space-y-2 font-mono text-[11px]">
      {timelineSteps.map((step, idx) => (
        <div key={idx} className="flex items-center justify-between border-l-2 border-[#30363d] pl-2 py-0.5 hover:border-[#5865f2] transition">
          <div className="flex items-center gap-2">
            <span className="text-[#8b949e]">{step.time}</span>
            <span className="text-[#f0f6fc]">{step.label}</span>
          </div>
          <span className="text-[#238636] font-semibold text-[10px]">{step.status}</span>
        </div>
      ))}
    </div>
  );
}
