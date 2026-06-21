import { useEffect, useState } from "react";

const styles = {
  panel: {
    background: "#fafafa",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "1.5rem",
  },
  intro: { color: "#666", fontSize: "0.9rem", marginTop: 0 },
  item: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    padding: "0.9rem 1rem",
    marginBottom: "0.6rem",
    cursor: "pointer",
  },
  course: { fontWeight: 600, fontSize: "1rem" },
  meta: { color: "#666", fontSize: "0.85rem", marginTop: "0.25rem" },
  empty: { color: "#888", textAlign: "center", padding: "1.5rem 0" },
};

export default function Library({ apiUrl, onOpen }) {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/plans`)
      .then((r) => r.json())
      .then((d) => setPlans(d.plans))
      .catch((e) => setError(e.message));
  }, [apiUrl]);

  return (
    <div style={styles.panel}>
      <p style={styles.intro}>
        Every plan ever generated lives here. Opening one is free — it never
        calls the API. / 所有生成过的计划都在这里,打开任意一份都不消耗 API。
      </p>
      {error && <div style={styles.empty}>⚠️ {error}</div>}
      {plans && plans.length === 0 && (
        <div style={styles.empty}>
          No plans yet — generate the first one! / 还没有计划,快来生成第一份!
        </div>
      )}
      {plans &&
        plans.map((p) => (
          <button key={p.id} style={styles.item} onClick={() => onOpen(p.id)}>
            <div style={styles.course}>
              {p.course_code} · {p.course_name}
            </div>
            <div style={styles.meta}>
              {p.university}
              {p.professor ? ` · ${p.professor}` : ""}
              {p.semester ? ` · ${p.semester}` : ""}
              {p.contributor ? ` · @${p.contributor}` : ""}
            </div>
          </button>
        ))}
    </div>
  );
}
