import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  Building2, 
  Server, 
  Bell, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  KeyRound 
} from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [companySettings, setCompanySettings] = useState({
    orgName: 'Apex Enterprises Corp',
    supportEmail: 'ops@apexcrm.io',
    currency: 'USD',
    timezone: 'UTC-05:00 (Eastern Time)',
    emailNotifications: true,
    weeklyDigest: true,
  });

  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiPingResult, setApiPingResult] = useState(null);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('Company CRM preferences saved successfully.', 'success');
  };

  const handleTestApiConnection = async () => {
    setIsTestingApi(true);
    setApiPingResult(null);

    try {
      await api.get('/reports/dashboard-stats/');
      setApiPingResult({
        status: 'success',
        message: 'Connected to Django REST Framework backend on port 8000 successfully.',
      });
      showToast('Backend connection verified successfully.', 'success', 2500);
    } catch (err) {
      setApiPingResult({
        status: 'error',
        message: `Backend connection error: ${err.message}`,
      });
      showToast('Backend ping failed.', 'error', 2500);
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Platform Settings</h1>
        <p>Configure organization details, REST API backend connections, and notifications.</p>
      </div>

      <div className="settings-grid">
        {/* Organization Preferences */}
        <Card>
          <CardHeader
            title="Organization Profile"
            subtitle="Global CRM branding and account parameters"
          />
          <form onSubmit={handleSaveSettings}>
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
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'CAD', label: 'CAD ($)' },
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
                    { value: 'UTC-05:00 (Eastern Time)', label: 'UTC-05:00 (EST)' },
                    { value: 'UTC-08:00 (Pacific Time)', label: 'UTC-08:00 (PST)' },
                    { value: 'UTC+00:00 (London, GMT)', label: 'UTC+00:00 (GMT)' },
                    { value: 'UTC+05:30 (India Standard)', label: 'UTC+05:30 (IST)' },
                  ]}
                />
              </div>
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="primary" icon={Save}>
                Save Preferences
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* REST API & Backend Connection Diagnostics */}
        <Card>
          <CardHeader
            title="REST API Connection"
            subtitle="Backend server configuration and live Django API status"
          />
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '14px',
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Current API Mode:
                  </span>
                  <span className="api-status-badge api-status-active">
                    ● Live Django REST API
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Target Backend Base URL:{' '}
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>
                    {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
                  </code>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The frontend is connected directly to your Django REST Framework backend on port 8000. All authentication, users, leads, customers, opportunities, and tasks communicate directly with real database tables.
              </p>

              {apiPingResult && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: apiPingResult.status === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: apiPingResult.status === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
                    fontSize: '0.88rem',
                  }}
                >
                  {apiPingResult.message}
                </div>
              )}

              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={handleTestApiConnection}
                isLoading={isTestingApi}
              >
                Test API Ping
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
