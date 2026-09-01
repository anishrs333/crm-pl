import { useState } from "react";
import "./Navbar.css";

function Navbar({ onMenuClick }) {

    const [showProfile, setShowProfile] = useState(false);

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

                    <span className="search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search anything..."
                    />

                    <span className="search-shortcut">
                        /
                    </span>

                </div>

            </div>


            {/* Right */}
            <div className="navbar-right">

                <button className="navbar-icon-button">
                    ?
                </button>


                <button className="navbar-icon-button notification-button">

                    ♢

                    <span className="notification-dot" />

                </button>


                <div className="profile-wrapper">

                    <button
                        className="navbar-profile"
                        onClick={() =>
                            setShowProfile(!showProfile)
                        }
                    >

                        <div className="navbar-avatar">
                            AS
                        </div>

                        <div className="navbar-profile-info">

                            <strong>
                                Abishek
                            </strong>

                            <span>
                                Developer
                            </span>

                        </div>

                        <span className="profile-arrow">
                            ▾
                        </span>

                    </button>


                    {showProfile && (

                        <div className="profile-dropdown">

                            <div className="dropdown-user">

                                <div className="navbar-avatar">
                                    AS
                                </div>

                                <div>
                                    <strong>
                                        Abishek
                                    </strong>

                                    <span>
                                        Software Developer
                                    </span>
                                </div>

                            </div>


                            <div className="dropdown-divider" />


                            <button>
                                My Profile
                            </button>

                            <button>
                                Preferences
                            </button>


                            <div className="dropdown-divider" />


                            <button className="logout-button">
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