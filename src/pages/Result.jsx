import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy, RotateCcw, FileText, BarChart2, Crown, ExternalLink,
  Scale, Download, User, Mail, Phone, Link2, Check, X,
  ChevronRight, Sparkles, Award, Globe, BookOpen, Layers,
  AlertCircle, Briefcase, FileCode, CheckCircle, HelpCircle
} from "lucide-react";
import "../styles/Result.css";

const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => { });
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Fallback system
  let data = location.state;
  if (!data) {
    const stored = localStorage.getItem("resultData");
    if (stored) {
      data = JSON.parse(stored);
    }
  }

  const [activeTab, setActiveTab] = useState("candidates");
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const ranking = data?.ranking || [];

  // Set top candidate as default active candidate when data loads
  useEffect(() => {
    if (ranking.length > 0 && !activeCandidate) {
      setActiveCandidate(ranking[0]);
    }
  }, [ranking, activeCandidate]);

  if (!data || ranking.length === 0) {
    return (
      <div className="result-page" style={{ textAlign: "center", paddingTop: "10rem" }}>
        <h2 className="gradient-text" style={{ fontSize: "2rem", marginBottom: "1rem" }}>No Analysis Found</h2>
        <button className="btn-primary" style={{ margin: "0 auto" }} onClick={() => navigate("/recruiter")}>Go Back</button>
      </div>
    );
  }

  const handleRestart = () => {
    playSound("click2");
    localStorage.removeItem("resultData");
    navigate("/recruiter");
  };

  const handleExportPDF = () => {
    playSound("success");
    window.print();
  };

  const toggleSelectForComparison = (candidate, e) => {
    e.stopPropagation();
    playSound("click");
    if (selectedForComparison.some(c => c.filename === candidate.filename)) {
      setSelectedForComparison(selectedForComparison.filter(c => c.filename !== candidate.filename));
    } else {
      if (selectedForComparison.length >= 2) {
        setSelectedForComparison([selectedForComparison[1], candidate]);
      } else {
        setSelectedForComparison([...selectedForComparison, candidate]);
      }
    }
  };

  const clearComparison = () => {
    playSound("click2");
    setSelectedForComparison([]);
  };

  return (
    <div className="result-page">
      <div className="page-bg" />

      {/* HEADER SECTION */}
      <header className="result-header no-print">
        <div>
          <div className="stats-badge">REC RANKER // {data.role}</div>
          <h1>Analysis <span className="gradient-text">Intelligence</span></h1>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExportPDF}>
            <Download size={16} /> Export Report
          </button>
          <button className="btn-primary" onClick={handleRestart}>
            <RotateCcw size={16} /> New Scan
          </button>
        </div>
      </header>

      {/* QUICK STATS METRICS */}
      <section className="stats-strip no-print">
        <div className="stat-card">
          <span className="stat-label">TOTAL RESUMES</span>
          <h3 className="stat-value text-blue">{data.analytics?.total_resumes || ranking.length}</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">AVG MATCH SCORE</span>
          <h3 className="stat-value text-cyan">{data.analytics?.average_score || 0}%</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">UNIQUE SKILLS</span>
          <h3 className="stat-value text-green">{data.analytics?.unique_skills_found || 0}</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">JOB DESC SCORE</span>
          <h3 className="stat-value text-purple">{data.has_job_description ? "Active" : "None"}</h3>
        </div>
      </section>

      {/* TABS CONTROLLER */}
      <div className="tabs-container no-print">
        <button 
          className={`tab-btn ${activeTab === "candidates" ? "active" : ""}`}
          onClick={() => { playSound("click"); setActiveTab("candidates"); }}
        >
          <User size={16} /> Candidate Profiles
        </button>
        <button 
          className={`tab-btn ${activeTab === "cohort" ? "active" : ""}`}
          onClick={() => { playSound("click"); setActiveTab("cohort"); }}
        >
          <BarChart2 size={16} /> Cohort Analytics
        </button>
      </div>

      {/* TAB CONTENT: CANDIDATES SPLIT-PANE */}
      {activeTab === "candidates" && activeCandidate && (
        <div className="split-pane-layout">
          
          {/* LEFT PANE: CANDIDATE LEADERBOARD */}
          <div className="candidate-list-pane">
            <div className="pane-header">
              <h3>RANKING LEADERBOARD</h3>
              {selectedForComparison.length > 0 && (
                <span className="comparison-badge">
                  {selectedForComparison.length}/2 Selected
                </span>
              )}
            </div>
            
            <div className="list-scroll-area">
              {ranking.map((res, index) => {
                const isActive = activeCandidate.filename === res.filename;
                const isCompared = selectedForComparison.some(c => c.filename === res.filename);
                return (
                  <div
                    key={index}
                    className={`candidate-list-card ${isActive ? "active" : ""} ${index === 0 ? "gold-rank" : ""}`}
                    onClick={() => { playSound("click"); setActiveCandidate(res); }}
                  >
                    <div className="card-left">
                      <button
                        className="compare-checkbox no-print"
                        onClick={(e) => toggleSelectForComparison(res, e)}
                        style={{
                          background: isCompared ? "var(--accent)" : "rgba(0,0,0,0.05)",
                          border: isCompared ? "1px solid var(--accent)" : "1px solid var(--border)"
                        }}
                      >
                        {isCompared && <Check size={12} color="white" />}
                      </button>
                      <span className="rank-num">#{index + 1}</span>
                      <div className="name-details">
                        <h4>{res.candidate_name || res.filename.split('.')[0]}</h4>
                        <p>{res.experience_level} • {res.experience_years || 0} yrs</p>
                      </div>
                    </div>
                    <div className="card-right">
                      <div className="score-grade">
                        <span className={`score-badge ${res.score >= 70 ? "high" : "med"}`}>{res.score}%</span>
                        <span className="grade-badge">Grade {res.grade}</span>
                      </div>
                      <ChevronRight size={14} className="arrow-icon" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANE: ACTIVE CANDIDATE DETAILS */}
          <div className="candidate-detail-pane">
            
            <div className="detail-hero">
              <div className="avatar-wrapper">
                <User size={28} />
              </div>
              <div className="detail-meta">
                <h2>{activeCandidate.candidate_name}</h2>
                <p className="filename-text">{activeCandidate.filename}</p>
                <div className="badges-row">
                  <span className="badge-pill exp-badge">
                    <Briefcase size={12} /> {activeCandidate.experience_level} ({activeCandidate.experience_years || 0} Yrs)
                  </span>
                  {activeCandidate.education && activeCandidate.education.length > 0 && (
                    <span className="badge-pill edu-badge">
                      <BookOpen size={12} /> {activeCandidate.education.join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="detail-scores">
                <div className="gauge-score">
                  <h3>{activeCandidate.score}%</h3>
                  <span className="gauge-label">Match Index</span>
                </div>
                <div className="gauge-score accent">
                  <h3>{activeCandidate.grade}</h3>
                  <span className="gauge-label">Grade Rank</span>
                </div>
              </div>
            </div>

            <div className="detail-body">
              {/* CONTACT STRIP */}
              <div className="contact-grid">
                {activeCandidate.email && (
                  <a href={`mailto:${activeCandidate.email}`} className="contact-item">
                    <Mail size={14} /> <span>{activeCandidate.email}</span>
                  </a>
                )}
                {activeCandidate.phone && (
                  <div className="contact-item">
                    <Phone size={14} /> <span>{activeCandidate.phone}</span>
                  </div>
                )}
                {activeCandidate.linkedin && (
                  <a href={activeCandidate.linkedin} target="_blank" rel="noreferrer" className="contact-item link">
                    <Link2 size={14} /> <span>LinkedIn Profile</span>
                  </a>
                )}
                {activeCandidate.github && (
                  <a href={activeCandidate.github} target="_blank" rel="noreferrer" className="contact-item link">
                    <Globe size={14} /> <span>GitHub Profile</span>
                  </a>
                )}
              </div>

              {/* TWO COLUMN CONTENT */}
              <div className="metrics-split-grid">
                
                {/* Left Side: ATS Breakdown & Language Skills */}
                <div className="details-col">
                  
                  {/* ATS Compatibility */}
                  <div className="detail-subcard">
                    <h4>ATS COMPATIBILITY BREAKDOWN ({activeCandidate.ats_score || 70}%)</h4>
                    <div className="ats-bars-list">
                      {Object.entries(activeCandidate.ats_breakdown || { contact_info: 20, formatting: 20, keywords: 15, sections: 15 }).map(([key, score]) => (
                        <div key={key} className="ats-bar-row">
                          <div className="ats-bar-labels">
                            <span className="label-name">{key.replace("_", " ")}</span>
                            <span className="label-value">{score}/25</span>
                          </div>
                          <div className="ats-bar-track">
                            <div className="ats-bar-fill" style={{ width: `${(score / 25) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="detail-subcard">
                    <h4>SKILLS SUMMARY</h4>
                    <div className="languages-strip">
                      <div className="lang-section">
                        <span className="lang-label">Programming languages:</span>
                        <p>{activeCandidate.programming_languages?.length > 0 ? activeCandidate.programming_languages.join(", ") : "None detected"}</p>
                      </div>
                      <div className="lang-section">
                        <span className="lang-label">Spoken:</span>
                        <p>{activeCandidate.spoken_languages?.length > 0 ? activeCandidate.spoken_languages.join(", ") : "English"}</p>
                      </div>
                      {activeCandidate.certifications && activeCandidate.certifications.length > 0 && (
                        <div className="lang-section">
                          <span className="lang-label">Certifications:</span>
                          <p>{activeCandidate.certifications.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Side: Strengths, Weaknesses, JD Fit */}
                <div className="details-col">
                  
                  {/* JD Analysis if available */}
                  {activeCandidate.jd_analysis && (
                    <div className="detail-subcard jd-subcard">
                      <div className="jd-header">
                        <h4>JOB DESCRIPTION FIT</h4>
                        <span className="jd-score-badge">{activeCandidate.jd_analysis.match_score}% Match</span>
                      </div>
                      <div className="jd-skills-comparison">
                        <div className="jd-skills-group">
                          <span className="group-title text-green">MATCHING SKILLS ({activeCandidate.jd_analysis.matching_skills?.length || 0})</span>
                          <div className="skills-flex">
                            {activeCandidate.jd_analysis.matching_skills?.map((s, i) => (
                              <span key={i} className="skill-pill match">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="jd-skills-group">
                          <span className="group-title text-red">MISSING SKILLS ({activeCandidate.jd_analysis.missing_skills?.length || 0})</span>
                          <div className="skills-flex">
                            {activeCandidate.jd_analysis.missing_skills?.map((s, i) => (
                              <span key={i} className="skill-pill missing">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="detail-subcard">
                    <h4>AI RESUME INSIGHTS</h4>
                    <div className="insights-lists">
                      <div className="insight-section">
                        <h5 className="text-green"><CheckCircle size={12} /> Key Strengths</h5>
                        <ul>
                          {(activeCandidate.strengths || []).slice(0, 4).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="insight-section">
                        <h5 className="text-yellow"><AlertCircle size={12} /> Recommendations</h5>
                        <ul>
                          {(activeCandidate.weaknesses || []).slice(0, 4).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: COHORT ANALYTICS */}
      {activeTab === "cohort" && (
        <div className="cohort-analytics-view">
          
          <div className="cohort-grid">
            
            {/* Grade distribution */}
            <div className="cohort-card">
              <div className="cohort-title">
                <Award size={18} /> <h3>GRADE DISTRIBUTION</h3>
              </div>
              <div className="distribution-list">
                {Object.entries(data.analytics?.grade_distribution || {}).map(([grade, count]) => {
                  const percent = ranking.length > 0 ? (count / ranking.length) * 100 : 0;
                  return (
                    <div key={grade} className="distribution-row">
                      <span className="dist-grade">{grade}</span>
                      <div className="dist-bar-track">
                        <div className="dist-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="dist-count">{count} candidates ({Math.round(percent)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Skills Freq */}
            <div className="cohort-card">
              <div className="cohort-title">
                <Layers size={18} /> <h3>MOST COMMON SKILLS FOUND</h3>
              </div>
              <div className="skills-ranking-list">
                {(data.analytics?.top_skills || []).map((item, i) => (
                  <div key={i} className="skill-frequency-row">
                    <span className="freq-rank">#{i+1}</span>
                    <span className="freq-name">{item.skill}</span>
                    <div className="freq-bar-wrapper">
                      <div 
                        className="freq-bar-fill" 
                        style={{ width: `${ranking.length > 0 ? (item.count / ranking.length) * 100 : 0}%` }} 
                      />
                    </div>
                    <span className="freq-count">{item.count} resumes</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Average match scores table */}
          <div className="cohort-card full-width">
            <div className="cohort-title">
              <Trophy size={18} /> <h3>OVERALL COHORT SUMMARY</h3>
            </div>
            <div className="summary-pills">
              <div className="summary-pill">
                <span className="label">Cohort Average:</span>
                <span className="value">{data.analytics?.average_score || 0}%</span>
              </div>
              <div className="summary-pill">
                <span className="label">Top Performer:</span>
                <span className="value text-green">{ranking[0]?.candidate_name} ({ranking[0]?.score}%)</span>
              </div>
              <div className="summary-pill">
                <span className="label">Lowest Performer:</span>
                <span className="value text-red">{ranking[ranking.length - 1]?.candidate_name} ({ranking[ranking.length - 1]?.score}%)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* FLOATING COMPARISON BAR */}
      {selectedForComparison.length > 0 && (
        <div className="floating-compare-bar no-print">
          <div className="compare-info">
            <Scale size={18} className="compare-icon animate-pulse" />
            <span>
              Compare candidates <strong>({selectedForComparison.length}/2)</strong>
            </span>
          </div>

          <div className="compare-actions">
            <button
              className="btn-primary-sm"
              disabled={selectedForComparison.length < 2}
              onClick={() => { playSound("click"); setShowComparisonModal(true); }}
            >
              Start Comparison
            </button>
            <button onClick={clearComparison} className="btn-ghost-sm">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      {showComparisonModal && selectedForComparison.length === 2 && (
        <div className="modal-overlay" onClick={() => setShowComparisonModal(false)}>
          <div className="comparison-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => { playSound("click2"); setShowComparisonModal(false); }}
            >
              <X size={16} />
            </button>

            <div className="modal-header">
              <Scale size={28} color="var(--accent-secondary)" />
              <h2>Side-by-Side Comparison</h2>
              <p>Direct breakdown of candidate credentials</p>
            </div>

            <div className="comparison-table">
              {/* Header Grid */}
              <div className="col-label font-bold">Metric</div>
              <div className="col-val font-bold text-accent">{selectedForComparison[0].candidate_name}</div>
              <div className="col-val font-bold text-accent">{selectedForComparison[1].candidate_name}</div>
              
              <div className="table-divider" />

              {/* Match Score */}
              <div className="col-label">Overall Match Score</div>
              <div className="col-val score text-green">{selectedForComparison[0].score}% (Grade {selectedForComparison[0].grade})</div>
              <div className="col-val score text-green">{selectedForComparison[1].score}% (Grade {selectedForComparison[1].grade})</div>

              <div className="table-divider" />

              {/* ATS Score */}
              <div className="col-label">ATS Audit Score</div>
              <div className="col-val val-bold text-purple">{selectedForComparison[0].ats_score || 70}%</div>
              <div className="col-val val-bold text-purple">{selectedForComparison[1].ats_score || 70}%</div>

              <div className="table-divider" />

              {/* Experience */}
              <div className="col-label">Experience Level</div>
              <div className="col-val">{selectedForComparison[0].experience_level} ({selectedForComparison[0].experience_years || 0} yrs)</div>
              <div className="col-val">{selectedForComparison[1].experience_level} ({selectedForComparison[1].experience_years || 0} yrs)</div>

              <div className="table-divider" />

              {/* Education */}
              <div className="col-label">Education</div>
              <div className="col-val text-truncated">{selectedForComparison[0].education?.join(", ") || "None detected"}</div>
              <div className="col-val text-truncated">{selectedForComparison[1].education?.join(", ") || "None detected"}</div>

              <div className="table-divider" />

              {/* Languages */}
              <div className="col-label">Languages</div>
              <div className="col-val text-truncated">{selectedForComparison[0].programming_languages?.slice(0, 6).join(", ") || "None"}</div>
              <div className="col-val text-truncated">{selectedForComparison[1].programming_languages?.slice(0, 6).join(", ") || "None"}</div>

              <div className="table-divider" />

              {/* Strengths */}
              <div className="col-label">Key Strengths</div>
              <div className="col-val">
                <ul className="bullet-list text-green">
                  {(selectedForComparison[0].strengths || []).slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="col-val">
                <ul className="bullet-list text-green">
                  {(selectedForComparison[1].strengths || []).slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div className="table-divider" />

              {/* Weaknesses */}
              <div className="col-label">Areas to Optimize</div>
              <div className="col-val">
                <ul className="bullet-list text-muted">
                  {(selectedForComparison[0].weaknesses || []).slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
              <div className="col-val">
                <ul className="bullet-list text-muted">
                  {(selectedForComparison[1].weaknesses || []).slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}