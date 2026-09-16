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
  ShieldCheck
} from 'lucide-react';
import './LoginPage.css';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    const usernameErr = validators.required(formData.username, 'Username or Email');
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
      showToast(`Welcome back, ${response.user.name || 'Admin'}!`, 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Authentication failed. Please check your username and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="login-logo-icon">
            <Building2 size={24} />
          </div>
          <div className="login-brand-text">
            <h1>PL SOFT CRM</h1>
            <p>Enterprise Management Portal</p>
          </div>
        </div>

        <div className="login-header">
          <h2>Sign in to your account</h2>
          <p>Welcome back! Enter your corporate credentials to continue.</p>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="login-error-alert" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Username / User ID Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username or Corporate Email <span className="form-required">*</span>
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className={`form-input ${errors.username ? 'has-error' : ''}`}
                placeholder="e.g. crm_admin"
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {errors.username && <span className="field-error-text">{errors.username}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="form-required">*</span>
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-input ${errors.password ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error-text">{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Badge */}
        <div className="login-security-footer">
          <ShieldCheck size={16} />
          <span>256-Bit SSL Encrypted • Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  );
};


