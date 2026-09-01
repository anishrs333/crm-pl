import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const menuSections = [
    {
        title: "WORKSPACE",
        items: [
            {
                label: "Overview",
                path: "/dashboard",
                icon: "⌂",
            },
            {
                label: "Leads",
                path: "/leads",
                icon: "◌",
            },
            {
                label: "Customers",
                path: "/customers",
                icon: "◉",
            },
            {
                label: "Opportunities",
                path: "/opportunities",
                icon: "◇",
            },
        ],
    },

    {
        title: "OPERATIONS",
        items: [
            {
                label: "Activities",
                path: "/activities",
                icon: "◷",
            },
            {
                label: "Tasks",
                path: "/tasks",
                icon: "✓",
            },
            {
                label: "Quotations",
                path: "/quotations",
                icon: "▤",
            },
        ],
    },

    {
        title: "MANAGEMENT",
        items: [
            {
                label: "Products",
                path: "/products",
                icon: "▦",
            },
            {
                label: "Employees",
                path: "/employees",
                icon: "♙",
            },
            {
                label: "Reports",
                path: "/reports",
                icon: "▥",
            },
        ],
    },

    {
        title: "SYSTEM",
        items: [
            {
                label: "Notifications",
                path: "/notifications",
                icon: "♢",
            },
            {
                label: "Settings",
                path: "/settings",
                icon: "⚙",
            },
        ],
    },
];

function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />
            )}

            <aside className={`crm-sidebar ${isOpen ? "sidebar-open" : ""}`}>

                {/* Brand */}
                <div className="sidebar-brand">

                    <div className="brand-mark">
                        A
                    </div>

                    <div className="brand-text">
                        <strong>AURORA</strong>
                        <span>CRM</span>
                    </div>

                    <button
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        ×
                    </button>

                </div>


                {/* Navigation */}
                <nav className="sidebar-navigation">

                    {menuSections.map((section) => (

                        <div
                            className="sidebar-section"
                            key={section.title}
                        >

                            <span className="sidebar-section-title">
                                {section.title}
                            </span>


                            <div className="sidebar-menu">

                                {section.items.map((item) => (

                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `sidebar-link ${
                                                isActive
                                                    ? "sidebar-link-active"
                                                    : ""
                                            }`
                                        }
                                    >

                                        <span className="sidebar-icon">
                                            {item.icon}
                                        </span>

                                        <span className="sidebar-label">
                                            {item.label}
                                        </span>

                                    </NavLink>

                                ))}

                            </div>

                        </div>

                    ))}

                </nav>


                {/* User */}
                <div className="sidebar-user">

                    <div className="user-avatar">
                        AS
                    </div>

                    <div className="user-details">
                        <strong>Abishek</strong>
                        <span>Software Developer</span>
                    </div>

                    <button className="user-menu-button">
                        •••
                    </button>

                </div>

            </aside>
        </>
    );
}

export default Sidebar;