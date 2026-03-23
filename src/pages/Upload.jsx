import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#111827",
          padding: 40,
          borderRadius: 12,
          width: 500,
          textAlign: "center",
        }}
      >
        <h1>AI Resume Scanner</h1>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        <button
          onClick={handleUpload}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Upload Resume
        </button>

        {result && (
          <div style={{ marginTop: 20, textAlign: "left" }}>
            <h3>Skills</h3>
            <p>{result.skills?.join(", ")}</p>

            <h3>Preview</h3>
            <p>{result.preview}</p>
          </div>
        )}
      </div>
    </div>
  );
}