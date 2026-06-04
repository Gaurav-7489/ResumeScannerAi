import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Analyzing.css";

const playSound = (type, loop = false) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.3;
  audio.loop = loop;
  audio.play().catch(() => {});
  return audio;
};

export default function Analyzing() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing neural link...");
  const [phase, setPhase] = useState(0);

  const funnySentences = [
    "Overclocking the CPU until it cries...", "Rejecting resumes written in Comic Sans...",
    "Teaching AI to judge humans...", "Downloading confidence.exe...",
    "Deleting bugs… they keep respawning...", "Checking who copied from StackOverflow...",
    "Simulating productivity...", "Rewriting reality.js...", "Ignoring HR emails...",
    "Searching for talent… still searching...", "Running on 2% battery and pure anger...",
    "Optimizing nonsense to enterprise level...", "Deploying without testing… good luck.",
    "Asking Google what the error means...", "Pretending to understand the code...",
    "Turning coffee into code...", "Ranking candidates by vibes...", "Compiling excuses...",
    "Fixing one bug, creating seven...", "Activating sarcasm engine...",
    "Reading logs nobody understands...", "Checking if the server is alive… barely.",
    "Loading questionable decisions...", "Scanning for fake experience...",
    "Overengineering a simple problem...", "Trusting the intern… risky move.",
    "Running AI on pure delusion...", "Looking for the missing semicolon...",
    "Boosting ego with fake metrics...", "Patching reality...", "Filtering LinkedIn warriors...",
    "Detecting copy-paste developers...", "Deploying at 3AM like a villain...",
    "Breaking production speedrun...", "Compiling regrets...", "Debugging life choices...",
    "Ignoring warnings… again.", "Calculating confidence with zero proof...",
    "Auto-rejecting buzzword experts...", "Running background panic...",
    "Training AI to roast resumes...", "Checking if candidate knows Ctrl+C...",
    "Powering server with caffeine...", "Generating random success...",
    "Evaluating skills vs reality...", "Loading chaos module...", "Almost done… probably not."
  ];

  const phases = ["PARSING DOCUMENTS", "EXTRACTING SKILLS", "SCORING CANDIDATES", "GENERATING INSIGHTS"];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setStatus(funnySentences[Math.floor(Math.random() * funnySentences.length)]);
    }, 2000);

    const phaseInterval = setInterval(() => {
      setPhase(p => Math.min(p + 1, phases.length - 1));
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        let next = prev + (Math.random() * 3 + 1);
        if (next >= 99) next = 100;
        return next;
      });
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      let finalData = state;
      if (!finalData || !finalData.ranking || finalData.ranking.length === 0) {
        const stored = localStorage.getItem("resultData");
        if (stored) {
          finalData = JSON.parse(stored);
          if (!finalData || !finalData.ranking || finalData.ranking.length === 0) {
            navigate("/recruiter");
            return;
          }
        } else {
          navigate("/recruiter");
          return;
        }
      }
      setTimeout(() => navigate("/result", { state: finalData }), 800);
    }
  }, [progress, navigate, state]);

  return (
    <div className="analyzing-page">
      <div className="page-bg" />
      <div className="noise-overlay" />

      <div className="analysis-container">
        <div className="scanner-circle">
          <div className="scan-line" />
          <div className="core-glow" />
          <div className="ring ring-1" />
          <div className="ring ring-2" />
        </div>

        <h1 className="glitch-text">AI Resume Analyzer</h1>

        <div className="phase-indicator">
          {phases.map((p, i) => (
            <div key={i} className={`phase-dot ${i <= phase ? 'active' : ''}`}>
              <div className="dot" />
              <span>{p}</span>
            </div>
          ))}
        </div>

        <div className="progress-section">
          <div className="bar-bg">
            <div className="bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="scan-stats">
            <span>Processing resumes..</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <p className="funny-status">{status}</p>

        <div className="bottom-terminal">
          <p><span className="term-prompt">&gt;</span> NEURAL_NETWORK_LOADED</p>
          <p><span className="term-prompt">&gt;</span> SKILL_MATRIX_INITIALIZED</p>
          <p><span className="term-prompt">&gt;</span> STATUS: {phases[phase]}...</p>
        </div>
      </div>
    </div>
  );
}