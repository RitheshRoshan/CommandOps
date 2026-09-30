import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col justify-center items-center p-4 font-mono text-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="w-10 h-10 rounded bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/40 flex items-center justify-center font-bold text-base mx-auto">
          404
        </div>
        <div>
          <h1 className="text-base font-bold text-[#f0f6fc]">Resource Not Found</h1>
          <p className="text-xs text-[#8b949e] mt-1">
            The requested CommandOps route or execution resource does not exist.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded font-mono text-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
