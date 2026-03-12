import { useState } from "react";
import URLInput from "./components/URLInput";
import WordCloudScene from "./components/WordCloudScene";
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
      if (data.words.length === 0) {
        throw new Error("Could not extract keywords from this article");
      }
      setWordData(data.words);
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
  }

  const showCloud = wordData.length > 0;

  function handleReset() {
    setWordData([]);
    setError(null);
  }

  return (
    <div className="app">
      <h1>3D Word Cloud</h1>
      {!showCloud && (
        <>
          <p>Enter a news article URL to visualize its topics.</p>
          <URLInput onSubmit={handleAnalyze} loading={loading} error={error} />
        </>
      )}
      {showCloud && (
        <>
          <button className="app__reset" onClick={handleReset}>
            &larr; Try another article
          </button>
          <WordCloudScene words={wordData} />
        </>
      )}
    </div>
  );
}

export default App;
