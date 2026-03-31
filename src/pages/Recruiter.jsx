import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UploadCloud, CheckCircle, Rocket, ChevronLeft, 
  AlertCircle, CheckCircle2, FolderSearch, Search, X, Check
} from "lucide-react";
import "../styles/Recruiter.css";

/* ================= API CONFIG (FIXED FOR LOCAL + PROD) ================= */

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:8000";
  }

  // 🔥 FIXED YOUR BACKEND URL HERE
  return "https://resumescannerai-backend.onrender.com";
};

const API = getApiBase();

/* ================= AUDIO ================= */

const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {}); 
};

const DOMAINS = [
  "Web Developer", "Backend Engineer", "Machine Learning", "Data Science", 
  "UI/UX Designer", "DevOps Engineer", "Cloud Architect", "Cybersecurity",
  "Mobile Developer", "Blockchain Developer", "Full Stack Engineer", 
  "Data Engineer", "QA Automation", "System Administrator"
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
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });
  const [errorCount, setErrorCount] = useState(0);

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
    if (validFiles.length > 0) {
      setFiles(validFiles);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSelectRole = (domain) => {
    setRole(domain);
    setSearchTerm(domain);
    setIsDropdownOpen(false);
    playSound("click");
  };

  const handleAnalyze = async () => {

    if (!role || !DOMAINS.includes(role)) {
      return triggerToast("Please select a valid known domain.", "error");
    }

    if (files.length === 0) {
      return triggerToast("No resumes or ZIP folders detected for analysis.", "error");
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("role", role);
    files.forEach(file => formData.append("files", file));

    try {

      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // 🔥 SAVE DATA (CRITICAL FIX)
      localStorage.setItem("resultData", JSON.stringify(data));

      triggerToast(`${files.length} Assets Staged!`, "success");

      setTimeout(() => {
        navigate("/analyzing", { state: data });
      }, 1000);

    } catch (err) {

      console.error("API ERROR:", err);
      triggerToast("Connection failed. Check FastAPI backend.", "error");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="recruiter-page">

      {toast.show && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === "error"
              ? <AlertCircle size={20} />
              : <CheckCircle2 size={20} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="upload-card production-card">

        <button
          className="back-btn-simple"
          onClick={() => {
            playSound("click2");
            navigate("/type");
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h2>
          Rank <span className="gradient-text">Engine</span>
        </h2>

        <div className="input-group" ref={dropdownRef}>

          <label>Target Domain</label>

          <div className={`modern-search-wrapper ${isDropdownOpen ? 'active' : ''}`}>

            <Search size={18} className="search-glass" />

            <input
              type="text"
              placeholder="Enter job role keyword…"
              value={searchTerm}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (role) setRole("");
              }}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                filteredDomains[0] &&
                handleSelectRole(filteredDomains[0])
              }
            />

            {searchTerm && (
              <X
                size={16}
                className="clear-search"
                onClick={() => {
                  setSearchTerm("");
                  setRole("");
                }}
              />
            )}

            {isDropdownOpen && (

              <div className="search-results-floating">

                {filteredDomains.length > 0 ? (

                  filteredDomains.map(d => (

                    <div
                      key={d}
                      className="search-item"
                      onClick={() => handleSelectRole(d)}
                    >
                      {d}

                      {role === d &&
                        <Check size={14}
                          style={{
                            marginLeft: 'auto',
                            color: 'var(--accent)'
                          }}
                        />
                      }

                    </div>

                  ))

                ) : (

                  <div className="search-no-results">

                    "<span>{searchTerm}</span>" unknown specialization

                  </div>

                )}

              </div>

            )}

          </div>

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

              <input
                type="file"
                multiple
                onChange={(e) => processFiles(e.target.files)}
                hidden
              />

              <UploadCloud size={30} />

              <span>Import Files / ZIP</span>

            </label>

            <label className="upload-box">

              <input
                type="file"
                webkitdirectory="true"
                multiple
                onChange={(e) => processFiles(e.target.files)}
                hidden
              />

              <FolderSearch size={30} />

              <span>Full Folder</span>

            </label>

          </div>

          {files.length > 0 && (

            <div className="file-info-badge">

              <CheckCircle size={14} />

              {files.length} Files Ready

              <button onClick={() => setFiles([])}>
                <X size={14} />
              </button>

            </div>

          )}

        </div>

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !role || files.length === 0}
        >

          {loading ? "PROCESSING..." : "START ANALYSIS"}

          {!loading && <Rocket size={20} />}

        </button>

      </div>

    </div>
  );
}