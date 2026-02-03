import * as React from "react";
import type { Transaction } from "../model/types";
import type { ITransactionsRepository } from "@/core/repositories";

export function useTransaction(params: {
  workspaceId: string;
  id: string | null;
  repo: ITransactionsRepository;
}) {
  const { workspaceId, id, repo } = params;
  // TODO: useWorkspace hook for workspaceId

  const [data, setData] = React.useState<Transaction | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await repo.getById(workspaceId, id);
      setData(tx);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id, repo, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}