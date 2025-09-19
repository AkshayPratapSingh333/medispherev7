// hooks/use-geolocation.ts
"use client";
import { useEffect, useState } from "react";

export function useGeolocation(options?: PositionOptions) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setPosition(pos),
      (err) => setError(err.message),
      options ?? {}
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [options]);

  return { position, error };
}
