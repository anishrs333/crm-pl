import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatTimeAgo, formatDateTime, getStatusBadgeVariant } from '../../utils/formatters';
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
  Clock,
  Target,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedFollowUpIds, setCompletedFollowUpIds] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, actData, oppData, followData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentActivities(),
        dashboardService.getRecentOpportunities(),
        dashboardService.getPendingFollowUps(),
      ]);

      setSummary(sumData);
      setActivities(actData);
      setRecentOpportunities(oppData);
      setPendingFollowUps(followData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Unable to load CRM executive command center.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickCompleteFollowUp = (id, title) => {
    setCompletedFollowUpIds((prev) => [...prev, id]);
    showToast(`Follow-up marked as completed: "${title}"`, 'success', 2500);
  };

  if (error) {
    return (
      <div className="dashboard-container">
        <ErrorState
          title="Command Center Unavailable"
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

  const activeFollowUps = pendingFollowUps.filter(
    (f) => !completedFollowUpIds.includes(f.id)
  );

  return (
    <div className="dashboard-container">
      {/* 1. EXECUTIVE COMMAND BAR */}
      <header className="cmd-header-card">
        <div className="cmd-header-main">
          <div className="cmd-header-status-pill">
            <span className="cmd-pulse-dot" />
            <span>Core Active • Operational</span>
          </div>
          <h1 className="cmd-header-title">
            Welcome back, {user?.name || 'Administrator'} 👋
          </h1>
          <p className="cmd-header-subtitle">
            Executive Command Center — End-to-end pipeline management from lead acquisition to quotation closure.
          </p>
          <div className="cmd-meta-tags">
            <Badge variant="primary">
              <ShieldCheck size={12} style={{ marginRight: '4px' }} />
              Single Role • Full Access
            </Badge>
            <span className="cmd-date-pill">
              <Calendar size={13} style={{ marginRight: '5px' }} />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Fast Action Launchpad */}
        <div className="cmd-action-toolbar">
          <Button
            variant="primary"
            size="md"
            icon={Flame}
            onClick={() => navigate('/leads')}
          >
            New Lead
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={PhoneCall}
            onClick={() => navigate('/follow-ups')}
          >
            Schedule Call
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={FileText}
            onClick={() => navigate('/quotations')}
          >
            Create Quote
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={Briefcase}
            onClick={() => navigate('/customers')}
          >
            Add Customer
          </Button>
        </div>
      </header>

      {/* 2. HERO KPI VELOCITY CARDS (4 Grid) */}
      <section className="cmd-kpi-grid" aria-label="Key Performance Indicators">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="cmd-kpi-card" style={{ padding: '22px' }}>
              <Skeleton width="40%" height="16px" style={{ marginBottom: '14px' }} />
              <Skeleton width="70%" height="32px" style={{ marginBottom: '10px' }} />
              <Skeleton width="50%" height="14px" />
            </div>
          ))
        ) : (
          <>
            {/* KPI 1: Pipeline Revenue */}
            <div className="cmd-kpi-card">
              <div className="cmd-kpi-header">
                <span className="cmd-kpi-label">Pipeline Value</span>
                <div className="cmd-kpi-icon-box emerald">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="cmd-kpi-metric-row">
                <span className="cmd-kpi-metric-value">
                  {formatCurrency(summary?.opportunityPipelineValue)}
                </span>
                <span className="cmd-trend-chip positive">
                  <ArrowUpRight size={13} />
                  +14.5%
                </span>
              </div>
              <div className="cmd-kpi-progress-bar">
                <div className="cmd-kpi-progress-fill emerald" style={{ width: '78%' }} />
              </div>
              <div className="cmd-kpi-footer">
                <span>{summary?.openOpportunities} active sales opportunities</span>
                <span className="cmd-kpi-goal">Target: $500k</span>
              </div>
            </div>

            {/* KPI 2: Total Leads & Conversion */}
            <div className="cmd-kpi-card">
              <div className="cmd-kpi-header">
                <span className="cmd-kpi-label">Lead Velocity</span>
                <div className="cmd-kpi-icon-box amber">
                  <Flame size={20} />
                </div>
              </div>
              <div className="cmd-kpi-metric-row">
                <span className="cmd-kpi-metric-value">
                  {summary?.totalLeads}
                </span>
                <span className="cmd-trend-chip positive">
                  <ArrowUpRight size={13} />
                  {summary?.conversionRate}% Win
                </span>
              </div>
              <div className="cmd-kpi-progress-bar">
                <div
                  className="cmd-kpi-progress-fill amber"
                  style={{ width: `${Math.min(summary?.conversionRate || 35, 100)}%` }}
                />
              </div>
              <div className="cmd-kpi-footer">
                <span>{summary?.newLeads} fresh • {summary?.convertedLeads} won</span>
                <span className="cmd-kpi-goal">Goal: 65%</span>
              </div>
            </div>

            {/* KPI 3: Actionable Follow-ups */}
            <div className="cmd-kpi-card">
              <div className="cmd-kpi-header">
                <span className="cmd-kpi-label">Follow-ups Queue</span>
                <div className="cmd-kpi-icon-box teal">
                  <PhoneCall size={20} />
                </div>
              </div>
              <div className="cmd-kpi-metric-row">
                <span className="cmd-kpi-metric-value">
                  {activeFollowUps.length}
                </span>
                <span className="cmd-trend-chip warning">
                  <Clock size={13} />
                  Action Today
                </span>
              </div>
              <div className="cmd-kpi-progress-bar">
                <div
                  className="cmd-kpi-progress-fill teal"
                  style={{
                    width: `${Math.max(20, Math.min(activeFollowUps.length * 25, 100))}%`,
                  }}
                />
              </div>
              <div className="cmd-kpi-footer">
                <span>Scheduled calls & client meetings</span>
                <span className="cmd-kpi-goal">100% SLA</span>
              </div>
            </div>

            {/* KPI 4: Quotation Status */}
            <div className="cmd-kpi-card">
              <div className="cmd-kpi-header">
                <span className="cmd-kpi-label">Quotation Volume</span>
                <div className="cmd-kpi-icon-box cyan">
                  <FileText size={20} />
                </div>
              </div>
              <div className="cmd-kpi-metric-row">
                <span className="cmd-kpi-metric-value">
                  {formatCurrency(summary?.quotationStats?.totalValue)}
                </span>
                <span className="cmd-trend-chip positive">
                  <CheckCircle2 size={13} />
                  {summary?.quotationStats?.accepted} Won
                </span>
              </div>
              <div className="cmd-kpi-progress-bar">
                <div className="cmd-kpi-progress-fill cyan" style={{ width: '84%' }} />
              </div>
              <div className="cmd-kpi-footer">
                <span>{summary?.quotationStats?.sent} delivered to prospects</span>
                <span className="cmd-kpi-goal">92% Acceptance</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 3. INTERACTIVE HORIZONTAL PIPELINE FLOW VISUALIZER */}
      <section className="cmd-pipeline-flow-card">
        <div className="cmd-pipeline-flow-header">
          <div>
            <h2 className="cmd-pipeline-flow-title">Sales Conversion Pipeline</h2>
            <p className="cmd-pipeline-flow-subtitle">
              Interactive stage progression across lead generation, qualification, proposal, and client onboarding.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={ArrowRight}
            onClick={() => navigate('/opportunities')}
          >
            Pipeline Board
          </Button>
        </div>

        <div className="cmd-pipeline-stages-track">
          {/* Stage 1 */}
          <div className="cmd-stage-step" onClick={() => navigate('/leads')}>
            <div className="cmd-stage-index">01</div>
            <div className="cmd-stage-content">
              <span className="cmd-stage-name">Inbound Leads</span>
              <span className="cmd-stage-metric">{summary?.totalLeads || 24} Leads</span>
            </div>
            <span className="cmd-stage-badge">Intake</span>
            <ChevronRight size={18} className="cmd-stage-arrow" />
          </div>

          {/* Stage 2 */}
          <div className="cmd-stage-step" onClick={() => navigate('/follow-ups')}>
            <div className="cmd-stage-index">02</div>
            <div className="cmd-stage-content">
              <span className="cmd-stage-name">Contacted & Follow-up</span>
              <span className="cmd-stage-metric">18 Engaged</span>
            </div>
            <span className="cmd-stage-badge">Engaged</span>
            <ChevronRight size={18} className="cmd-stage-arrow" />
          </div>

          {/* Stage 3 */}
          <div className="cmd-stage-step" onClick={() => navigate('/opportunities')}>
            <div className="cmd-stage-index">03</div>
            <div className="cmd-stage-content">
              <span className="cmd-stage-name">Qualified Opportunities</span>
              <span className="cmd-stage-metric">{summary?.openOpportunities || 15} Deals</span>
            </div>
            <span className="cmd-stage-badge active">In Play</span>
            <ChevronRight size={18} className="cmd-stage-arrow" />
          </div>

          {/* Stage 4 */}
          <div className="cmd-stage-step" onClick={() => navigate('/quotations')}>
            <div className="cmd-stage-index">04</div>
            <div className="cmd-stage-content">
              <span className="cmd-stage-name">Formal Quotations</span>
              <span className="cmd-stage-metric">{summary?.quotationStats?.total || 8} Quotes</span>
            </div>
            <span className="cmd-stage-badge">Review</span>
            <ChevronRight size={18} className="cmd-stage-arrow" />
          </div>

          {/* Stage 5 */}
          <div className="cmd-stage-step highlight" onClick={() => navigate('/customers')}>
            <div className="cmd-stage-index won">05</div>
            <div className="cmd-stage-content">
              <span className="cmd-stage-name">Won Customers</span>
              <span className="cmd-stage-metric">{summary?.totalCustomers || 12} Accounts</span>
            </div>
            <span className="cmd-stage-badge success">Converted</span>
          </div>
        </div>
      </section>

      {/* 4. SPLIT COMMAND WORKSPACE (65% Deals & Chart / 35% Follow-ups & Stream) */}
      <section className="cmd-workspace-grid">
        {/* Left Column (65%) */}
        <div className="cmd-workspace-left">
          {/* Active Opportunities Radar Table */}
          <Card>
            <CardHeader
              title="Active Sales Opportunities Radar"
              subtitle="High-probability deals currently advancing through final stages"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={ArrowRight}
                  onClick={() => navigate('/opportunities')}
                >
                  All Deals
                </Button>
              }
            />
            <CardBody noPadding>
              {isLoading ? (
                <div style={{ padding: '24px' }}>
                  <Skeleton width="100%" height="150px" />
                </div>
              ) : (
                <div className="crm-table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Opportunity Name</th>
                        <th>Client / Account</th>
                        <th>Deal Value</th>
                        <th>Probability</th>
                        <th>Stage</th>
                        <th>Target Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOpportunities.map((opp) => (
                        <tr key={opp.id} className="cmd-table-row-hover">
                          <td>
                            <div className="cmd-opp-title">{opp.title}</div>
                            <div className="cmd-opp-sub">Owner: {opp.assignedTo}</div>
                          </td>
                          <td>
                            <span className="cmd-opp-client">{opp.customerName}</span>
                          </td>
                          <td>
                            <span className="cmd-opp-value">{formatCurrency(opp.dealValue)}</span>
                          </td>
                          <td>
                            <div className="cmd-prob-pill-box">
                              <div className="cmd-prob-bar-track">
                                <div 
                                  className="cmd-prob-bar-fill" 
                                  style={{ width: `${opp.probability}%` }}
                                />
                              </div>
                              <span className="cmd-prob-text">{opp.probability}%</span>
                            </div>
                          </td>
                          <td>
                            <Badge variant={getStatusBadgeVariant(opp.stage)}>
                              {opp.stage}
                            </Badge>
                          </td>
                          <td>
                            <span className="cmd-opp-date">{opp.expectedCloseDate}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Monthly Revenue & Pipeline Growth Chart */}
          <Card>
            <CardHeader
              title="Monthly Sales Trajectory & Revenue Velocity"
              subtitle="Closed revenue tracking against monthly quotas"
            />
            <CardBody>
              {isLoading ? (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Skeleton width="100%" height="180px" />
                </div>
              ) : (
                <div className="cmd-chart-container">
                  {summary?.monthlyPipeline?.map((bar) => {
                    const heightPercent = Math.round((bar.revenue / maxRevenue) * 100);
                    return (
                      <div key={bar.month} className="cmd-bar-column">
                        <span className="cmd-bar-value-tooltip">
                          ${Math.round(bar.revenue / 1000)}k
                        </span>
                        <div className="cmd-bar-fill-track">
                          <div
                            className="cmd-bar-fill"
                            style={{ height: `${heightPercent}%` }}
                            title={`${bar.month}: $${bar.revenue.toLocaleString()} (${bar.leads} leads)`}
                          />
                        </div>
                        <span className="cmd-bar-label">{bar.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column (35%) */}
        <div className="cmd-workspace-right">
          {/* Actionable Follow-up Queue */}
          <Card>
            <CardHeader
              title="Today's Actionable Agenda"
              subtitle="High-priority callbacks & meetings"
              action={
                <Badge variant="warning">
                  {activeFollowUps.length} Due
                </Badge>
              }
            />
            <CardBody>
              {isLoading ? (
                <Skeleton width="100%" height="200px" />
              ) : activeFollowUps.length === 0 ? (
                <div className="cmd-empty-agenda">
                  <CheckCircle2 size={36} color="var(--primary-600)" />
                  <p>All follow-ups completed for today!</p>
                </div>
              ) : (
                <div className="cmd-agenda-list">
                  {activeFollowUps.map((flw) => (
                    <div key={flw.id} className="cmd-agenda-card">
                      <div className="cmd-agenda-card-top">
                        <div className="cmd-agenda-type-chip">
                          {flw.type === 'Call' && <Phone size={13} />}
                          {flw.type === 'Email' && <Mail size={13} />}
                          {flw.type !== 'Call' && flw.type !== 'Email' && <Clock size={13} />}
                          <span>{flw.type}</span>
                        </div>
                        <div className="cmd-agenda-time">
                          <Clock size={12} />
                          <span>{formatDateTime(flw.scheduledDate)}</span>
                        </div>
                      </div>

                      <div className="cmd-agenda-title">{flw.title}</div>
                      <div className="cmd-agenda-contact">
                        <strong>{flw.entityName}</strong> • {flw.contactPerson}
                      </div>

                      <div className="cmd-agenda-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => handleQuickCompleteFollowUp(flw.id, flw.title)}
                        >
                          Mark Done
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/follow-ups')}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Live System Activity Feed */}
          <Card>
            <CardHeader
              title="Live Audit Stream"
              subtitle="Real-time actions in CRM"
            />
            <CardBody>
              {isLoading ? (
                <Skeleton width="100%" height="180px" />
              ) : (
                <div className="cmd-activity-stream">
                  {activities.map((act) => (
                    <div key={act.id} className="cmd-stream-item">
                      <div className="cmd-stream-icon">
                        <Activity size={15} />
                      </div>
                      <div className="cmd-stream-body">
                        <p className="cmd-stream-text">
                          <strong>{act.user}</strong> {act.action}{' '}
                          <span className="cmd-stream-target">{act.target}</span>
                        </p>
                        <span className="cmd-stream-time">
                          {formatTimeAgo(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
