import * as React from "react";
import { ensureSampleTransactionsSeeded } from "../model/seed";
import { cleanupOldMockData } from "../model/cleanup";
import { createDomainLogger } from "@/shared/logging/logger";

const logger = createDomainLogger("transactions:bootstrap");

export function useTransactionsBootstrap(params: {
  workspaceId: string;
  enabled: boolean;
}) {
  const { workspaceId, enabled } = params;
  const didBootstrapRef = React.useRef(false);

  React.useEffect(() => {
    didBootstrapRef.current = false;
  }, [workspaceId]);

  React.useEffect(() => {
    if (!enabled || didBootstrapRef.current) return;
    didBootstrapRef.current = true;

    void (async () => {
      try {
        await cleanupOldMockData();
        await ensureSampleTransactionsSeeded(workspaceId);
      } catch (error) {
        logger.warn("bootstrap failed", {
          workspaceId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();
  }, [enabled, workspaceId]);
}
