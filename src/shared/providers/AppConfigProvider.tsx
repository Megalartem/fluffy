"use client";

import * as React from "react";

export type AppLocale = "en" | "ru";
export type AppCurrency = "USD" | "EUR" | "RUB" | "VND" | string;

export type AppConfig = {
  locale: AppLocale;
  currency: AppCurrency;
  currencySymbol: string;
};

const DEFAULT_CONFIG: AppConfig = {
  locale: "en",
  currency: "USD",
  currencySymbol: "$",
};

const AppConfigContext = React.createContext<AppConfig | null>(null);

export function AppConfigProvider({
  value,
  children,
}: {
  value?: Partial<AppConfig>;
  children: React.ReactNode;
}) {
  const merged = React.useMemo<AppConfig>(
    () => ({ ...DEFAULT_CONFIG, ...(value ?? {}) }),
    [value]
  );

  return <AppConfigContext.Provider value={merged}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfig {
  const ctx = React.useContext(AppConfigContext);
  if (!ctx) {
    // чтобы не падать в story/test окружениях можно вернуть дефолт,
    // но лучше падать и явно оборачивать — реши как тебе удобнее
    return DEFAULT_CONFIG;
  }
  return ctx;
}