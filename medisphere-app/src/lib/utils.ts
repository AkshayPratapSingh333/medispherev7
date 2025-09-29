// src/lib/utils.ts
import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";


/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Small helpers (optional, but handy) */
export const isBrowser = typeof window !== "undefined";

export function absoluteUrl(path = "/") {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (isBrowser ? window.location.origin : "http://localhost:3000");
  return new URL(path, base).toString();
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function formatDate(d: Date | string | number) {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function throttle<T extends (...args: any[]) => void>(fn: T, wait = 200) {
  let last = 0;
  let timer: any;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}
