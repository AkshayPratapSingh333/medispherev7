export const CHAT_UNREAD_KEY = "chat_unread_count";
export const CHAT_UNREAD_EVENT = "chat-unread:update";

export function getChatUnreadCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(CHAT_UNREAD_KEY);
  const num = raw ? Number(raw) : 0;
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function publishChatUnread(count: number) {
  window.dispatchEvent(
    new CustomEvent(CHAT_UNREAD_EVENT, {
      detail: { count },
    })
  );
}

export function setChatUnreadCount(count: number) {
  if (typeof window === "undefined") return;
  const safeCount = Math.max(0, Math.floor(count));
  window.localStorage.setItem(CHAT_UNREAD_KEY, String(safeCount));
  publishChatUnread(safeCount);
}

export function incrementChatUnreadCount() {
  setChatUnreadCount(getChatUnreadCount() + 1);
}

export function clearChatUnreadCount() {
  setChatUnreadCount(0);
}
