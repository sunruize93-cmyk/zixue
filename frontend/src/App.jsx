import { useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import PlanDisplay from "./components/PlanDisplay.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const styles = {
  page: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "2rem 1.25rem 4rem",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: "#1a1a1a",
  },
  header: { textAlign: "center", marginBottom: "2rem" },
  title: { fontSize: "2.5rem", margin: 0 },
  tagline: { color: "#555", marginTop: "0.5rem" },
  error: {
    background: "#fdecea",
    border: "1px solid #f5c2c0",
    color: "#a12622",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    margin: "1.5rem 0",
  },
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { plan, contributor }

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Zixue (自学)</h1>
        <p style={styles.tagline}>
          AI-powered study plan generator for international students.
          <br />
          消除留学生的信息差.
        </p>
      </header>

      <UploadForm onSubmit={handleSubmit} loading={loading} />

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {result && (
        <PlanDisplay plan={result.plan} contributor={result.contributor} />
      )}
    </div>
  );
}
