import { useState } from "react";

const DOC_TYPES = ["syllabus", "past exam", "lecture notes"];

const styles = {
  form: {
    background: "#fafafa",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: "1.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  field: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.85rem", fontWeight: 600, color: "#333" },
  input: {
    padding: "0.55rem 0.65rem",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: "0.95rem",
  },
  section: { marginTop: "1.5rem" },
  fileRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  removeBtn: {
    border: "none",
    background: "#eee",
    borderRadius: 6,
    cursor: "pointer",
    padding: "0.35rem 0.6rem",
  },
  addBtn: {
    border: "1px dashed #aaa",
    background: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    padding: "0.5rem 0.9rem",
    marginTop: "0.5rem",
  },
  submit: {
    marginTop: "1.5rem",
    width: "100%",
    padding: "0.8rem",
    border: "none",
    borderRadius: 8,
    background: "#c0392b",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  submitDisabled: { background: "#999", cursor: "not-allowed" },
};

const META_FIELDS = [
  { name: "university", label: "University *", required: true },
  { name: "course_code", label: "Course code *", required: true },
  { name: "course_name", label: "Course name *", required: true },
  { name: "department", label: "Department", required: false },
  { name: "professor", label: "Professor", required: false },
  { name: "semester", label: "Semester", required: false },
  { name: "contributor", label: "Contributor username", required: false },
];

export default function UploadForm({ onSubmit, loading }) {
  const [meta, setMeta] = useState({
    university: "",
    course_code: "",
    course_name: "",
    department: "",
    professor: "",
    semester: "",
    contributor: "",
  });
  // Each entry: { type, file }
  const [uploads, setUploads] = useState([{ type: "syllabus", file: null }]);
  const [forceRegenerate, setForceRegenerate] = useState(false);

  function updateMeta(name, value) {
    setMeta((m) => ({ ...m, [name]: value }));
  }

  function updateUpload(index, patch) {
    setUploads((list) =>
      list.map((u, i) => (i === index ? { ...u, ...patch } : u)),
    );
  }

  function addUpload() {
    setUploads((list) => [...list, { type: "lecture notes", file: null }]);
  }

  function removeUpload(index) {
    setUploads((list) => list.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(meta).forEach(([k, v]) => formData.append(k, v));
    uploads.forEach((u) => {
      if (u.file) {
        formData.append("files", u.file);
        formData.append("file_types", u.type);
      }
    });
    formData.append("force_regenerate", forceRegenerate ? "true" : "false");
    onSubmit(formData);
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.grid}>
        {META_FIELDS.map((f) => (
          <div key={f.name} style={styles.field}>
            <label style={styles.label} htmlFor={f.name}>
              {f.label}
            </label>
            <input
              id={f.name}
              style={styles.input}
              value={meta[f.name]}
              required={f.required}
              onChange={(e) => updateMeta(f.name, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Documents (PDF)</label>
        <p style={{ fontSize: "0.8rem", color: "#666", margin: "0.25rem 0 0.75rem" }}>
          Upload a syllabus, past exams, or lecture notes — label each one so
          the AI knows how to use it.
        </p>
        {uploads.map((u, i) => (
          <div key={i} style={styles.fileRow}>
            <select
              style={styles.input}
              value={u.type}
              onChange={(e) => updateUpload(i, { type: e.target.value })}
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                updateUpload(i, { file: e.target.files[0] || null })
              }
            />
            {uploads.length > 1 && (
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => removeUpload(i)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" style={styles.addBtn} onClick={addUpload}>
          + Add another document
        </button>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "1.25rem",
          fontSize: "0.85rem",
          color: "#555",
        }}
      >
        <input
          type="checkbox"
          checked={forceRegenerate}
          onChange={(e) => setForceRegenerate(e.target.checked)}
        />
        Force regenerate (bypass the library and call the API again) / 强制重新生成(绕过合集,重新调用 API)
      </label>

      <button
        type="submit"
        disabled={loading}
        style={{ ...styles.submit, ...(loading ? styles.submitDisabled : {}) }}
      >
        {loading ? "Generating your plan…" : "Generate study plan / 生成学习计划"}
      </button>
    </form>
  );
}
