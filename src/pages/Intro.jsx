import { useNavigate } from "react-router-dom";
import { MoveRight, Zap, Search, BarChart3, Mail, Shield, Brain, Layers, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import "../styles/Intro.css";

const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

export default function Intro() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const handleStart = () => {
    playSound("click");
    navigate("/type");
  };

  return (
    <div className={`intro-page ${loaded ? "loaded" : ""}`}>
      <div className="page-bg" />
      <div className="noise-overlay" />

      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon">
              <Sparkles size={18} color="white" />
            </div>
            <span>RANKER<span style={{ color: "var(--accent)" }}>.AI</span></span>
          </div>
          <div className="nav-badge">v2.0 • 200+ Skills</div>
        </nav>

        <main className="hero">
          <div className="hero-glow" />
          <div className="hero-glow-2" />

          <div className="hero-badge">
            <Sparkles size={14} />
            AI-POWERED RESUME INTELLIGENCE ENGINE
          </div>

          <h1>
            Rank <span className="gradient-text">Resumes</span><br />
            with Precision
          </h1>

          <p className="subtitle">
            Scan hundreds of resumes instantly. Detect 200+ skills across 20+ roles.
            Get AI-powered scoring, experience analysis, and candidate insights — all in seconds.
          </p>

          <div className="hero-cta">
            <button className="btn-primary" onClick={handleStart}>
              START ANALYSIS
              <MoveRight size={22} />
            </button>
            <div className="hero-stats">
              <div className="stat-pill"><span>200+</span> Skills</div>
              <div className="stat-pill"><span>20+</span> Roles</div>
              <div className="stat-pill"><span>100%</span> Free</div>
            </div>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<Zap size={28} />}
              title="Instant AI Scoring"
              desc="Real-time resume scores with A+ through F grading based on role fit."
              color="var(--accent)"
            />
            <FeatureCard
              icon={<Brain size={28} />}
              title="Deep Skill Detection"
              desc="200+ skills across 15 categories — from Python to Blockchain."
              color="var(--accent-secondary)"
            />
            <FeatureCard
              icon={<BarChart3 size={28} />}
              title="Analytics Dashboard"
              desc="Score distribution, skill frequency, and grade breakdowns at a glance."
              color="var(--accent-pink)"
            />
            <FeatureCard
              icon={<Shield size={28} />}
              title="Strengths & Weaknesses"
              desc="Auto-generated feedback with missing critical skills highlighted."
              color="#10b981"
            />
          </div>

          <div className="powered-strip">
            <Layers size={14} />
            <span>Detects Education • Certifications • LinkedIn • GitHub • Experience Level • Projects</span>
          </div>
        </main>

        <footer>
          © 2026 | RANKER.AI By Team : Saksham , Ankit , Gaurav
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="feature-card">
      <div className="icon-wrapper" style={{ color }}>{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}