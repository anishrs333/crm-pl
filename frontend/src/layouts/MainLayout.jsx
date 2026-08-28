import  { useState } from 'react'
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import "./MainLayout.css";

function MainLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
       <div className="crm-layout">

        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div className="main-section">

            <Navbar 
              setSidebarOpen={setSidebarOpen}
            />

            <main className="main-content">
                <Outlet />
            </main>
        </div>

        {sidebarOpen && (
            <div 
              className="sidebar-overlay"
              onClick={()=>setSidebarOpen(false)}
            />
        )}
       </div>
    </>
  );
}

export default MainLayout;