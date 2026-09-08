import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatTimeAgo, formatDateTime, getStatusBadgeVariant } from '../../utils/formatters';
import { DashboardCard } from '../../components/common/DashboardCard';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/EmptyState';
import { 
  Users, 
  Briefcase, 
  Flame, 
  CheckSquare, 
  DollarSign, 
  Plus, 
  ArrowRight, 
  Activity,
  PhoneCall,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, actData, leadData, followData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentActivities(),
        dashboardService.getRecentLeads(),
        dashboardService.getPendingFollowUps(),
      ]);

      setSummary(sumData);
      setActivities(actData);
      setRecentLeads(leadData);
      setPendingFollowUps(followData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Unable to load CRM dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (error) {
    return (
      <div className="dashboard-container">
        <ErrorState
          title="Dashboard unavailable"
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  const maxRevenue = summary?.monthlyPipeline?.reduce(
    (max, item) => Math.max(max, item.revenue),
    1
  ) || 1;

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Welcome, {user?.name || 'Partner'} 👋</h1>
          <p>
            PL Soft Tech CRM Executive Overview — Pipeline from Lead Generation to Conversion & Quotations.
          </p>
        </div>

        <div className="dashboard-quick-actions">
          <Button
            variant="outline"
            size="sm"
            icon={Flame}
            onClick={() => navigate('/leads')}
          >
            New Lead
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={PhoneCall}
            onClick={() => navigate('/follow-ups')}
          >
            Follow-up
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/quotations')}
          >
            Create Quote
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/customers')}
          >
            Add Customer
          </Button>
        </div>
      </header>

      {/* KPI Metric Summary Cards Grid */}
      <section className="metrics-grid" aria-label="Key Performance Indicators">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="crm-card" style={{ padding: '22px' }}>
              <Skeleton width="40%" height="16px" style={{ marginBottom: '14px' }} />
              <Skeleton width="70%" height="32px" style={{ marginBottom: '10px' }} />
              <Skeleton width="50%" height="14px" />
            </div>
          ))
        ) : (
          <>
            <DashboardCard
              title="Total Leads"
              value={summary?.totalLeads}
              icon={Flame}
              variant="warning"
              trend={`${summary?.convertedLeads} converted`}
              trendType="positive"
              subtitle={`${summary?.newLeads} fresh inquiries`}
            />
            <DashboardCard
              title="Pending Follow-ups"
              value={summary?.pendingFollowUps}
              icon={PhoneCall}
              variant="info"
              trend="Action required"
              trendType="negative"
              subtitle="scheduled for this week"
            />
            <DashboardCard
              title="Sales Opportunities"
              value={formatCurrency(summary?.opportunityPipelineValue)}
              icon={TrendingUp}
              variant="primary"
              trend={`${summary?.openOpportunities} active deals`}
              trendType="positive"
              subtitle="open pipeline value"
            />
            <DashboardCard
              title="Quotation Status"
              value={formatCurrency(summary?.quotationStats?.totalValue)}
              icon={FileText}
              variant="success"
              trend={`${summary?.quotationStats?.accepted} accepted`}
              trendType="positive"
              subtitle={`${summary?.quotationStats?.sent} sent to clients`}
            />
          </>
        )}
      </section>

      {/* Charts Grid */}
      <section className="charts-grid">
        {/* Monthly Revenue & Pipeline Growth Bar Chart */}
        <Card>
          <CardHeader
            title="Monthly Sales & Revenue Trajectory"
            subtitle="Closed deals and conversion performance"
          />
          <CardBody>
            {isLoading ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton width="100%" height="180px" />
              </div>
            ) : (
              <div className="chart-container">
                {summary?.monthlyPipeline?.map((bar) => {
                  const heightPercent = Math.round((bar.revenue / maxRevenue) * 100);
                  return (
                    <div key={bar.month} className="bar-column">
                      <span className="bar-value-tooltip">
                        ${Math.round(bar.revenue / 1000)}k
                      </span>
                      <div className="bar-fill-track">
                        <div
                          className="bar-fill"
                          style={{ height: `${heightPercent}%` }}
                          title={`${bar.month}: $${bar.revenue.toLocaleString()} (${bar.leads} leads)`}
                        />
                      </div>
                      <span className="bar-label">{bar.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Lead Stage Funnel Distribution */}
        <Card>
          <CardHeader
            title="Lead Funnel Distribution"
            subtitle="Status breakdown from new to qualified"
          />
          <CardBody>
            {isLoading ? (
              <Skeleton width="100%" height="200px" />
            ) : (
              <div className="pipeline-list">
                {summary?.leadDistribution?.map((item) => {
                  const total = summary.leadDistribution.reduce((acc, curr) => acc + curr.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.stage} className="pipeline-item">
                      <div className="pipeline-item-header">
                        <span>{item.stage}</span>
                        <span>{item.count} leads ({pct}%)</span>
                      </div>
                      <div className="pipeline-bar-bg">
                        <div
                          className="pipeline-bar-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Grid: Pending Follow-ups & Recent Leads */}
      <section className="dashboard-details-grid">
        {/* Pending Follow-ups Queue */}
        <Card>
          <CardHeader
            title="Scheduled Follow-up Reminders"
            subtitle="Upcoming calls and meetings with clients"
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={ArrowRight}
                onClick={() => navigate('/follow-ups')}
              >
                View all
              </Button>
            }
          />
          <CardBody noPadding>
            {isLoading ? (
              <div style={{ padding: '20px' }}>
                <Skeleton width="100%" height="120px" />
              </div>
            ) : (
              <div className="crm-table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Subject / Purpose</th>
                      <th>Client / Lead</th>
                      <th>Scheduled Date</th>
                      <th>Rep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFollowUps.map((flw) => (
                      <tr key={flw.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {flw.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Medium: {flw.type}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{flw.entityName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {flw.contactPerson}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                            <Clock size={13} color="var(--warning-solid)" />
                            <span>{formatDateTime(flw.scheduledDate)}</span>
                          </div>
                        </td>
                        <td>{flw.assignedTo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Live Team Activity Feed */}
        <Card>
          <CardHeader
            title="Live Team Activity"
            subtitle="Latest interactions in the CRM"
          />
          <CardBody>
            {isLoading ? (
              <Skeleton width="100%" height="180px" />
            ) : (
              <div className="activity-feed-list">
                {activities.map((act) => (
                  <div key={act.id} className="activity-feed-item">
                    <div className="activity-feed-icon">
                      <Activity size={16} />
                    </div>
                    <div>
                      <p className="activity-feed-text">
                        <strong>{act.user}</strong> {act.action}{' '}
                        <strong>{act.target}</strong>
                      </p>
                      <span className="activity-feed-time">
                        {formatTimeAgo(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
};
