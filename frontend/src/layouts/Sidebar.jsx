import React from 'react'
import { NavLink } from 'react-router-dom'
import "./Sidebar.css";

function Sidebar({sidebarOpen, setSidebarOpen}) {

    const closeSidebar = ()=>{
        setSidebarOpen(false);
    };

  return (
    <>
      <aside className={`sidebar ${
        sidebarOpen ? "sidebar-open" : ""
      }`}>

        <div className="sidebar-logo">

            <div className="logo-box">
                C 
            </div>

            <div className="logo-text">
                <strong>CRM </strong>
                <span>Management </span>
            </div>

           <button 
             className="sidebar-close"
             onClick={closeSidebar}
           >
               × 
            </button>

        </div>

        <nav className="sidebar-menu">

            <div className="menu-title">
                MAIN MENU 
            </div>

            <NavLink to="/dashboard"
               onClick={closeSidebar}
            >
              <span className="menu-icon">▦</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/users"
               onClick={closeSidebar}
            >
              <span className="menu-icon">♙</span>
               <span>Users</span>
            </NavLink>


            <NavLink to="/customers"
               onClick={closeSidebar}
            >
              <span className="menu-icon">♧</span>
               <span>Customers</span>
            </NavLink>


            <NavLink to="/leads"
               onClick={closeSidebar}
            >
              <span className="menu-icon">◎</span>
              <span>Leads</span>
            </NavLink>


            <NavLink to="/reports"
               onClick={closeSidebar}
            >
              <span className="menu-icon">▥</span>
               <span>Reports</span>
            </NavLink>

            <div className="menu-title setting-title">
                SYSTEM 
            </div>

            <NavLink to="/settings"
               onClick={closeSidebar} 
            >
                <span className="menu-icon">⚙</span>
                <span>Settings </span>
            </NavLink>

        </nav>

        <div className="sidebar-bottom">
            <div className="help-box">
                <div className="help-icon">?</div>

                <div>
                    <strong>Need Help?</strong>
                    <span>Contact support</span>
                </div>
            </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;