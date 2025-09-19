// hooks/use-async.ts
import { useCallback, useState } from "react";

export function useAsync<TArgs extends any[], TResult>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const run = useCallback(async (fn: (...args: TArgs) => Promise<TResult>, ...args: TArgs) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      setResult(res);
      return res;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, run };
}
