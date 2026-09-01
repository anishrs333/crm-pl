import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import "./MainLayout.css";

function MainLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="crm-layout">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="crm-main">

                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="crm-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default MainLayout;