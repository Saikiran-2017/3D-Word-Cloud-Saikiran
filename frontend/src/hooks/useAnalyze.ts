import { useState, useCallback } from "react";
import type { WordScore } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface UseAnalyzeResult {
  data: WordScore[];
  loading: boolean;
  error: string | null;
  analyze: (url: string) => Promise<void>;
  reset: () => void;
}

export function useAnalyze(): UseAnalyzeResult {
  const [data, setData] = useState<WordScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (url: string) => {
    setError(null);
    setData([]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `Request failed (${res.status})`);
      }

      const json: { words: WordScore[] } = await res.json();
      if (json.words.length === 0) {
        throw new Error("Could not extract keywords from this article");
      }
      setData(json.words);
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Could not reach the server. Is the backend running?");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return { data, loading, error, analyze, reset };
}
