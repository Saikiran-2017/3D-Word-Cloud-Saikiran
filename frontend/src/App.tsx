import { useState } from "react";
import URLInput from "./components/URLInput";
import type { WordScore } from "./types";
import "./App.css";

const API_BASE = "http://localhost:8000";

function App() {
  const [wordData, setWordData] = useState<WordScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(url: string) {
    setError(null);
    setWordData([]);
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

      const data: { words: WordScore[] } = await res.json();
      setWordData(data.words);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>3D Word Cloud</h1>
      <p>Enter a news article URL to visualize its topics.</p>
      <URLInput onSubmit={handleAnalyze} loading={loading} error={error} />
      {wordData.length > 0 && (
        <p className="app__word-count">{wordData.length} keywords extracted</p>
      )}
    </div>
  );
}

export default App;
