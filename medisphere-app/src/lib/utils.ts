// lib/utils.ts
export function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDateISO(d?: string | Date) {
  if (!d) return "";
  return new Date(d).toISOString();
}

export function nowISO() {
  return new Date().toISOString();
}
