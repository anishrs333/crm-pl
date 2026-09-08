import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Flame, 
  TrendingUp, 
  PhoneCall, 
  FileText, 
  Package, 
  CheckSquare, 
  BarChart3, 
  ShieldCheck, 
  Settings,
  X
} from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ 
  isCollapsed, 
  isMobileOpen, 
  onCloseMobile 
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationSections = [
    {
      title: 'Main Menu',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: 'Leads',
          path: '/leads',
          icon: Flame,
          badge: 'Hot',
          badgeClass: 'badge-primary',
        },
        {
          label: 'Follow-ups',
          path: '/follow-ups',
          icon: PhoneCall,
        },
        {
          label: 'Opportunities',
          path: '/opportunities',
          icon: TrendingUp,
        },
        {
          label: 'Quotations',
          path: '/quotations',
          icon: FileText,
          badge: 'PDF',
          badgeClass: 'badge-primary',
        },
        {
          label: 'Customers',
          path: '/customers',
          icon: Briefcase,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          label: 'Products & Services',
          path: '/products',
          icon: Package,
        },
        {
          label: 'Tasks',
          path: '/tasks',
          icon: CheckSquare,
        },
        {
          label: 'Reports & Analytics',
          path: '/reports',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        ...(user?.role === 'Admin'
          ? [
              {
                label: 'Employee Management',
                path: '/users',
                icon: Users,
              },
            ]
          : []),
        {
          label: 'System Settings',
          path: '/settings',
          icon: Settings,
        },
      ],
    },
  ];

  const isRouteActive = (item) => {
    const current = location.pathname;
    if (item.exact) {
      return current === item.path || current === '/';
    }
    return current.startsWith(item.path);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`crm-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand-link" onClick={onCloseMobile}>
            <div className="sidebar-logo">
              <Building2 size={22} />
            </div>
            {!isCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="sidebar-brand-name">PL SOFT CRM</span>
                <span className="sidebar-brand-badge">2026</span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          {isMobileOpen && (
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links Grouped */}
        <nav className="sidebar-nav">
          {navigationSections.map((section) => (
            <div key={section.title} style={{ marginBottom: '12px' }}>
              <span className="nav-section-title">{section.title}</span>

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(item);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge && !isCollapsed && (
                      <span className={`nav-badge ${item.badgeClass || ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card at bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name text-truncate">
                {user?.name || 'User'}
              </div>
              <div className="sidebar-user-role">
                {user?.role === 'Admin' ? 'Administrator' : 'Sales Manager'} • {user?.department || 'Operations'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
