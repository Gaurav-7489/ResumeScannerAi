import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UploadCloud, ChevronLeft, Search, X, Check, Sparkles,
  FileText, Target, Award, Mail, Phone, Link2, Globe,
  Info, CheckCircle, AlertTriangle, Languages, BarChart3, HelpCircle
} from "lucide-react";
import "../styles/Seeker.css";

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl.replace(/\/$/, "");
  if (window.location.hostname === "localhost") return "http://localhost:8000";
  return "https://resumescannerai-backend.onrender.com";
};

const API = getApiBase();

const DOMAINS = [
  "Web Developer", "Backend Engineer", "Machine Learning", "Data Science",
  "UI/UX Designer", "DevOps Engineer", "Cloud Architect", "Cybersecurity",
  "Mobile Developer", "Blockchain Developer", "Full Stack Engineer",
  "Data Engineer", "QA Automation", "System Administrator", "AI Engineer",
  "Frontend Engineer", "Game Developer", "Product Manager",
  "Database Administrator", "Embedded Systems", "Data Analyst",
  "DevSecOps Engineer", "Solutions Architect", "Business Analyst",
  "Systems Engineer"
];

const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

export default function Seeker() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [role, setRole] = useState(() => location.state?.role || "");
  const [searchTerm, setSearchTerm] = useState(() => location.state?.role || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => location.state?.result || null);

  const filteredDomains = useMemo(() => {
    return DOMAINS.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectRole = (domain) => {
    setRole(domain);
    setSearchTerm(domain);
    setIsDropdownOpen(false);
    playSound("click");
  };

  const handleAnalyze = async () => {
    if (!role || !file) return;
    setLoading(true);
    setResult(null);
    playSound("click2");

    const formData = new FormData();
    formData.append("role", role);
    formData.append("files", file);
    if (jobDescription.trim() !== "") {
      formData.append("job_description", jobDescription);
    }

    try {
      const res = await fetch(`${API}/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.ranking && data.ranking.length > 0) {
        const candidate = data.ranking[0];
        setResult(candidate);
        
        // Save scan to local history
        const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
        const newScan = {
          id: Date.now(),
          type: "seeker",
          role: role,
          candidateName: candidate.candidate_name || "You",
          date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          score: candidate.score,
          atsScore: candidate.ats_score || 70,
          grade: candidate.grade,
          filename: file.name,
          result: candidate
        };
        localStorage.setItem("scanHistory", JSON.stringify([newScan, ...history].slice(0, 10)));
        
        playSound("success");
      }
    } catch (e) {
      console.error(e);
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "#10b981";
    if (grade === "B+" || grade === "B") return "#06b6d4";
    if (grade === "C") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="seeker-page">
      <div className="page-bg" />
      <div className="noise-overlay" />

      <div className="seeker-container" style={{ maxWidth: result ? "960px" : "580px", transition: "all 0.5s ease" }}>
        <button className="back-btn" onClick={() => { playSound("click2"); navigate("/type"); }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div className="seeker-header">
          <Target size={24} color="var(--accent-secondary)" />
          <h2>Resume <span className="gradient-text">Intelligence Check</span></h2>
        </div>
        <p className="seeker-desc">Analyze your resume against a target role and job description for ATS optimization</p>

        <div style={{ display: "flex", gap: "2rem", flexDirection: result ? "row" : "column", flexWrap: "wrap" }}>
          
          {/* INPUT FORM COLUMN */}
          <div style={{ flex: "1 1 450px" }}>
            <div className="input-group" ref={dropdownRef}>
              <label>Target Job Role</label>
              <div className={`modern-search-wrapper ${isDropdownOpen ? 'active' : ''}`}>
                <Search size={18} className="search-glass" />
                <input
                  type="text"
                  placeholder="Search for your target role (e.g. Full Stack Engineer)…"
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => { setSearchTerm(e.target.value); if (role) setRole(""); }}
                  onKeyDown={(e) => e.key === 'Enter' && filteredDomains[0] && handleSelectRole(filteredDomains[0])}
                />
                {searchTerm && <X size={16} className="clear-search" onClick={() => { setSearchTerm(""); setRole(""); }} />}
                {isDropdownOpen && (
                  <div className="search-results-floating">
                    {filteredDomains.length > 0 ? (
                      filteredDomains.map(d => (
                        <div key={d} className="search-item" onClick={() => handleSelectRole(d)}>
                          {d}
                          {role === d && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />}
                        </div>
                      ))
                    ) : (
                      <div className="search-no-results">No matching role found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="input-group">
              <label>Job Description (Optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target Job Description to check exact keyword and skill match percentage..."
                style={{
                  width: "100%",
                  height: "120px",
                  background: "var(--glass-highlight)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                  transition: "var(--transition)"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            <div className="input-group">
              <label>Upload Resume</label>
              {file ? (
                <div className="upload-single" style={{ cursor: "default" }}>
                  <div className="file-selected">
                    <FileText size={20} color="var(--accent)" />
                    <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "250px" }}>{file.name}</span>
                    <X size={14} onClick={() => setFile(null)} className="remove-file" />
                  </div>
                </div>
              ) : (
                <label className="upload-single">
                  <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} hidden />
                  <UploadCloud size={28} color="var(--text-muted)" />
                  <span>Drop your resume here (PDF / DOCX)</span>
                </label>
              )}
            </div>

            <button className="analyze-btn" onClick={handleAnalyze} disabled={loading || !role || !file}>
              {loading ? "SCANNINNG & ANALYZING..." : "ANALYZE RESUME"}
              {!loading && <Sparkles size={18} />}
            </button>
          </div>

          {/* RESULT DISPLAY COLUMN */}
          {result && (
            <div className="seeker-result" style={{ flex: "1 1 450px", marginTop: 0 }}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                {/* Grade Card */}
                <div className="result-grade" style={{ flex: 1, borderColor: getGradeColor(result.grade), marginBottom: 0, padding: "1.2rem" }}>
                  <span className="grade-label">MATCH GRADE</span>
                  <span className="grade-value" style={{ color: getGradeColor(result.grade), fontSize: "3rem" }}>{result.grade}</span>
                  <span className="grade-score">{result.score}/100</span>
                </div>

                {/* ATS Circle Card */}
                <div className="result-grade" style={{ flex: 1, borderColor: "var(--accent-secondary)", marginBottom: 0, padding: "1.2rem" }}>
                  <span className="grade-label">ATS SCORE</span>
                  <div style={{ position: "relative", width: "70px", height: "70px", margin: "0.5rem 0" }}>
                    <svg width="70" height="70" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="var(--accent-secondary)"
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset={100 - (result.ats_score || 70)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: "800" }}>
                      {result.ats_score || 70}%
                    </div>
                  </div>
                  <span className="grade-score">ATS Compatibility</span>
                </div>
              </div>

              <div className="result-details">
                {/* Candidate Overview Card */}
                <div className="glass-card" style={{ padding: "1.2rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "8px" }}>
                    <Info size={16} color="var(--accent)" />
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.05em" }}>CANDIDATE INFORMATION</span>
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "8px" }}>{result.candidate_name}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem" }}>
                    {result.email && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Mail size={14} /> {result.email}</div>}
                    {result.phone && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Phone size={14} /> {result.phone}</div>}
                    {result.linkedin && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Link2 size={14} /> <a href={result.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-secondary)", textDecoration: "none" }}>LinkedIn</a></div>}
                    {result.github && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Globe size={14} /> <a href={result.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-secondary)", textDecoration: "none" }}>GitHub</a></div>}
                  </div>
                </div>

                {/* Job Summary */}
                <p className="result-summary" style={{ fontSize: "0.85rem" }}>{result.summary}</p>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="detail-row">
                    <span className="detail-label">Experience</span>
                    <span className="detail-value">{result.experience_level} ({result.experience_years || 0} yrs)</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Projects</span>
                    <span className="detail-value">{result.projects_count} mentioned</span>
                  </div>
                </div>

                {/* Languages Section */}
                <div className="glass-card" style={{ padding: "1.2rem", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                    <Languages size={16} color="var(--accent-secondary)" />
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.05em" }}>LANGUAGES</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>PROGRAMMING</span>
                      <span>{result.programming_languages?.length > 0 ? result.programming_languages.join(", ") : "None detected"}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>SPOKEN</span>
                      <span>{result.spoken_languages?.length > 0 ? result.spoken_languages.join(", ") : "English"}</span>
                    </div>
                  </div>
                </div>

                {/* Job Description Specific Analysis */}
                {result.jd_analysis && (
                  <div className="glass-card" style={{ padding: "1.2rem", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "8px" }}>
                      <BarChart3 size={16} color="var(--accent-pink)" />
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.05em" }}>JOB DESCRIPTION FIT ({result.jd_analysis.match_score}%)</span>
                    </div>
                    
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>MATCHING SKILLS ({result.jd_analysis.matching_skills?.length || 0})</span>
                      <div className="skill-tags">
                        {result.jd_analysis.matching_skills?.length > 0 ? (
                          result.jd_analysis.matching_skills.map((s, i) => (
                            <span key={i} className="skill-tag" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981" }}>{s}</span>
                          ))
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>None matching</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>MISSING CRITICAL SKILLS ({result.jd_analysis.missing_skills?.length || 0})</span>
                      <div className="skill-tags">
                        {result.jd_analysis.missing_skills?.length > 0 ? (
                          result.jd_analysis.missing_skills.map((s, i) => (
                            <span key={i} className="skill-tag" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>{s}</span>
                          ))
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#10b981" }}>No missing skills! Excellent matching.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses Feedback */}
                {result.strengths?.length > 0 && (
                  <div className="feedback-section">
                    <h4 className="feedback-title good" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle size={14} /> Strengths
                    </h4>
                    {result.strengths.slice(0, 4).map((s, i) => <p key={i} className="feedback-item">{s}</p>)}
                  </div>
                )}

                {result.weaknesses?.length > 0 && (
                  <div className="feedback-section">
                    <h4 className="feedback-title bad" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertTriangle size={14} /> Areas to Optimize
                    </h4>
                    {result.weaknesses.slice(0, 4).map((w, i) => <p key={i} className="feedback-item warn">{w}</p>)}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
