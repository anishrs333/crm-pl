import React from 'react'
import "./Navbar.css";

function Navbar({setSidebarOpen}) {
  return (
    <>
    <header className="navbar">

      <div className="navbar-left">

        <button 
          className="mobile-menu-button"
          onClick={()=> setSidebarOpen(true)}
        >
            ☰
        </button>

        <div>
            <h2>Dashboard </h2>
            <span>Overview </span>
        </div>
        
      </div>

      <div className="navbar-right">
        <button className="notification-btn">
            🔔
            <span className="notification-dot"></span>
        </button>

        <div className="navbar-divider"></div>

        <div className="user-profile">
            <div className='user-avatar'>
                A 
            </div>

            <div className="user-info">
                <strong>Admin </strong>
                <span>Administrator </span>
            </div>

            <span className="user-arrow">
                 ▾
            </span>
        </div>
      </div>

    </header>
    </>
  );
}

export default Navbar;