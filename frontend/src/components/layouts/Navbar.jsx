import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
import { getInitials } from '../../utils/formatters';
import { UserModal } from '../users/UserModal';
import { 
  Menu, 
  Search, 
  Bell, 
  LogOut, 
  User, 
  Settings, 
  ChevronDown,
  Clock,
  PhoneCall,
  Flame,
  FileText,
  Users,
  UserPlus
} from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const loadEmployeeCount = useCallback(async () => {
    try {
      const res = await userService.getUsers({ limit: 1 });
      setEmployeeCount(res.totalItems || res.data?.length || 0);
    } catch (e) {
      console.error('Failed to load employee count:', e);
    }
  }, []);

  useEffect(() => {
    loadEmployeeCount();
    const handleEmpCreated = () => loadEmployeeCount();
    window.addEventListener('employee_created', handleEmpCreated);
    return () => window.removeEventListener('employee_created', handleEmpCreated);
  }, [loadEmployeeCount]);

  const handleCreateEmployeeSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await userService.createUser(formData);
      showToast(`🎉 New employee "${formData.name}" created successfully!`, 'success');
      setIsAddModalOpen(false);
      loadEmployeeCount();
      window.dispatchEvent(new CustomEvent('employee_created'));
    } catch (err) {
      showToast(err.message || 'Failed to create employee account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const list = await notificationService.getNotifications();
        setNotifications(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load notifications:', e);
        setNotifications([]);
      }
    };
    loadNotifs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    showToast('You have been safely logged out.', 'info');
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching for "${searchQuery}" across CRM records...`, 'info', 2500);
      setSearchQuery('');
    }
  };

  const safeNotifs = Array.isArray(notifications) ? notifications : [];

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, read: true, is_read: true })));
    showToast('All notifications marked as read.', 'info', 2000);
  };

  const handleNotificationClick = async (notif) => {
    await notificationService.markAsRead(notif.id);
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) => (n.id === notif.id ? { ...n, read: true, is_read: true } : n))
    );
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const unreadCount = safeNotifs.filter((n) => !n.read && !n.is_read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'followup':
        return <PhoneCall size={14} color="#f59e0b" />;
      case 'quotation':
        return <FileText size={14} color="#10b981" />;
      case 'lead':
        return <Flame size={14} color="#ef4444" />;
      case 'task':
      default:
        return <Clock size={14} color="#6366f1" />;
    }
  };

  return (
    <header className="crm-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Global search leads, customers, quotes, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        {/* Employees Counter Badge Button */}
        <button
          type="button"
          className="navbar-employees-btn"
          onClick={() => navigate('/users')}
          title="View Employee List & Representation Workload"
        >
          <Users size={16} />
          <span className="navbar-emp-label">Employees</span>
          <span className="navbar-emp-count">{employeeCount}</span>
        </button>

        {/* Quick Add Employee Button */}
        <button
          type="button"
          className="navbar-add-emp-btn"
          onClick={() => setIsAddModalOpen(true)}
          title="Create New Employee Account"
        >
          <UserPlus size={15} />
          <span className="navbar-add-emp-label">Add Employee</span>
        </button>

        <div className="notif-menu-wrapper" ref={notifRef}>
          <button
            type="button"
            className="navbar-action-btn"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown" role="menu">
              <div className="notif-header">
                <span className="notif-header-title">Notifications ({unreadCount} unread)</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notif-mark-read-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {safeNotifs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications at this time.
                  </div>
                ) : (
                  safeNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read && !n.is_read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-icon">
                        {getNotifIcon(n.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>


        <div className="user-menu-wrapper" ref={menuRef}>
          <button
            type="button"
            className="user-profile-trigger"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar">
              {getInitials(user?.name || user?.username || 'U')}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || user?.first_name || user?.username || 'User'}</span>
              <span className="user-role-tag">{user?.role || user?.role_label || 'Guest'}</span>
            </div>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {isProfileOpen && (
            <div className="dropdown-menu" role="menu">
              <div className="dropdown-header">
                <div className="dropdown-header-name">{user?.name || user?.username}</div>
                <div className="dropdown-header-email">{user?.email}</div>
              </div>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings');
                }}
              >
                <User size={16} />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/permissions');
                }}
              >
                <Settings size={16} />
                <span>Role Permissions</span>
              </button>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

              <button
                type="button"
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Employee Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEmployeeSubmit}
        isLoading={isSubmitting}
      />
    </header>
  );
};

export default Navbar;
