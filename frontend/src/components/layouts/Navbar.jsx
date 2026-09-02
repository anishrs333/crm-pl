import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ onMenuClick }) {
    const [showProfile, setShowProfile] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const displayName = user?.name || user?.first_name || user?.username || "User";
    const displayRole = user?.role_label || user?.role || "Team Member";
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="crm-navbar">
            {/* Left */}
            <div className="navbar-left">
                <button
                    className="mobile-menu-button"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    ☰
                </button>

                <div className="navbar-search">
                    <span className="search-icon">⌕</span>
                    <input type="text" placeholder="Search anything..." />
                    <span className="search-shortcut">/</span>
                </div>
            </div>

            {/* Right */}
            <div className="navbar-right">
                <button className="navbar-icon-button">?</button>

                <button className="navbar-icon-button notification-button">
                    ♢
                    <span className="notification-dot" />
                </button>

                <div className="profile-wrapper">
                    <button
                        className="navbar-profile"
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        <div className="navbar-avatar">{initials}</div>
                        <div className="navbar-profile-info">
                            <strong>{displayName}</strong>
                            <span style={{ textTransform: "capitalize" }}>{displayRole}</span>
                        </div>
                        <span className="profile-arrow">▾</span>
                    </button>

                    {showProfile && (
                        <div className="profile-dropdown">
                            <div className="dropdown-user">
                                <div className="navbar-avatar">{initials}</div>
                                <div>
                                    <strong>{displayName}</strong>
                                    <span style={{ textTransform: "capitalize" }}>{displayRole}</span>
                                </div>
                            </div>

                            <div className="dropdown-divider" />

                            <button onClick={() => { setShowProfile(false); navigate("/settings"); }}>
                                My Profile
                            </button>

                            <div className="dropdown-divider" />

                            <button className="logout-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;