import URLInput from "./components/URLInput";
import WordCloudScene from "./components/WordCloudScene";
import { useAnalyze } from "./hooks/useAnalyze";
import "./App.css";

function App() {
  const { data, loading, error, analyze, reset } = useAnalyze();

  const showCloud = data.length > 0;

  return (
    <div className="app">
      <h1>3D Word Cloud</h1>
      {!showCloud && (
        <>
          <p>Enter a news article URL to visualize its topics.</p>
          <URLInput onSubmit={analyze} loading={loading} error={error} />
        </>
      )}
      {showCloud && (
        <>
          <button className="app__reset" onClick={reset}>
            &larr; Try another article
          </button>
          <WordCloudScene words={data} />
        </>
      )}
    </div>
  );
}

export default App;
