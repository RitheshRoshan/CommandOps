"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Key, AlertCircle, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@commandops.io");
  const [password, setPassword] = useState("admin_password_123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col justify-center items-center p-4 font-sans text-xs">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded bg-[#5865f2] text-white font-mono font-bold text-sm">
            CO
          </div>
          <h1 className="text-lg font-bold text-[#f0f6fc] font-mono tracking-tight">
            CommandOps Control Plane
          </h1>
          <p className="text-xs text-[#8b949e] font-mono">
            &ldquo;Discord is the interface. CommandOps is the control plane.&rdquo;
          </p>
        </div>

        {/* Credentials Banner */}
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 font-mono text-[11px] space-y-1">
          <div className="text-[#388bfd] font-bold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Evaluator Credentials
          </div>
          <div className="text-[#8b949e] flex justify-between pt-1">
            <span>Email:</span>
            <strong className="text-[#f0f6fc]">admin@commandops.io</strong>
          </div>
          <div className="text-[#8b949e] flex justify-between">
            <span>Password:</span>
            <strong className="text-[#f0f6fc]">admin_password_123!</strong>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 space-y-4 shadow-xl">
          {error && (
            <div className="bg-[#f85149]/10 border border-[#f85149]/40 text-[#f85149] text-xs p-2.5 rounded font-mono flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 font-mono">
            <div>
              <label className="block text-[10px] text-[#8b949e] uppercase mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] outline-none focus:border-[#5865f2]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#8b949e] uppercase mb-1">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] outline-none focus:border-[#5865f2]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-mono font-semibold py-2 px-3 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Authenticate Session"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
