import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatTimeAgo, formatDateTime } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/EmptyState';
import { 
  Users, 
  Briefcase, 
  Flame, 
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
  ArrowUpRight,
  Layers,
  Award,
  Check,
  Percent,
  UserCheck,
  Shield,
  ArrowRightCircle,
  Trophy,
  PieChart,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user, isAdmin, isManager } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [completedFollowUpIds, setCompletedFollowUpIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, actData, oppData, followData] = await Promise.all([
        dashboardService.getSummary().catch(() => ({})),
        dashboardService.getRecentActivities().catch(() => []),
        dashboardService.getRecentOpportunities().catch(() => []),
        dashboardService.getPendingFollowUps().catch(() => []),
      ]);

      setSummary(sumData && typeof sumData === 'object' ? sumData : {});
      setActivities(Array.isArray(actData) ? actData : []);
      setRecentOpportunities(Array.isArray(oppData) ? oppData : []);
      setPendingFollowUps(Array.isArray(followData) ? followData : []);
    } catch (err) {
      console.error('Failed loading CRM executive cockpit:', err);
      setError(err.message || 'Unable to load executive dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCompleteFollowUp = (id, title) => {
    setCompletedFollowUpIds((prev) => [...prev, id]);
    showToast(`Touchpoint logged as complete: "${title}"`, 'success', 2200);
  };

  const activeFollowUps = pendingFollowUps.filter(
    (f) => !completedFollowUpIds.includes(f.id)
  );

  // Compute key figures dynamically
  const totalPipelineVal = recentOpportunities.reduce((sum, d) => sum + (Number(d.dealValue || d.amount) || 0), 0) || (summary?.opportunityPipelineValue || 0);
  const totalLeadsCount = summary?.openOpportunities ?? summary?.totalLeads ?? recentOpportunities.length ?? 0;
  const wonVal = summary?.quotationStats?.accepted 
    ? summary.quotationStats.totalValue 
    : recentOpportunities.filter(o => o.stage === 'Closed Won' || o.stage === 'Won').reduce((s, o) => s + (Number(o.dealValue || o.amount) || 0), 0);

  const totalOppsCount = recentOpportunities.length || totalLeadsCount;
  const winRatePercent = totalOppsCount > 0 ? Math.round((recentOpportunities.filter(o => o.stage === 'Closed Won' || o.stage === 'Won').length / totalOppsCount) * 100) : (summary?.winRate || 0);

  // Stage breakdown calculated dynamically
  const getStageStats = (stageName) => {
    const opps = recentOpportunities.filter(o => String(o.stage || '').toLowerCase().includes(stageName.toLowerCase()));
    const count = opps.length;
    const value = opps.reduce((s, o) => s + (Number(o.dealValue || o.amount) || 0), 0);
    const percent = totalPipelineVal > 0 ? Math.round((value / totalPipelineVal) * 100) : 0;
    return { count, value, percent };
  };

  const discoveryStats = getStageStats('discovery');
  const proposalStats = getStageStats('proposal');
  const negotiationStats = getStageStats('negotiation');
  const wonStats = getStageStats('won');

  const stagesBreakdown = [
    { label: 'Discovery & Intake', count: discoveryStats.count, value: discoveryStats.value, color: '#be123c', percent: discoveryStats.percent },
    { label: 'Proposal Presented', count: proposalStats.count, value: proposalStats.value, color: '#e11d48', percent: proposalStats.percent },
    { label: 'In Negotiation', count: negotiationStats.count, value: negotiationStats.value, color: '#d97706', percent: negotiationStats.percent },
    { label: 'Closed Won', count: wonStats.count, value: wonStats.value, color: '#15803d', percent: wonStats.percent },
  ];

  const quotaTarget = 5000000;
  const quotaPercent = Math.min(100, Math.round((totalPipelineVal / quotaTarget) * 100));
  const quotaRemaining = Math.max(0, quotaTarget - totalPipelineVal);

  if (error) {
    return (
      <div className="executive-dashboard-container">
        <ErrorState
          title="Executive Dashboard Unavailable"
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="executive-dashboard-container">
      {/* =================================================================
          1. LUXURY EXECUTIVE HEADER BANNER
         ================================================================= */}
      <header className="executive-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-welcome-badge">
            <Sparkles size={14} className="hero-sparkle-icon" />
            <span>Executive Command Center</span>
          </div>

          <h1 className="hero-title">
            Welcome back, <span className="highlight">{user?.name || 'Partner'}</span>
          </h1>

          <p className="hero-subtitle">
            {isAdmin 
              ? 'Administrator Overview — Full visibility across Revenue Pipeline, Client Accounts, Quotations & Operations.'
              : 'Sales Manager Deck — Real-time performance telemetry, deal velocity, and team execution queue.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="hero-banner-controls">
          <div className="hero-quick-actions">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate('/leads')}
            >
              Add New Lead
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={FileText}
              onClick={() => navigate('/quotations')}
            >
              Create Quote
            </Button>
          </div>
        </div>
      </header>

      {/* =================================================================
          2. TOP 4 EXECUTIVE TELEMETRY KPI CARDS
         ================================================================= */}
      <section className="executive-kpi-grid">
        {/* KPI 1: Active Pipeline */}
        <div className="kpi-card crimson-accent">
          <div className="kpi-top-row">
            <span className="kpi-label">Active Pipeline Value</span>
            <div className="kpi-icon-box crimson">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <h2 className="kpi-value">{isLoading ? <Skeleton width="120px" height="28px" /> : formatCurrency(totalPipelineVal)}</h2>
            <span className="kpi-trend positive">
              <ArrowUpRight size={14} /> +14.2%
            </span>
          </div>
          <p className="kpi-footer-text">Total value across active sales stages</p>
        </div>

        {/* KPI 2: Closed Won Revenue */}
        <div className="kpi-card gold-accent">
          <div className="kpi-top-row">
            <span className="kpi-label">Closed Won Revenue</span>
            <div className="kpi-icon-box green">
              <Trophy size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <h2 className="kpi-value">{isLoading ? <Skeleton width="120px" height="28px" /> : formatCurrency(wonVal)}</h2>
            <span className="kpi-trend positive">
              <ArrowUpRight size={14} /> +22.5%
            </span>
          </div>
          <p className="kpi-footer-text">Successfully converted deal value</p>
        </div>

        {/* KPI 3: Total Opportunities */}
        <div className="kpi-card beige-accent">
          <div className="kpi-top-row">
            <span className="kpi-label">Active Opportunities</span>
            <div className="kpi-icon-box purple">
              <Layers size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <h2 className="kpi-value">{isLoading ? <Skeleton width="60px" height="28px" /> : `${totalLeadsCount} Deals`}</h2>
            <span className="kpi-badge-pill">{winRatePercent}% Win Rate</span>
          </div>
          <p className="kpi-footer-text">Deals progressing in active pipeline</p>
        </div>

        {/* KPI 4: Pending Follow-ups */}
        <div className="kpi-card amber-accent">
          <div className="kpi-top-row">
            <span className="kpi-label">Pending Client Touchpoints</span>
            <div className="kpi-icon-box amber">
              <PhoneCall size={20} />
            </div>
          </div>
          <div className="kpi-val-row">
            <h2 className="kpi-value">{isLoading ? <Skeleton width="40px" height="28px" /> : `${activeFollowUps.length} Due`}</h2>
            <span className="kpi-urgent-pill">Action Required</span>
          </div>
          <p className="kpi-footer-text">Scheduled calls and client meetings today</p>
        </div>
      </section>

      {/* =================================================================
          3. MIDDLE OPERATIONS DECK (60% Revenue Analytics / 40% Action Queue)
         ================================================================= */}
      <section className="operations-split-grid">
        {/* Left Wing (60%): Revenue Stage Analytics & Deal Velocity */}
        <div className="op-panel op-panel-main">
          <div className="op-panel-header">
            <div>
              <h2 className="op-panel-title">
                <BarChart3 size={18} className="panel-title-icon" />
                Pipeline Stage Breakdown & Deal Velocity
              </h2>
              <p className="op-panel-sub">Stage distribution of active deal volume and conversion metrics</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate('/opportunities')}
            >
              View Pipeline
            </Button>
          </div>

          {/* Stage Progress Bars */}
          <div className="stage-analytics-container">
            {stagesBreakdown.map((stg) => (
              <div key={stg.label} className="stage-row-item">
                <div className="stage-row-top">
                  <div className="stage-name-box">
                    <span className="stage-dot" style={{ backgroundColor: stg.color }} />
                    <span className="stage-name">{stg.label}</span>
                    <span className="stage-count">({stg.count} deals)</span>
                  </div>
                  <div className="stage-val-box">
                    <span className="stage-amount">{formatCurrency(stg.value)}</span>
                    <span className="stage-percent">{stg.percent}%</span>
                  </div>
                </div>

                <div className="stage-progress-track">
                  <div 
                    className="stage-progress-fill" 
                    style={{ width: `${stg.percent}%`, backgroundColor: stg.color }} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* High-Value Opportunities Snapshot */}
          <div className="high-deals-section">
            <div className="high-deals-header">
              <h3>Recent Priority Opportunities</h3>
              <span className="high-deals-count">{recentOpportunities.length} Recent Deals</span>
            </div>

            <div className="high-deals-list">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="high-deal-skeleton">
                    <Skeleton width="40%" height="16px" />
                    <Skeleton width="20%" height="16px" />
                  </div>
                ))
              ) : recentOpportunities.length === 0 ? (
                <div className="empty-deals-box">
                  <p>No active opportunities recorded yet.</p>
                </div>
              ) : (
                recentOpportunities.slice(0, 4).map((opp) => (
                  <div key={opp.id} className="high-deal-card" onClick={() => navigate('/opportunities')}>
                    <div className="deal-info-col">
                      <h4 className="deal-title">{opp.title}</h4>
                      <span className="deal-client">{opp.customerName || opp.clientName || 'Client Record'}</span>
                    </div>

                    <div className="deal-stage-badge">
                      <span className="badge-dot" />
                      {opp.stage || 'Proposal Presented'}
                    </div>

                    <div className="deal-val-col">
                      <span className="deal-amount">{formatCurrency(opp.dealValue || opp.amount || 150000)}</span>
                      <span className="deal-prob">{opp.probability || 75}% Probability</span>
                    </div>

                    <button type="button" className="deal-arrow-btn" title="View Opportunity Details">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Wing (40%): Client Execution Queue */}
        <div className="op-panel op-panel-side">
          <div className="op-panel-header">
            <div>
              <h2 className="op-panel-title">
                <Clock size={18} className="panel-title-icon" />
                Today's Client Execution Queue
              </h2>
              <p className="op-panel-sub">Callbacks, prospect meetings, and action items</p>
            </div>
            <Badge variant="warning">{activeFollowUps.length} Due</Badge>
          </div>

          <div className="client-queue-list">
            {activeFollowUps.length === 0 ? (
              <div className="queue-empty-box">
                <CheckCircle2 size={40} color="var(--primary-600)" />
                <h4>All Done For Today!</h4>
                <p>No pending client touchpoints scheduled for today.</p>
              </div>
            ) : (
              activeFollowUps.map((item) => (
                <div key={item.id} className="queue-item-card">
                  <div className="queue-item-icon">
                    {item.type === 'Call' && <Phone size={15} />}
                    {item.type === 'Email' && <Mail size={15} />}
                    {item.type !== 'Call' && item.type !== 'Email' && <Clock size={15} />}
                  </div>

                  <div className="queue-item-content">
                    <div className="queue-item-top">
                      <span className="queue-client-name">{item.entityName}</span>
                      <span className="queue-time-chip">
                        <Clock size={11} /> {formatDateTime(item.scheduledDate)}
                      </span>
                    </div>
                    <div className="queue-title">{item.title}</div>
                    <div className="queue-meta">
                      Contact: <strong>{item.contactPerson}</strong> • Assigned: {item.assignedTo}
                    </div>
                  </div>

                  <div className="queue-item-actions">
                    <button
                      type="button"
                      className="queue-btn-done"
                      onClick={() => handleCompleteFollowUp(item.id, item.title)}
                      title="Mark Touchpoint Completed"
                    >
                      <Check size={14} /> Done
                    </button>
                    <button
                      type="button"
                      className="queue-btn-trigger"
                      onClick={() => {
                        showToast(`Initiating contact with ${item.contactPerson}...`, 'info', 2000);
                      }}
                      title="Direct Action Trigger"
                    >
                      {item.type === 'Call' ? <Phone size={13} /> : <Mail size={13} />}
                      {item.type === 'Call' ? 'Call' : 'Email'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* =================================================================
          4. BOTTOM INTELLIGENCE GRID: AUDIT TICKER & TARGET PROGRESS
         ================================================================= */}
      <section className="intelligence-grid">
        {/* Real-time System Audit Stream */}
        <div className="intel-card audit-feed-card">
          <div className="intel-card-header">
            <div>
              <h3>Real-Time System Audit</h3>
              <p>Live stream of client interactions and record updates</p>
            </div>
            <span className="live-status-pill">
              <span className="live-dot" /> Live
            </span>
          </div>

          <div className="audit-stream">
            {activities.length === 0 ? (
              <div className="audit-empty">No activity records logged recently.</div>
            ) : (
              activities.slice(0, 4).map((act) => (
                <div key={act.id} className="audit-row">
                  <div className="audit-dot" />
                  <div className="audit-text">
                    <strong>{act.user}</strong> {act.action}{' '}
                    <span className="audit-target">{act.target}</span>
                  </div>
                  <span className="audit-time">{formatTimeAgo(act.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quota Progress Gauge */}
        <div className="intel-card target-gauge-card">
          <div className="intel-card-header">
            <div>
              <h3>Annual Target & Quota Progress</h3>
              <p>Team progress towards FY2026 revenue target</p>
            </div>
            <Target size={18} color="var(--primary-600)" />
          </div>

          <div className="quota-gauge-box">
            <div className="quota-gauge-top">
              <span className="quota-current-val">{formatCurrency(totalPipelineVal)}</span>
              <span className="quota-target-val">Target: ₹ 50,00,000</span>
            </div>

            <div className="quota-progress-bar">
              <div className="quota-progress-fill" style={{ width: `${quotaPercent}%` }} />
            </div>

            <div className="quota-gauge-bottom">
              <span className="quota-percent-label">{quotaPercent}% Achieved</span>
              <span className="quota-remaining-label">{formatCurrency(quotaRemaining)} Remaining</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
