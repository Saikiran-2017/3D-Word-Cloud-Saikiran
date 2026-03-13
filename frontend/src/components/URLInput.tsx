import { useState, FormEvent } from "react";
import "./URLInput.css";

const SAMPLE_URLS = [
  "https://www.npr.org/2026/03/06/nx-s1-5737460/in-one-week-war-has-swept-across-the-middle-east",
  "https://www.npr.org/2026/03/12/nx-s1-5736253/immigrant-truckers-trump-crackdown",
  "https://www.npr.org/2026/03/11/nx-s1-5719502/amid-u-s-china-chip-rivalry-open-standard-designers-warn-their-vision-is-at-risk",
];

interface URLInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string | null;
}

function URLInput({ onSubmit, loading, error }: URLInputProps) {
  const [url, setUrl] = useState(SAMPLE_URLS[0]!);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return;
    }
    onSubmit(trimmed);
  }

  const isValid =
    url.trim().startsWith("http://") || url.trim().startsWith("https://");

  return (
    <form className="url-input" onSubmit={handleSubmit}>
      <div className="url-input__field-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a news article URL..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !isValid}>
          {loading ? (
            <>
              <span className="url-input__spinner" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>

      {error && <p className="url-input__error">{error}</p>}

      <div className="url-input__samples">
        <span>Try:</span>
        {SAMPLE_URLS.map((sample, i) => (
          <button
            key={i}
            type="button"
            className="url-input__sample-link"
            onClick={() => setUrl(sample)}
            disabled={loading}
          >
            Sample {i + 1}
          </button>
        ))}
      </div>
    </form>
  );
}

export default URLInput;
