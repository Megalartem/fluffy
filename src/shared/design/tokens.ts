// src/shared/design/tokens.ts
// Design tokens (v1). Single source of truth for design system.
// CSS variables are defined in tokens.css; this file provides TS values for JS logic.

export const tokens = {
  color: {
    primary: "#A577FF",
    accent: "#150A35",
    secondary: "#6F649B",

    backgroundMain: "#F7F6FC",
    backgroundCard: "#F6F7FB",
    backgroundSubtitleBorder: "#F7F7FC",

    textPrimary: "#34266C",
    textSecondary: "#6F649B",
    textOnPrimary: "#FFFFFF",

    statusSuccess: "#A577FF",
    statusWarning: "#FDB641",
    statusError: "#F9725B",
  },

  text: {
    sizeS: 12,
    sizeM: 16,
    sizeL: 20,
    sizeXl: 32,

    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,
  },

  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },

  borderRadius: {
    regular: 18,
    rounded: 999,
    fab: 24,
  },

  shadow: {
    card: "0 4px 16px rgba(21, 10, 53, 0.06)",
    fab: "0 4px 4px rgba(21, 10, 53, 0.25)",
  },

  zIndex: {
    dropdown: 1000,
    modal: 1100,
    tooltip: 1200,
    fab: 100,
  },

  padding: {
    default: "16px 8px",
    card: 16,
    bottomSheet: 20,
  },
} as const;

export type Tokens = typeof tokens;