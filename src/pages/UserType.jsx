import { useNavigate } from "react-router-dom";
import { Users, UserSearch } from "lucide-react";
import "../styles/UserType.css";

// Audio Engine helper
const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => console.log("Audio interaction required"));
};

export default function UserType() {
  const navigate = useNavigate();

  // Updated handler to support specific sounds
  const handleNavigation = (path, soundType = "click") => {
    playSound(soundType);
    navigate(path);
  };

  return (
    <div className="identity-page">
      <h1>Who are <span className="gradient-text">you?</span></h1>

      <div className="identity-grid">
        
        {/* RECRUITER CARD - Plays click.mp3 */}
        <div 
          className="identity-card recruiter" 
          onClick={() => handleNavigation("/recruiter", "click")}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <Users size={48} color="var(--accent)" />
          </div>
          <h3>Recruiter</h3>
          <p>I want to scan multiple resumes and find the best candidates for a role.</p>
        </div>

        {/* JOB SEEKER CARD (Disabled) */}
        <div className="identity-card disabled">
          <div className="coming-soon-tag">Soon</div>
          <div style={{ marginBottom: "1.5rem" }}>
            <UserSearch size={48} color="var(--text-muted)" />
          </div>
          <h3>Job Seeker</h3>
          <p>I want to check how well my resume matches a specific job description.</p>
        </div>

      </div>

      {/* BACK BUTTON - Plays click2.mp3 */}
      <p 
        onClick={() => handleNavigation("/", "click2")} 
        style={{ marginTop: "4rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem" }}
      >
        ← Go Back
      </p>
    </div>
  );
}