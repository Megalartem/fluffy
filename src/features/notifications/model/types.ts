export type NoticeLevel = "info" | "warn" | "danger";

export type Notice = {
  id: string;
  level: NoticeLevel;
  title: string;
  message: string;
  dismissKey: string; // meta key to write on dismiss
  dismissValue: string;
};
