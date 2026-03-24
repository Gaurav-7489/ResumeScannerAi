import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, FileText, BarChart, Crown, ExternalLink } from "lucide-react";
import "../styles/Result.css";

const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data || !data.ranking) {
    return (
      <div className="result-page">
        <h2 className="gradient-text">No Analysis Found</h2>
        <button className="btn-primary" onClick={() => navigate("/recruiter")}>Go Back</button>
      </div>
    );
  }

  const ranking = data.ranking.slice(0, 10); // Top 10 focus

  const handleRestart = () => {
    playSound("click2");
    navigate("/recruiter");
  };

  return (
    <div className="result-page">
      <div className="hero-glow" style={{ opacity: 0.2 }} />

      <header className="result-header">
        <div className="stats-badge">LIVE_RESULT // {data.role}</div>
        <h1>Analysis <span className="gradient-text">Intelligence</span></h1>
      </header>

      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: THE VISUAL CHART */}
        <section className="chart-section">
          <div className="section-title">
            <BarChart size={20} /> <h2>Score Distribution</h2>
          </div>
          <div className="bar-chart-container">
            {ranking.map((res, i) => (
              <div key={i} className="chart-row">
                <span className="chart-label">{res.filename.split('.')[0]}</span>
                <div className="bar-wrapper">
                  <div 
                    className="bar-value" 
                    style={{ width: `${res.score}%` }}
                  >
                    <span className="bar-percent">{res.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: THE TOP 10 LEADERBOARD */}
        <section className="list-section">
          <div className="section-title">
            <Crown size={20} /> <h2>Top 10 Candidates</h2>
          </div>
          <div className="top-list">
            {ranking.map((res, index) => (
              <div key={index} className={`mini-card ${index === 0 ? "gold-border" : ""}`}>
                <div className="mini-info">
                  <span className="mini-rank">#{index + 1}</span>
                  <div>
                    <h4>{res.filename}</h4>
                    <p>{res.skills.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
                <a href={`/resumes/${res.filename}`} target="_blank" className="resume-link">
                  <FileText size={18} />
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* BOTTOM SECTION: CROSS-DOMAIN CHAMPIONS */}
      <section className="domain-champions">
        <div className="section-title">
          <Trophy size={20} /> <h2>Cross-Domain Top Talent</h2>
        </div>
        <div className="champion-grid">
          <ChampionCard domain="Backend" name="Ankit_Final.pdf" score="98" />
          <ChampionCard domain="UI/UX" name="Saksham_Design.pdf" score="95" />
          <ChampionCard domain="DevOps" name="Gaurav_Admin.pdf" score="99" />
        </div>
      </section>

      <div className="action-footer">
        <button className="btn-restart" onClick={handleRestart}>
          <RotateCcw size={18} /> INITIALIZE NEW SCAN
        </button>
      </div>
    </div>
  );
}

function ChampionCard({ domain, name, score }) {
  return (
    <div className="champ-card">
      <span className="champ-label">{domain} MVP</span>
      <h4>{name}</h4>
      <div className="champ-score">{score}</div>
    </div>
  );
}