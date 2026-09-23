import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validators } from '../../utils/validators';
import { 
  Building2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Shield,
  Briefcase,
  Sparkles,
  Info
} from 'lucide-react';
import './LoginPage.css';

export const LoginPage = () => {
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Inputs start completely empty by default
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [portalMode, setPortalMode] = useState('Admin');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handlePortalSwitch = (mode) => {
    setPortalMode(mode);
    setServerError('');
    setErrors({});
  };

  const normalizedInputUser = (formData.username || '').trim().toLowerCase();
  const isManagerCredentialEntered = normalizedInputUser.includes('manager');
  const isAdminCredentialEntered = normalizedInputUser.includes('admin');

  // Local helper notice for mismatched tab selection
  const showManagerTabNotice = portalMode === 'Admin' && isManagerCredentialEntered;
  const showAdminTabNotice = portalMode === 'Manager' && isAdminCredentialEntered;

  const validateForm = () => {
    const newErrors = {};

    const usernameErr = validators.required(formData.username, 'User ID');
    if (usernameErr) newErrors.username = usernameErr;

    const passwordErr = validators.required(formData.password, 'Password');
    if (passwordErr) {
      newErrors.password = passwordErr;
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Strict client-side pre-check for portal mode
    if (portalMode === 'Admin' && isManagerCredentialEntered) {
      setServerError('Access Denied: "manager_crm" is a Manager account. Please switch to the Manager Portal tab to log in.');
      return;
    }
    if (portalMode === 'Manager' && isAdminCredentialEntered) {
      setServerError('Access Denied: "crm_admin" is an Admin account. Please switch to the Admin Portal tab to log in.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await login(formData.username, formData.password);
      const userRole = (response.user?.role || '').toLowerCase();
      const isAdminUser = userRole === 'admin' || response.user?.is_superuser;
      const isManagerUser = userRole === 'manager' || userRole === 'sales_manager';

      // Verify portal scope against authenticated user role
      if (portalMode === 'Admin' && !isAdminUser) {
        await logout();
        setServerError('Access Denied: This account is a Manager account. Please switch to the Manager Portal tab to log in.');
        return;
      }

      if (portalMode === 'Manager' && !isManagerUser) {
        await logout();
        setServerError('Access Denied: This account is an Admin account. Please switch to the Admin Portal tab to log in.');
        return;
      }

      showToast(`Welcome back, ${response.user?.name || 'User'}!`, 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="premium-login-container">
      {/* Animated Ambient Persian Blue & Carrot Orange Background Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      <div className="premium-login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="brand-logo-container">
            <Building2 size={26} className="brand-logo-icon" />
          </div>
          <div className="brand-text-block">
            <div className="brand-badge-pill">
              <Sparkles size={12} />
              <span>Enterprise CRM v2.0</span>
            </div>
            <h1 className="brand-title">PL SOFT TECH CRM</h1>
          </div>
        </div>

        {/* Portal Role Scope Switcher */}
        <div className="portal-switcher-wrapper">
          <div className="role-chips-bar">
            <button
              type="button"
              className={`role-chip ${portalMode === 'Admin' ? 'active admin-active' : ''}`}
              onClick={() => handlePortalSwitch('Admin')}
            >
              <Shield size={15} /> 
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              className={`role-chip ${portalMode === 'Manager' ? 'active manager-active' : ''}`}
              onClick={() => handlePortalSwitch('Manager')}
            >
              <Briefcase size={15} /> 
              <span>Manager Portal</span>
            </button>
          </div>

          {/* Active Scope Description Banner */}
          <div className="scope-indicator-banner">
            {portalMode === 'Admin' ? (
              <span className="scope-tag scope-admin">
                <Shield size={12} /> Strictly Admin Scope • System Governance
              </span>
            ) : (
              <span className="scope-tag scope-manager">
                <Briefcase size={12} /> Strictly Manager Scope • Sales Operations
              </span>
            )}
          </div>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="login-error-banner" role="alert">
            <AlertCircle size={18} className="error-banner-icon" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form - Inputs start 100% empty */}
        <form onSubmit={handleSubmit} className="premium-login-form" noValidate>
          {/* Username Field */}
          <div className="form-field-group">
            <label className="field-label" htmlFor="username">
              USER ID / CORPORATE EMAIL
            </label>
            <div className="field-input-wrapper">
              <User className="field-icon" size={18} />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="off"
                className={`field-input ${errors.username ? 'error' : ''} ${showManagerTabNotice || showAdminTabNotice ? 'warning-border' : ''}`}
                placeholder="Enter your user ID..."
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.username && <span className="field-error-msg">{errors.username}</span>}

            {/* Smart Portal Switcher Hint */}
            {showManagerTabNotice && (
              <div className="tab-hint-box" onClick={() => handlePortalSwitch('Manager')}>
                <Info size={14} />
                <span>Manager credential detected. <strong>Click here to switch to Manager Portal</strong></span>
              </div>
            )}
            {showAdminTabNotice && (
              <div className="tab-hint-box" onClick={() => handlePortalSwitch('Admin')}>
                <Info size={14} />
                <span>Admin credential detected. <strong>Click here to switch to Admin Portal</strong></span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-field-group">
            <label className="field-label" htmlFor="password">
              SECURITY PASSWORD
            </label>
            <div className="field-input-wrapper">
              <Lock className="field-icon" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                className={`field-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter password..."
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error-msg">{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="premium-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to {portalMode} Portal</span>
                <ArrowRight size={18} className="submit-arrow" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="login-security-strip">
          <ShieldCheck size={16} className="security-icon" />
          <span>256-Bit SSL Encrypted • Single Sign-On Ready</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
