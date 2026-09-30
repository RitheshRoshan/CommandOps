"use client";

import { useState } from "react";
import { X, Sliders, Plus, Trash2, Check } from "lucide-react";

interface RuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleSaved: () => void;
}

export default function RuleEditorModal({ isOpen, onClose, onRuleSaved }: RuleEditorModalProps) {
  const [name, setName] = useState("High Severity Incident Escalation");
  const [description, setDescription] = useState("Escalates HIGH or CRITICAL reports to mirror webhook and invokes AI triage.");
  const [commandName, setCommandName] = useState("report");
  const [priority, setPriority] = useState(150);
  const [actions, setActions] = useState<string[]>([
    "PERSIST",
    "RESPOND_DISCORD",
    "MIRROR_NOTIFICATION",
    "AI_ENRICHMENT",
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleAction = (act: string) => {
    if (actions.includes(act)) {
      setActions(actions.filter((a) => a !== act));
    } else {
      setActions([...actions, act]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: "*", // Applies to all servers by default
          name,
          description,
          commandName,
          priority,
          conditions: [
            {
              field: "severity",
              operator: "IN",
              value: ["HIGH", "CRITICAL"],
            },
          ],
          actions,
        }),
      });

      if (res.ok) {
        onRuleSaved();
        onClose();
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono text-xs">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-white uppercase">Configure New Command Rule</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Target Command</label>
              <select
                value={commandName}
                onChange={(e) => setCommandName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none"
              >
                <option value="report">/report</option>
                <option value="status">/status</option>
                <option value="*">All Commands (*)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Rule Priority Score</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-2">Rule Action Pipeline</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "PERSIST", label: "Persist Event to DB" },
                { id: "RESPOND_DISCORD", label: "Respond to Discord User" },
                { id: "MIRROR_NOTIFICATION", label: "Mirror to Webhook" },
                { id: "AI_ENRICHMENT", label: "Invoke AI Triage" },
                { id: "CREATE_ALERT", label: "Create Dashboard Alert" },
              ].map((act) => (
                <button
                  type="button"
                  key={act.id}
                  onClick={() => toggleAction(act.id)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                    actions.includes(act.id)
                      ? "bg-purple-600/20 border-purple-500/50 text-purple-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}
                >
                  <span>{act.label}</span>
                  {actions.includes(act.id) && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition"
          >
            {loading ? "Saving Rule..." : "Save Rule Definition"}
          </button>
        </form>
      </div>
    </div>
  );
}
