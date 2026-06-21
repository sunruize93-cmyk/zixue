import { useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import PlanDisplay from "./components/PlanDisplay.jsx";
import Library from "./components/Library.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

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
  header: { textAlign: "center", marginBottom: "1.5rem" },
  title: { fontSize: "2.5rem", margin: 0 },
  tagline: { color: "#555", marginTop: "0.5rem" },
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  tab: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 999,
    padding: "0.45rem 1.1rem",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  tabActive: {
    background: "#c0392b",
    color: "#fff",
    borderColor: "#c0392b",
  },
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
  const [tab, setTab] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { plan, contributor, cached }

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
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Open a plan from the Library tab.
  async function openPlan(planId) {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/plans/${planId}`);
      if (!res.ok) throw new Error(`Failed to load plan (${res.status})`);
      const data = await res.json();
      setResult({ ...data, cached: true });
      setTab("generate");
    } catch (err) {
      setError(err.message);
    }
  }

  const tabs = [
    { id: "generate", label: "Generate / 生成" },
    { id: "library", label: "Library / 合集" },
    { id: "leaderboard", label: "Leaderboard / 榜单" },
  ];

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

      <nav style={styles.nav}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {tab === "generate" && (
        <>
          <UploadForm onSubmit={handleSubmit} loading={loading} />
          {result && (
            <PlanDisplay
              plan={result.plan}
              contributor={result.contributor}
              cached={result.cached}
            />
          )}
        </>
      )}

      {tab === "library" && <Library apiUrl={API_URL} onOpen={openPlan} />}

      {tab === "leaderboard" && <Leaderboard apiUrl={API_URL} />}
    </div>
  );
}
