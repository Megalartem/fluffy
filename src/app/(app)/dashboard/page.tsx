"use client";

import { useEffect, useState } from "react";
import { WorkspaceService } from "@/shared/config/workspace";
import { DexieSettingsRepo } from "@/features/settings/api/repo.dexie";
import { BootstrapService } from "@/features/settings/model/bootstrap";


type State =
  | { status: "idle" | "loading" }
  | { status: "ready"; workspaceId: string; currency: string; locale: string }
  | { status: "error"; message: string };

export default function DashboardPage() {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setState({ status: "loading" });

        const bootstrap = new BootstrapService(
          new WorkspaceService(),
          new DexieSettingsRepo()
        );

        const { workspaceId, settings } = await bootstrap.init();

        if (cancelled) return;

        setState({
          status: "ready",
          workspaceId,
          currency: settings.defaultCurrency,
          locale: settings.locale,
        });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Unknown error",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading" || state.status === "idle") {
    return <div className="p-6">Loading…</div>;
  }

  if (state.status === "error") {
    return <div className="p-6">Error: {state.message}</div>;
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="rounded-2xl border p-4">
        <div className="text-sm opacity-70">Workspace</div>
        <div className="font-medium">{state.status == "ready" && state.workspaceId}</div>
      </div>
      <div className="rounded-2xl border p-4">
        <div className="text-sm opacity-70">Settings</div>
        <div className="mt-1">Currency: <b>{state.status == "ready" &&state.currency}</b></div>
        <div>Locale: <b>{state.status == "ready" &&state.locale}</b></div>
      </div>
      <div className="text-sm opacity-70">
        (Это Slice 1: Dexie + ws_local + settings init)
      </div>
    </div>
  );
}
