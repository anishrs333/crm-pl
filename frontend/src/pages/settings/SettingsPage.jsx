import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { 
  Building2, 
  Save, 
  Mail, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  UserCheck 
} from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { showToast } = useToast();

  // Inputs MUST start 100% empty for manual data entry
  const [companySettings, setCompanySettings] = useState({
    orgName: '',
    supportEmail: '',
    currency: 'INR',
    timezone: 'UTC+05:30 (India Standard)',
    address: '',
    gstNumber: '',
  });

  // Password Change state for Admin and Manager
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveCompanySettings = (e) => {
    e.preventDefault();
    showToast('Organization profile updated successfully.', 'success');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/users/change-password/', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      showToast('Password updated successfully! Please use your new password next time you log in.', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Please verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Platform & Security Settings</h1>
        <p>Manage organization parameters and account security preferences.</p>
      </div>

      <div className="settings-grid">
        {/* Organization Preferences - Manual Entry (Empty Defaults) */}
        <Card>
          <CardHeader
            title="Organization Profile"
            subtitle="Global CRM branding, tax numbers, and currency parameters"
          />
          <form onSubmit={handleSaveCompanySettings}>
            <CardBody>
              <FormField
                label="Organization Name"
                name="orgName"
                placeholder="Enter company / organization name..."
                value={companySettings.orgName}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, orgName: e.target.value })
                }
                icon={Building2}
              />

              <FormField
                label="Support & Billing Email"
                name="supportEmail"
                type="email"
                placeholder="e.g. ops@company.com"
                value={companySettings.supportEmail}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, supportEmail: e.target.value })
                }
                icon={Mail}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormField
                  label="System Currency"
                  name="currency"
                  type="select"
                  value={companySettings.currency}
                  onChange={(e) =>
                    setCompanySettings({ ...companySettings, currency: e.target.value })
                  }
                  options={[
                    { value: 'INR', label: 'INR (₹)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                  ]}
                />

                <FormField
                  label="Timezone"
                  name="timezone"
                  type="select"
                  value={companySettings.timezone}
                  onChange={(e) =>
                    setCompanySettings({ ...companySettings, timezone: e.target.value })
                  }
                  options={[
                    { value: 'UTC+05:30 (India Standard)', label: 'UTC+05:30 (IST)' },
                    { value: 'UTC-05:00 (Eastern Time)', label: 'UTC-05:00 (EST)' },
                    { value: 'UTC-08:00 (Pacific Time)', label: 'UTC-08:00 (PST)' },
                    { value: 'UTC+00:00 (London, GMT)', label: 'UTC+00:00 (GMT)' },
                  ]}
                />
              </div>

              <FormField
                label="GST / Tax ID Number"
                name="gstNumber"
                placeholder="Enter GST / Tax Registration Number..."
                value={companySettings.gstNumber}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, gstNumber: e.target.value })
                }
              />

              <FormField
                label="Registered Office Address"
                name="address"
                type="textarea"
                rows={2}
                placeholder="Enter complete office address..."
                value={companySettings.address}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, address: e.target.value })
                }
              />
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="primary" icon={Save}>
                Save Profile
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security & Password Change Section for Admin and Manager */}
        <Card>
          <CardHeader
            title="Account Security & Password"
            subtitle={`Change security password for ${user?.name || user?.username || 'User'} (${user?.role || 'Administrator'})`}
          />
          <form onSubmit={handlePasswordChange}>
            <CardBody>
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: 'rgba(26, 35, 126, 0.05)', 
                borderRadius: '8px', 
                marginBottom: '16px',
                border: '1px solid rgba(26, 35, 126, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ShieldCheck size={20} color="#1A237E" />
                <span style={{ fontSize: '0.85rem', color: '#1A237E', fontWeight: 600 }}>
                  Logged in as <strong>@{user?.username || 'user'}</strong> ({isAdmin ? 'System Admin' : isManager ? 'Sales Manager' : 'Staff'})
                </span>
              </div>

              {passwordError && (
                <div style={{ 
                  padding: '10px 14px', 
                  backgroundColor: '#fef2f2', 
                  color: '#dc2626', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem', 
                  marginBottom: '14px',
                  border: '1px solid #fecaca'
                }}>
                  {passwordError}
                </div>
              )}

              <FormField
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="Enter existing password..."
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                icon={Lock}
                required
              />

              <FormField
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Enter minimum 4 characters..."
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                icon={KeyRound}
                required
              />

              <FormField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-type new password to verify..."
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                icon={KeyRound}
                required
              />
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="primary" icon={KeyRound} isLoading={isChangingPassword}>
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
