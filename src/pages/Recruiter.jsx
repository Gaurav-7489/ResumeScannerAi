import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud, CheckCircle, Rocket, ChevronLeft,
  AlertCircle, CheckCircle2, FolderSearch, Search, X, Check, Sparkles
} from "lucide-react";
import "../styles/Recruiter.css";

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl.replace(/\/$/, "");
  if (window.location.hostname === "localhost") return "http://localhost:8000";
  return "https://resumescannerai-backend.onrender.com";
};

const API = getApiBase();

const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

const DOMAINS = [
  "Web Developer", "Backend Engineer", "Machine Learning", "Data Science",
  "UI/UX Designer", "DevOps Engineer", "Cloud Architect", "Cybersecurity",
  "Mobile Developer", "Blockchain Developer", "Full Stack Engineer",
  "Data Engineer", "QA Automation", "System Administrator", "AI Engineer",
  "Frontend Engineer", "Game Developer", "Product Manager",
  "Database Administrator", "Embedded Systems"
];

export default function Recruiter() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [role, setRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });
  const [errorCount, setErrorCount] = useState(0);
  const [jobDescription, setJobDescription] = useState("");

  const filteredDomains = useMemo(() => {
    return DOMAINS.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          const increment = prev < 30 ? 5 : prev < 70 ? 2 : 0.5;
          return prev + increment;
        });
      }, 200);
    } else {
      setProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const triggerToast = (msg, type) => {
    setToast({ show: true, msg, type });
    if (type === "error") {
      const newCount = errorCount + 1;
      setErrorCount(newCount);
      newCount > 2 ? playSound("fahh") : playSound("error");
    } else {
      setErrorCount(0);
      playSound("success");
    }
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 4000);
  };

  const processFiles = (uploadedFiles) => {
    const validFiles = Array.from(uploadedFiles).filter(f => !f.name.startsWith('.'));
    if (validFiles.length > 0) setFiles(validFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleSelectRole = (domain) => {
    setRole(domain);
    setSearchTerm(domain);
    setIsDropdownOpen(false);
    playSound("click");
  };

  const handleAnalyze = async () => {
    if (!role || !DOMAINS.includes(role)) return triggerToast("Please select a valid role.", "error");
    if (files.length === 0) return triggerToast("No resumes detected.", "error");

    setLoading(true);
    const formData = new FormData();
    formData.append("role", role);
    files.forEach(file => formData.append("files", file));
    if (jobDescription.trim() !== "") {
      formData.append("job_description", jobDescription);
    }

    try {
      const res = await fetch(`${API}/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProgress(100);
      localStorage.setItem("resultData", JSON.stringify(data));
      
      // Save recruiter scan to history!
      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      const newScan = {
        id: Date.now(),
        type: "recruiter",
        role: role,
        date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        candidatesCount: data.ranking?.length || 0,
        topScore: data.ranking?.[0]?.score || 0,
        grade: data.ranking?.[0]?.grade || "A",
        filename: `${files.length} Resumes`,
        fullData: data // Store data to restore later
      };
      localStorage.setItem("scanHistory", JSON.stringify([newScan, ...history].slice(0, 10)));

      triggerToast(`${data.ranking?.length || 0} resumes analyzed!`, "success");
      setTimeout(() => navigate("/analyzing", { state: data }), 800);
    } catch (e) {
      console.error(e);
      triggerToast("Connection failed. Check backend.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="recruiter-page">
      <div className="page-bg" />
      <div className="noise-overlay" />

      {toast.show && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="upload-card">
        <button className="back-btn-simple" onClick={() => { playSound("click2"); navigate("/type"); }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div className="card-header">
          <Sparkles size={20} color="var(--accent)" />
          <h2>Rank <span className="gradient-text">Engine</span></h2>
        </div>
        <p className="card-desc">Upload resumes to rank candidates with AI</p>

        <div className="input-group" ref={dropdownRef}>
          <label>Target Domain</label>
          <div className={`modern-search-wrapper ${isDropdownOpen ? 'active' : ''}`}>
            <Search size={18} className="search-glass" />
            <input
              type="text"
              placeholder="Enter job role keyword…"
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
                  <div className="search-no-results">"{searchTerm}" not found</div>
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
            placeholder="Paste your job description to score candidates directly against specific requirements..."
            style={{
              width: "100%",
              height: "100px",
              background: "var(--glass-highlight)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "0.8rem 1rem",
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
          <label>Resume Source</label>
          <div
            className={`upload-grid ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label className="upload-box">
              <input type="file" multiple onChange={(e) => processFiles(e.target.files)} hidden />
              <UploadCloud size={28} />
              <span>Import Files / ZIP</span>
            </label>
            <label className="upload-box">
              <input type="file" webkitdirectory="true" multiple onChange={(e) => processFiles(e.target.files)} hidden />
              <FolderSearch size={28} />
              <span>Full Folder</span>
            </label>
          </div>

          {files.length > 0 && !loading && (
            <div className="file-info-badge">
              <CheckCircle size={14} />
              {files.length} Files Ready
              <button onClick={() => setFiles([])}><X size={14} /></button>
            </div>
          )}
        </div>

        {loading && (
          <div className="progress-wrapper">
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="loading-text-sub">
              Analyzing {files.length} documents... {Math.round(progress)}%
            </span>
          </div>
        )}

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !role || files.length === 0}
        >
          {loading ? "SCANNING ASSETS..." : "START ANALYSIS"}
          {!loading && <Rocket size={20} />}
        </button>
      </div>
    </div>
  );
}