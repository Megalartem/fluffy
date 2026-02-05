import * as React from "react";
import { EmptyState } from "@/shared/ui/molecules";

export function CategoryListEmpty({ children }: { children?: React.ReactNode }) {
  if (children) return <>{children}</>;
  
  return (
    <EmptyState
      title="No categories yet"
      description="Create your first category to start organizing your transactions"
    />
  );
}
