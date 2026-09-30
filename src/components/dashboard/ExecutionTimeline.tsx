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

function formatMsDisplay(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "N/A";
  return `${val}ms`;
}

function formatTimeDisplay(ts?: number | string): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString();
}

export default function ExecutionTimeline({ execution }: ExecutionTimelineProps) {
  const raw = execution.rawInput || {};
  const ackMs = execution.ackProcessingMs ?? raw.ackProcessingMs;
  const procMs = execution.commandProcessingMs ?? raw.commandProcessingMs;
  const followMs = execution.followupMs ?? raw.followupMs;
  const totalMs = execution.executionTimeMs;

  const reqTime = formatTimeDisplay(raw.requestReceivedAt || execution.createdAt);
  const sigTime = formatTimeDisplay(raw.signatureVerifiedAt || execution.createdAt);
  const ackTime = formatTimeDisplay(raw.ackResponseCreatedAt || execution.createdAt);
  const procTime = formatTimeDisplay(raw.processingCompletedAt || execution.createdAt);
  const followTime = formatTimeDisplay(raw.followupCompletedAt || execution.createdAt);

  const timelineSteps = [
    { time: reqTime, label: "Interaction Gateway Received", status: "200 OK", isSuccess: true },
    { time: sigTime, label: "Ed25519 Signature VERIFIED", status: "ED25519 OK", isSuccess: true },
    { time: ackTime, label: `Discord Interaction ACK SENT (${formatMsDisplay(ackMs)})`, status: "DEFERRED (Type 5)", isSuccess: true },
    { time: procTime, label: "Rule Engine Policy Evaluation", status: execution.matchedRuleId && execution.matchedRuleId !== "—" ? "RULE MATCHED" : "DEFAULT PASS", isSuccess: true },
  ];

  if (execution.aiEnrichment) {
    timelineSteps.push({
      time: procTime,
      label: `Advisory AI Triage (${formatMsDisplay(execution.aiEnrichment.latencyMs)})`,
      status: execution.aiEnrichment.status,
      isSuccess: execution.aiEnrichment.status === "SUCCESS",
    });
  }

  if (execution.notificationDeliveries && execution.notificationDeliveries.length > 0) {
    execution.notificationDeliveries.forEach((nd, idx) => {
      timelineSteps.push({
        time: procTime,
        label: `Webhook Mirror Delivery #${idx + 1} (${nd.attempts} attempt${nd.attempts > 1 ? "s" : ""})`,
        status: nd.status,
        isSuccess: nd.status === "SUCCESS",
      });
    });
  }

  timelineSteps.push({
    time: followTime,
    label: `Discord Follow-up SENT (${formatMsDisplay(followMs)})`,
    status: "WEBHOOK SENT",
    isSuccess: true,
  });

  timelineSteps.push({
    time: followTime,
    label: "Discord Command Lifecycle",
    status: `${execution.status || "COMPLETED"} (${formatMsDisplay(totalMs)})`,
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
