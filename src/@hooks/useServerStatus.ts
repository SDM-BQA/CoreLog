import { useEffect, useState } from "react";
import { api_configs } from "../@configs/api.configs";

export type ServerStatus = "checking" | "operational" | "degraded" | "unreachable";

const POLL_MS = 60_000;
const TIMEOUT_MS = 10_000;

export const useServerStatus = (): ServerStatus => {
  const [status, setStatus] = useState<ServerStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(`${api_configs.server_url}/health`, { signal: controller.signal });
        if (cancelled) return;
        if (res.ok) setStatus("operational");
        else if (res.status === 503) setStatus("degraded");
        else setStatus("unreachable");
      } catch {
        if (!cancelled) setStatus("unreachable");
      } finally {
        clearTimeout(timer);
      }
    };

    check();
    const id = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return status;
};
