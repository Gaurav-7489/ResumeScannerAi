import { useNavigate } from "react-router-dom";
import { MoveRight, Zap, Search, BarChart3, Mail } from "lucide-react";
import "../styles/Intro.css";

// Audio Engine helper
const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => console.log("Audio interaction required"));
};

export default function Intro() {
  const navigate = useNavigate();

  const handleStart = () => {
    playSound("click");
    navigate("/type");
  };

  return (
    <div className="intro-page">
      <div className="container">
        
        {/* NAVBAR - Simplified */}
        <nav className="navbar">
          <div className="logo">
            <span>RANKER<span style={{ color: "var(--accent)" }}>.AI</span></span>
          </div>
        </nav>

        {/* HERO */}
        <main className="hero">
          <div className="hero-glow" />
          
          <h1>
            Rank <span className="gradient-text">Resumes</span><br />
            with Precision
          </h1>

          <p className="subtitle">
            Scan hundreds of resumes instantly and find the best candidate using
            AI powered semantic analysis.
          </p>

          <button className="btn-primary" onClick={handleStart}>
            START ANALYSIS
            <MoveRight size={22} />
          </button>

          {/* FEATURES GRID - 4 Boxes */}
          <div className="features-grid">
            <FeatureCard 
              icon={<Zap size={32} color="var(--accent)" />}
              title="Instant AI Scoring"
              desc="Get real-time resume scores based on role, skills, and relevance."
            />

            <FeatureCard 
              icon={<Search size={32} color="white" />}
              title="Deep Skill Detection"
              desc="Our AI finds actual abilities, not just keyword stuffing."
            />

            <FeatureCard 
              icon={<BarChart3 size={32} color="#818cf8" />}
              title="Candidate Leaderboard"
              desc="Auto-rank all applicants from best to worst instantly."
            />

            <FeatureCard 
              icon={<Mail size={32} color="var(--accent)" />}
              title="Auto Feedback"
              desc="Send smart feedback and results to candidates automatically."
            />
          </div>
        </main>

        <footer>
          &copy; 2026 | RANKER.AI By Team : Saksham , Ankit , Gaurav
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="icon-wrapper">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}