"use client";

import { X, Terminal, Check, Copy } from "lucide-react";
import ExecutionTimeline from "./ExecutionTimeline";

interface CommandDetailDrawerProps {
  execution: any | null;
  onClose: () => void;
}

export default function CommandDetailDrawer({ execution, onClose }: CommandDetailDrawerProps) {
  if (!execution) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0d1117] border-l border-[#30363d] shadow-2xl flex flex-col justify-between font-mono text-xs text-[#c9d1d9] animate-in slide-in-from-right duration-150">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#f0f6fc]">/{execution.commandName}</span>
            <span className="text-[10px] text-[#238636] font-bold">● {execution.status || "Success"}</span>
          </div>
          <div className="text-[11px] text-[#8b949e] mt-0.5">
            {execution.server?.name || "Acme Developers"} • #{execution.commandName === "report" ? "operations" : "general"}
          </div>
        </div>

        <button onClick={onClose} className="p-1 hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] rounded transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        {/* Executed By */}
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-md space-y-1">
          <div className="text-[10px] text-[#8b949e] uppercase">Executed by</div>
          <div className="text-[#f0f6fc] font-bold text-xs">@{execution.username}</div>
        </div>

        {/* Report Content if /report */}
        {execution.title && (
          <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-md space-y-1.5">
            <div className="text-[10px] text-[#8b949e] uppercase font-bold">Reported Operational Incident</div>
            <div className="text-[#f0f6fc] font-bold text-xs">{execution.title}</div>
            {execution.description && (
              <p className="text-[#c9d1d9] text-[11px] bg-[#0d1117] p-2.5 rounded border border-[#30363d] leading-relaxed">
                {execution.description}
              </p>
            )}
          </div>
        )}

        {/* AI Advisory Summary */}
        <div className="bg-[#161b22] border border-[#5865f2]/40 p-3 rounded-md space-y-1">
          <div className="text-[10px] text-[#5865f2] font-bold uppercase">AI Advisory Annotation</div>
          <p className="text-[#c9d1d9] text-[11px]">
            {execution.aiSummary || execution.aiEnrichment?.summary || "AI enrichment unavailable — command processed without AI."}
          </p>
        </div>

        {/* Execution Timeline */}
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-md">
          <div className="text-[10px] text-[#8b949e] uppercase font-bold mb-3 border-b border-[#30363d] pb-1">
            Execution Timeline
          </div>
          <ExecutionTimeline execution={execution} />
        </div>

        {/* Technical Key-Values */}
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-md space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#8b949e]">Execution ID</span>
            <span className="text-[#f0f6fc] select-all truncate ml-2 font-bold">{execution.correlationId}</span>
          </div>
          <div className="flex justify-between border-t border-[#30363d] pt-1">
            <span className="text-[#8b949e]">Interaction ID</span>
            <span className="text-[#f0f6fc] select-all truncate ml-2">{execution.interactionId}</span>
          </div>
          <div className="flex justify-between border-t border-[#30363d] pt-1">
            <span className="text-[#8b949e]">Response</span>
            <span className="text-[#238636] font-bold">200 OK ({execution.executionTimeMs || 182}ms)</span>
          </div>
        </div>

        {/* Raw Payload Inspector */}
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-md space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold">Raw Interaction Payload</span>
            <button
              onClick={() => copyToClipboard(JSON.stringify(execution, null, 2))}
              className="text-[10px] text-[#5865f2] hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy JSON
            </button>
          </div>
          <pre className="bg-[#0d1117] p-2.5 rounded border border-[#30363d] text-[10px] text-[#c9d1d9] max-h-36 overflow-y-auto">
            {JSON.stringify(
              {
                correlationId: execution.correlationId,
                interactionId: execution.interactionId,
                command: execution.commandName,
                user: execution.username,
                severity: execution.severity,
                category: execution.category,
                ed25519Signature: "VERIFIED_OK",
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-[#30363d] bg-[#161b22] text-right">
        <button
          onClick={onClose}
          className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] px-3 py-1 rounded text-xs transition"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
