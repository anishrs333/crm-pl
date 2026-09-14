import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { 
  Building2, 
  ShieldCheck, 
  Save, 
  Mail,
  Clock
} from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [companySettings, setCompanySettings] = useState({
    orgName: 'PL Soft Tech Solutions',
    supportEmail: 'ops@plsofttech.com',
    currency: 'INR',
    timezone: 'UTC+05:30 (India Standard)',
    address: 'Tech Park, Chennai, India',
    gstNumber: '33AAAAA0000A1Z5',
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '60',
    emailNotifications: true,
    weeklyDigest: true,
    activityAuditLog: true,
  });

  const handleSaveCompanySettings = (e) => {
    e.preventDefault();
    showToast('Organization profile saved successfully.', 'success');
  };

  const handleSaveSecuritySettings = (e) => {
    e.preventDefault();
    showToast('Security and notification preferences updated.', 'success');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Platform Settings</h1>
        <p>Manage organization details, security policies, and system preferences.</p>
      </div>

      <div className="settings-grid">
        {/* Organization Preferences */}
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

        {/* Security & System Preferences */}
        <Card>
          <CardHeader
            title="Security & System Preferences"
            subtitle="Configure session timeouts, alerts, and audit policies"
          />
          <form onSubmit={handleSaveSecuritySettings}>
            <CardBody>
              <FormField
                label="Session Inactivity Timeout"
                name="sessionTimeout"
                type="select"
                value={securitySettings.sessionTimeout}
                onChange={(e) =>
                  setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })
                }
                icon={Clock}
                options={[
                  { value: '30', label: '30 Minutes' },
                  { value: '60', label: '1 Hour (Recommended)' },
                  { value: '120', label: '2 Hours' },
                  { value: '480', label: '8 Hours' },
                ]}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={securitySettings.emailNotifications}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, emailNotifications: e.target.checked })
                    }
                  />
                  <span>Enable Email Alerts for New Leads & Quotations</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={securitySettings.weeklyDigest}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, weeklyDigest: e.target.checked })
                    }
                  />
                  <span>Send Weekly Sales Performance Digest to Managers</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={securitySettings.activityAuditLog}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, activityAuditLog: e.target.checked })
                    }
                  />
                  <span>Enable User Activity Audit Trail Logging</span>
                </label>
              </div>
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="primary" icon={ShieldCheck}>
                Save Security Settings
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
