"use client";

interface ExecutionTimelineProps {
  execution: {
    createdAt: string;
    executionTimeMs?: number;
    status: string;
    matchedRuleId?: string;
    aiEnrichment?: { status: string; summary?: string; latencyMs?: number } | null;
    notificationDeliveries?: Array<{ status: string; attempts: number; lastError?: string }> | null;
    actions?: Array<{ actionType: string; status: string }> | null;
  };
}

export default function ExecutionTimeline({ execution }: ExecutionTimelineProps) {
  const timeStr = execution.createdAt ? new Date(execution.createdAt).toLocaleTimeString() : "—";
  const durationStr = execution.executionTimeMs !== undefined && execution.executionTimeMs !== null ? `${execution.executionTimeMs}ms` : "—";

  const timelineSteps = [
    { time: timeStr, label: "Interaction Gateway Received", status: "200 OK", isSuccess: true },
    { time: timeStr, label: "Ed25519 Cryptographic Signature", status: "VERIFIED", isSuccess: true },
    { time: timeStr, label: "Rule Engine Policy Evaluation", status: execution.matchedRuleId && execution.matchedRuleId !== "—" ? "RULE MATCHED" : "DEFAULT PASS", isSuccess: true },
  ];

  if (execution.aiEnrichment) {
    timelineSteps.push({
      time: timeStr,
      label: `Advisory AI Triage (${execution.aiEnrichment.latencyMs || 0}ms)`,
      status: execution.aiEnrichment.status,
      isSuccess: execution.aiEnrichment.status === "SUCCESS",
    });
  }

  if (execution.notificationDeliveries && execution.notificationDeliveries.length > 0) {
    execution.notificationDeliveries.forEach((nd, idx) => {
      timelineSteps.push({
        time: timeStr,
        label: `Webhook Mirror Delivery #${idx + 1} (${nd.attempts} attempt${nd.attempts > 1 ? "s" : ""})`,
        status: nd.status,
        isSuccess: nd.status === "SUCCESS",
      });
    });
  }

  timelineSteps.push({
    time: timeStr,
    label: "Discord Command Lifecycle Execution",
    status: `${execution.status} (${durationStr})`,
    isSuccess: execution.status === "COMPLETED",
  });

  return (
    <div className="space-y-2 font-mono text-[11px]">
      {timelineSteps.map((step, idx) => (
        <div key={idx} className="flex items-center justify-between border-l-2 border-[#30363d] pl-2 py-1 hover:border-[#5865f2] transition">
          <div className="flex items-center gap-2">
            <span className="text-[#8b949e]">{step.time}</span>
            <span className="text-[#f0f6fc]">{step.label}</span>
          </div>
          <span className={`font-semibold text-[10px] ${step.isSuccess ? "text-[#238636]" : "text-[#f85149]"}`}>
            {step.status}
          </span>
        </div>
      ))}
    </div>
  );
}
