"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import CommandSimulatorModal from "@/components/dashboard/CommandSimulatorModal";
import CommandPaletteModal from "@/components/dashboard/CommandPaletteModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState("ALL");
  const [servers, setServers] = useState<any[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    // 1. Verify Authentication First
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.authenticated) {
          router.push("/login");
          return;
        }

        setAuthenticated(true);
        setLoading(false);

        // Fetch Servers List
        fetch("/api/servers")
          .then((r) => r.json())
          .then((srvData) => {
            if (srvData.servers) setServers(srvData.servers);
          })
          .catch(() => {});

        // Connect SSE only after successful authentication
        eventSource = new EventSource("/api/dashboard/sse");
        eventSource.onopen = () => setSseConnected(true);
        eventSource.onerror = () => setSseConnected(false);
      })
      .catch(() => {
        router.push("/login");
      });

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center p-4 font-mono text-xs gap-2">
        <span className="w-3 h-3 border-2 border-[#5865f2] border-t-transparent rounded-full animate-spin" />
        <span>Authenticating session & loading CommandOps control plane...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      <Header
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenCommandPalette={() => setPaletteOpen(true)}
        sseConnected={sseConnected}
        selectedServerId={selectedServerId}
        onServerSelect={setSelectedServerId}
        servers={servers}
      />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl mx-auto w-full space-y-5">
          {children}
        </main>
      </div>

      <CommandSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        onCommandTriggered={() => {}}
      />

      <CommandPaletteModal
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenSimulator={() => setSimulatorOpen(true)}
      />
    </div>
  );
}
