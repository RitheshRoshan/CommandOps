"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CommandOps Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center p-4 font-sans text-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 max-w-md w-full space-y-4 shadow-2xl font-mono">
        <div className="flex items-center gap-2 text-[#f85149]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h1 className="text-sm font-bold uppercase text-[#f0f6fc]">
            Application Runtime Error
          </h1>
        </div>

        <p className="text-[#8b949e] text-xs leading-relaxed">
          CommandOps encountered an unexpected runtime exception in the control plane.
        </p>

        <div className="bg-[#0d1117] p-3 rounded border border-[#30363d] space-y-1 text-[11px]">
          <div className="text-[#8b949e]">Error Message:</div>
          <div className="text-[#f85149] font-bold break-all">
            {error.message || "An unexpected error occurred."}
          </div>
          {error.digest && (
            <div className="text-[#8b949e] text-[10px] pt-1 border-t border-[#30363d] mt-1">
              Digest ID: <span className="text-[#c9d1d9] select-all">{error.digest}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white py-2 px-3 rounded font-mono text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset & Retry</span>
          </button>

          <Link
            href="/dashboard"
            className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded font-mono text-xs transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
