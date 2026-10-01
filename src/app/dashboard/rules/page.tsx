"use client";

import { useState, useEffect } from "react";
import { Sliders, Plus, Power, Trash2, Check } from "lucide-react";
import RuleEditorModal from "@/components/dashboard/RuleEditorModal";

export default function RulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/rules");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const toggleRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentStatus }),
      });
      fetchRules();
    } catch (e) {}
  };

  const deleteRule = async (ruleId: string) => {
    try {
      await fetch(`/api/rules/${ruleId}`, { method: "DELETE" });
      fetchRules();
    } catch (e) {}
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3 font-mono">
        <div>
          <h1 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#5865f2]" />
            <span>CONFIGURABLE RULE ENGINE</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Deterministic automation rules & action pipeline policies
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-mono font-medium text-xs px-3 py-1.5 rounded transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Rule</span>
        </button>
      </div>

      <div className="space-y-2 font-mono">
        {loading ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-10 text-center text-[#8b949e] flex flex-col items-center justify-center gap-2 font-mono">
            <div className="w-5 h-5 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#8b949e]">Fetching automation rule definitions...</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-8 text-center text-[#8b949e]">
            No custom rules configured yet. Standard system default rules are active.
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-[#161b22] border rounded-md p-3.5 space-y-2.5 transition ${
                rule.isEnabled ? "border-[#30363d]" : "border-[#30363d]/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#f0f6fc]">{rule.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
                    Priority: {rule.priority}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0d1117] text-[#5865f2] border border-[#30363d]">
                    /{rule.commandName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id, rule.isEnabled)}
                    className={`px-2 py-0.5 rounded border text-[10px] transition flex items-center gap-1 ${
                      rule.isEnabled
                        ? "bg-[#238636]/20 text-[#238636] border-[#238636]/40"
                        : "bg-[#0d1117] text-[#8b949e] border-[#30363d]"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{rule.isEnabled ? "Enabled" : "Disabled"}</span>
                  </button>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1 hover:bg-[#f85149]/20 text-[#8b949e] hover:text-[#f85149] rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* IF -> THEN Compact Pipeline Row */}
              <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d] text-[11px] space-y-1">
                <div className="flex items-center gap-2 text-[#8b949e]">
                  <strong className="text-[#5865f2]">IF</strong>
                  <span>severity = critical AND command = /{rule.commandName}</span>
                </div>
                <div className="flex items-center gap-2 text-[#8b949e]">
                  <strong className="text-[#238636]">THEN</strong>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(rule.actions) &&
                      rule.actions.map((act: string) => (
                        <span key={act} className="px-1.5 py-0.2 bg-[#21262d] text-[#c9d1d9] rounded border border-[#30363d] text-[10px]">
                          {act}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <RuleEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRuleSaved={fetchRules}
      />
    </div>
  );
}
