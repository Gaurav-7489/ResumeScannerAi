import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserSearch, Sparkles, Clock, Trash2, ChevronRight, BarChart } from "lucide-react";
import "../styles/UserType.css";

const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

export default function UserType() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem("scanHistory") || "[]"));
  }, []);

  const handleNavigation = (path, soundType = "click") => {
    playSound(soundType);
    navigate(path);
  };

  const handleRestoreScan = (scan) => {
    playSound("click");
    if (scan.type === "recruiter") {
      localStorage.setItem("resultData", JSON.stringify(scan.fullData));
      navigate("/result", { state: scan.fullData });
    } else {
      navigate("/seeker", { state: { result: scan.result, role: scan.role } });
    }
  };

  const handleClearHistory = (e) => {
    e.stopPropagation();
    playSound("click2");
    if (confirm("Are you sure you want to clear your scan history?")) {
      localStorage.removeItem("scanHistory");
      setHistory([]);
    }
  };

  return (
    <div className="identity-page" style={{ flexDirection: "column", gap: "2rem", paddingBottom: "4rem" }}>
      <div className="page-bg" />
      <div className="noise-overlay" />

      <div className="identity-content">
        <div className="identity-badge">
          <Sparkles size={14} />
          SELECT YOUR WORKSPACE
        </div>

        <h1>Choose workspace <span className="gradient-text">type</span></h1>
        <p className="identity-subtitle">Select recruiter workspace or job seeker analyzer</p>

        <div className="identity-grid">
          <div
            className="identity-card recruiter"
            onClick={() => handleNavigation("/recruiter", "click")}
          >
            <div className="card-glow" />
            <div className="card-icon recruiter-icon">
              <Users size={36} />
            </div>
            <h3>Recruiter Mode</h3>
            <p>Upload multiple resumes and rank candidates for any role with AI-powered scoring.</p>
            <div className="card-tag">Multi-Resume Analysis</div>
          </div>

          <div
            className="identity-card seeker"
            onClick={() => handleNavigation("/seeker", "click")}
          >
            <div className="card-glow seeker-glow" />
            <div className="card-icon seeker-icon">
              <UserSearch size={36} />
            </div>
            <h3>Job Seeker Mode</h3>
            <p>Check how well your resume matches a specific job role and get improvement tips.</p>
            <div className="card-tag">Single Resume Check</div>
          </div>
        </div>

        {/* SCAN HISTORY DRAWER / COMPONENT */}
        {history.length > 0 && (
          <div 
            className="glass-card" 
            style={{ 
              marginTop: "3rem", 
              width: "100%", 
              maxWidth: "750px", 
              padding: "2rem", 
              textAlign: "left",
              animation: "fadeSlideIn 0.7s ease-out both" 
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={20} color="var(--accent)" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0 }}>Recent Scans</h3>
              </div>
              <button 
                onClick={handleClearHistory} 
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "var(--text-muted)", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  fontSize: "0.8rem",
                  transition: "var(--transition)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <Trash2 size={14} /> Clear History
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {history.map((scan) => (
                <div 
                  key={scan.id} 
                  onClick={() => handleRestoreScan(scan)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.03)";
                    e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div 
                      style={{ 
                        width: "36px", 
                        height: "36px", 
                        borderRadius: "10px", 
                        background: scan.type === "recruiter" ? "rgba(59, 130, 246, 0.08)" : "rgba(6, 182, 212, 0.08)",
                        color: scan.type === "recruiter" ? "var(--accent)" : "var(--accent-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {scan.type === "recruiter" ? <Users size={16} /> : <UserSearch size={16} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", margin: 0 }}>{scan.role}</h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {scan.type === "recruiter" ? `Recruiter Workspace • ${scan.filename}` : `Job Seeker Check • ${scan.filename}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>{scan.date}</span>
                      <span 
                        style={{ 
                          fontSize: "0.85rem", 
                          fontWeight: "800",
                          color: scan.type === "recruiter" ? "var(--accent-secondary)" : "var(--accent-pink)" 
                        }}
                      >
                        {scan.type === "recruiter" ? `Top Score: ${scan.topScore}%` : `Score: ${scan.score}%`}
                      </span>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p
          onClick={() => handleNavigation("/", "click2")}
          className="back-link"
        >
          ← Go Back Home
        </p>
      </div>
    </div>
  );
}