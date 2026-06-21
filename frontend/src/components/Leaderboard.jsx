import { useEffect, useState } from "react";

const styles = {
  panel: {
    background: "#fafafa",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "1.5rem",
  },
  intro: { color: "#666", fontSize: "0.9rem", marginTop: 0 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    padding: "0.8rem 1rem",
    marginBottom: "0.5rem",
  },
  rank: { fontWeight: 700, width: 36, color: "#c0392b" },
  uni: { flex: 1, fontWeight: 600 },
  count: { color: "#555", fontSize: "0.9rem" },
  empty: { color: "#888", textAlign: "center", padding: "1.5rem 0" },
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ apiUrl }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/leaderboard`)
      .then((r) => r.json())
      .then((d) => setRows(d.leaderboard))
      .catch((e) => setError(e.message));
  }, [apiUrl]);

  return (
    <div style={styles.panel}>
      <p style={styles.intro}>
        Universities ranked by how many study plans their community has
        contributed. / 各大学按贡献的学习计划数量排名。
      </p>
      {error && <div style={styles.empty}>⚠️ {error}</div>}
      {rows && rows.length === 0 && (
        <div style={styles.empty}>
          No contributions yet. / 还没有贡献。
        </div>
      )}
      {rows &&
        rows.map((r, i) => (
          <div key={r.university + i} style={styles.row}>
            <span style={styles.rank}>{MEDALS[i] || `#${i + 1}`}</span>
            <span style={styles.uni}>{r.university}</span>
            <span style={styles.count}>
              {r.count} {r.count === 1 ? "plan" : "plans"} / 份
            </span>
          </div>
        ))}
    </div>
  );
}
