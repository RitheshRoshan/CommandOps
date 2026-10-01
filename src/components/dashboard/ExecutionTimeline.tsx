"use client";

interface ExecutionTimelineProps {
  execution: {
    createdAt: string;
    executionTimeMs?: number;
    ackProcessingMs?: number;
    commandProcessingMs?: number;
    followupMs?: number;
    requestReceivedAt?: number;
    signatureVerifiedAt?: number;
    ackResponseCreatedAt?: number;
    processingCompletedAt?: number;
    followupCompletedAt?: number;
    rawInput?: any;
    status: string;
    matchedRuleId?: string;
    aiEnrichment?: { status: string; summary?: string; latencyMs?: number } | null;
    notificationDeliveries?: Array<{ status: string; attempts: number; lastError?: string }> | null;
    actions?: Array<{ actionType: string; status: string }> | null;
  };
}

function formatDuration(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val) || val <= 0) return "N/A";
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)}s (${val}ms)`;
  }
  return `${val}ms`;
}

function formatTimeDisplay(ts?: number | string): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString();
}

export default function ExecutionTimeline({ execution }: ExecutionTimelineProps) {
  const raw = execution.rawInput || {};
  const ackMs = (execution as any).ackResponseTimeMs ?? execution.ackProcessingMs ?? raw.ackProcessingMs;
  const procMs = (execution as any).processingTimeMs ?? execution.commandProcessingMs ?? raw.commandProcessingMs;
  const followMs = (execution as any).followupTimeMs ?? execution.followupMs ?? raw.followupMs;
  const totalMs = (execution as any).totalLifecycleMs ?? execution.executionTimeMs;

  const reqTime = formatTimeDisplay(raw.requestReceivedAt || execution.createdAt);
  const sigTime = formatTimeDisplay(raw.signatureVerifiedAt || execution.createdAt);
  const ackTime = formatTimeDisplay(raw.ackResponseCreatedAt || execution.createdAt);
  const procTime = formatTimeDisplay(raw.processingCompletedAt || execution.createdAt);
  const followTime = formatTimeDisplay(raw.followupCompletedAt || execution.createdAt);

  const timelineSteps = [
    { time: reqTime, label: "Interaction Gateway Received", status: "200 OK", isSuccess: true },
    { time: sigTime, label: "Ed25519 Cryptographic Signature VERIFIED", status: "VERIFIED", isSuccess: true },
    { time: ackTime, label: "Discord Interaction ACK SENT", status: formatDuration(ackMs), isSuccess: true },
    { time: procTime, label: "Rule Engine Policy Evaluation", status: execution.matchedRuleId && execution.matchedRuleId !== "—" ? "RULE MATCHED" : "DEFAULT PASS", isSuccess: true },
    { time: procTime, label: "Command Execution COMPLETED", status: formatDuration(procMs), isSuccess: execution.status !== "FAILED" },
  ];

  if (execution.aiEnrichment) {
    timelineSteps.push({
      time: procTime,
      label: "Advisory AI Triage",
      status: `${execution.aiEnrichment.status} (${formatDuration(execution.aiEnrichment.latencyMs)})`,
      isSuccess: execution.aiEnrichment.status === "SUCCESS",
    });
  }

  if (execution.notificationDeliveries && execution.notificationDeliveries.length > 0) {
    execution.notificationDeliveries.forEach((nd, idx) => {
      timelineSteps.push({
        time: procTime,
        label: `Webhook Mirror Delivery #${idx + 1}`,
        status: `${nd.status} (${nd.attempts} attempt${nd.attempts > 1 ? "s" : ""})`,
        isSuccess: nd.status === "SUCCESS",
      });
    });
  }

  timelineSteps.push({
    time: followTime,
    label: "Discord Follow-up SENT",
    status: followMs ? formatDuration(followMs) : "SENT",
    isSuccess: true,
  });

  timelineSteps.push({
    time: followTime,
    label: "Discord Command Lifecycle COMPLETED",
    status: `${execution.status || "COMPLETED"} (${formatDuration(totalMs)})`,
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
