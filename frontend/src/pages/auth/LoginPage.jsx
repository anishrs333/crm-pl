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
  Sparkles
} from 'lucide-react';
import './LoginPage.css';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Inputs MUST be completely empty by default
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
  };

  const validateForm = () => {
    const newErrors = {};

    const usernameErr = validators.required(formData.username, 'User ID / Corporate Email');
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

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await login(formData.username, formData.password);
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

        {/* Portal Scope Switcher */}
        <div className="role-chips-bar">
          <button
            type="button"
            className={`role-chip ${portalMode === 'Admin' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('Admin')}
          >
            <Shield size={14} /> Admin Portal
          </button>
          <button
            type="button"
            className={`role-chip ${portalMode === 'Manager' ? 'active' : ''}`}
            onClick={() => handlePortalSwitch('Manager')}
          >
            <Briefcase size={14} /> Manager Portal
          </button>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="login-error-banner" role="alert">
            <AlertCircle size={18} />
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
                className={`field-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter your user ID..."
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.username && <span className="field-error-msg">{errors.username}</span>}
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
                <span>Sign In to Portal</span>
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
