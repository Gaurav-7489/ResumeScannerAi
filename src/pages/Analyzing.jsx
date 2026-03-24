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

  useEffect(() => {
    const ambientSound = playSound("processing", true);

    // SLOW TEXT: Changes every 2 seconds
    const textInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * funnySentences.length);
      setStatus(funnySentences[randomIndex]);
    }, 2000);

    // SLOW PROGRESS: Takes roughly 10-15 seconds total to feel "heavy"
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (Math.random() * 3 + 1); // Small, steady increments
        
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          ambientSound.pause();
          playSound("success");
          setTimeout(() => navigate("/result", { state }), 800);
          return 100;
        }
        return next;
      });
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      ambientSound.pause();
    };
  }, [state, navigate]);

  return (
    <div className="analyzing-page">
      <div className="hero-glow" />
      
      <div className="analysis-container">
        <div className="scanner-circle">
          <div className="scan-line" />
          <div className="core-glow" />
        </div>

        <h1 className="glitch-text">AI Resume Analyzer</h1>
        
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
          <p>{">"} CONNECTING_TO_SATELLITE...</p>
          <p>{">"} ENCRYPTING_PIZZA_ORDER...</p>
          <p>{">"} STATUS: CALCULATING...</p>
        </div>
      </div>
    </div>
  );
}