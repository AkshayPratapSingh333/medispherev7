// hooks/use-debounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, wait = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), wait);
    return () => clearTimeout(id);
  }, [value, wait]);
  return debounced;
}
