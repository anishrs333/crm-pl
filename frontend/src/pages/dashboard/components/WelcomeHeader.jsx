import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function WelcomeHeader() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const displayName = user?.name || user?.first_name || user?.username || "Team";
    
    // Determine time of day greeting
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17) greeting = "Good evening";

    return (
        <div className="dashboard-welcome">
            <div className="welcome-content">
                <span className="welcome-eyebrow">CRM OVERVIEW</span>
                <h1>{greeting}, {displayName}</h1>
                <p>Here's what's happening with your customer relationships today.</p>
            </div>

            <div className="welcome-actions">
                <button className="btn-secondary" onClick={() => window.print()}>
                    Export
                </button>
                <button className="btn-primary" onClick={() => navigate("/leads")}>
                    + Add Lead
                </button>
            </div>
        </div>
    );
}

export default WelcomeHeader;