import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UploadCloud, CheckCircle, Rocket, ChevronLeft, 
  AlertCircle, CheckCircle2, FolderSearch, Search, X 
} from "lucide-react";
import "../styles/Recruiter.css";

// Audio Engine
const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => console.log("Audio interaction required"));
};

// Production Domain List
const DOMAINS = [
  "Web Developer", "Backend Engineer", "Machine Learning", "Data Science", 
  "UI/UX Designer", "DevOps Engineer", "Cloud Architect", "Cybersecurity",
  "Mobile Developer", "Blockchain Developer", "Full Stack Engineer", 
  "Data Engineer", "QA Automation", "System Administrator"
];

export default function Recruiter() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });
  
  const dropdownRef = useRef(null);

  // Filter logic for search - Handles the "No Bullshit" case
  const filteredDomains = useMemo(() => {
    return DOMAINS.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleFiles = (e) => {
    const selected = [...e.target.files];
    const validFiles = selected.filter(f => !f.name.startsWith('.'));
    setFiles(validFiles);
  };

  const handleSelectRole = (domain) => {
    setRole(domain);
    setSearchTerm(domain);
    setIsDropdownOpen(false);
    playSound("click");
  };

  const handleAnalyze = async () => {
    if (!role || !DOMAINS.includes(role)) {
      triggerToast("Please select a valid known domain.", "error");
      return;
    }
    if (files.length === 0) {
      triggerToast("Please upload resumes or a ZIP folder.", "error");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("role", role);
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      triggerToast(`${files.length} Assets Staged!`, "success");

      setTimeout(() => {
        navigate("/analyzing", { state: data });
      }, 1200);

    } catch (error) {
      console.error("Upload failed", error);
      triggerToast("Server error. Is your FastAPI backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    playSound("click2");
    navigate("/type");
  };

  return (
    <div className="recruiter-page">
      {toast.show && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="hero-glow" style={{ opacity: 0.4 }} />
      
      <div className="upload-card production-card">
        <button className="back-btn-simple" onClick={handleBack}>
          <ChevronLeft size={16} /> Back
        </button>

        <h2>Rank <span className="gradient-text">Engine </span></h2>

        {/* CUSTOM SEARCHABLE DOMAIN INPUT */}
        <div className="input-group" ref={dropdownRef}>
          <label>Target Domain</label>
          <div className={`modern-search-wrapper ${isDropdownOpen ? 'active' : ''}`}>
            <Search size={18} className="search-glass" />
            <input 
              type="text" 
              placeholder="Search or type domain..." 
              value={searchTerm}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setRole(""); 
                setIsDropdownOpen(true);
              }}
            />
            {searchTerm && (
              <X size={16} className="clear-search" onClick={() => {setSearchTerm(""); setRole("");}} />
            )}
            
            {isDropdownOpen && (
              <div className="search-results-floating">
                {filteredDomains.length > 0 ? (
                  filteredDomains.map(d => (
                    <div key={d} className="search-item" onClick={() => handleSelectRole(d)}>
                      {d}
                    </div>
                  ))
                ) : (
                  <div className="search-no-results">
                    "<span>{searchTerm}</span>" is unknown. Check your spelling.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DUAL UPLOAD ZONE: FILES & DIRECTORIES */}
        <div className="input-group">
          <label>Resume Source (PDF, ZIP, or Folder)</label>
          <div className="upload-grid">
            <label className="upload-box">
              <input type="file" multiple onChange={handleFiles} hidden />
              <UploadCloud size={30} />
              <span>Files / ZIP</span>
            </label>
            
            <label className="upload-box">
              <input 
                type="file" 
                webkitdirectory="true" 
                directory="true" 
                multiple 
                onChange={handleFiles} 
                hidden 
              />
              <FolderSearch size={30} />
              <span>Full Folder</span>
            </label>
          </div>

          {files.length > 0 && (
            <div className="file-info-badge">
              <CheckCircle size={14} /> {files.length} items ready for processing
            </div>
          )}
        </div>

        <button 
          className="analyze-btn" 
          onClick={handleAnalyze} 
          disabled={loading}
        >
          {loading ? "PROCESSING PRODUCTION DATA..." : "EXECUTE ANALYSIS"}
          {!loading && <Rocket size={20} />}
        </button>
      </div>
    </div>
  );
}