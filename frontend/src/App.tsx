import { useState } from "react";
import URLInput from "./components/URLInput";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAnalyze(url: string) {
    setError(null);
    setLoading(true);

    // TODO: connect to backend POST /analyze
    setTimeout(() => {
      setLoading(false);
      setError(`Backend not connected yet. Submitted: ${url}`);
    }, 1500);
  }

  return (
    <div className="app">
      <h1>3D Word Cloud</h1>
      <p>Enter a news article URL to visualize its topics.</p>
      <URLInput onSubmit={handleAnalyze} loading={loading} error={error} />
    </div>
  );
}

export default App;
