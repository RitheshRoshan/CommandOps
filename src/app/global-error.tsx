"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CommandOps Global Error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#c9d1d9] font-sans min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 max-w-md w-full space-y-4 shadow-2xl font-mono text-xs">
          <div className="text-[#f85149] font-bold text-sm uppercase">
            Global Layout Exception
          </div>
          <p className="text-[#8b949e]">
            {error.message || "An unhandled global error occurred."}
          </p>
          <button
            onClick={() => reset()}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white py-2 px-3 rounded font-mono text-xs transition"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
