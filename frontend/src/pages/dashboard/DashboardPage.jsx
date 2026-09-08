import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatTimeAgo, formatDateTime, getStatusBadgeVariant } from '../../utils/formatters';
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
  Percent
} from 'lucide-react';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState('month'); // 'today' | 'week' | 'month' | 'quarter'
  const [activeStageFilter, setActiveStageFilter] = useState('All');
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
      setError(err.message || 'Unable to load CRM Bento cockpit.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCompleteFollowUp = (id, title) => {
    setCompletedFollowUpIds((prev) => [...prev, id]);
    showToast(`Task completed: "${title}"`, 'success', 2200);
  };

  if (error) {
    return (
      <div className="bento-dashboard-container">
        <ErrorState
          title="Bento Cockpit Unavailable"
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  // Active follow-ups
  const activeFollowUps = pendingFollowUps.filter(
    (f) => !completedFollowUpIds.includes(f.id)
  );
  const totalFollowUps = pendingFollowUps.length || 4;
  const completedCount = completedFollowUpIds.length;
  const followUpCompletionPct = Math.round((completedCount / (totalFollowUps || 1)) * 100);

  // Target calculations ($500,000 Quota)
  const targetQuota = 500000;
  const currentPipeline = summary?.opportunityPipelineValue || 424000;
  const quotaPct = Math.min(100, Math.round((currentPipeline / targetQuota) * 100));

  // Opportunities filtered
  const filteredOpportunities = recentOpportunities.filter((opp) => {
    if (activeStageFilter === 'All') return true;
    return opp.stage.toLowerCase().includes(activeStageFilter.toLowerCase());
  });

  // Max revenue for sparklines
  const maxRevenue = summary?.monthlyPipeline?.reduce(
    (max, item) => Math.max(max, item.revenue),
    1
  ) || 1;

  return (
    <div className="bento-dashboard-container">
      {/* 1. TOP EXECUTIVE TELEMETRY & CONTEXT BAR */}
      <header className="bento-telemetry-bar">
        <div className="bento-user-welcome">
          <div className="bento-greeting-row">
            <h1 className="bento-greeting-text">
              Welcome, {user?.name || 'Administrator'}
            </h1>
            <span className="bento-role-pill">
              <ShieldCheck size={13} />
              Admin
            </span>
          </div>
          <p className="bento-subtitle-text">
            Enterprise Operations Cockpit • Real-time telemetry across revenue, deals, and execution.
          </p>
        </div>

        {/* Center: Timeframe Segmented Control */}
        <div className="bento-timeframe-controls" role="group" aria-label="Timeframe Selection">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'quarter', label: 'Q3 2026' },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              className={`bento-tf-btn ${timeframe === tf.id ? 'active' : ''}`}
              onClick={() => {
                setTimeframe(tf.id);
                showToast(`Switched view to ${tf.label}`, 'info', 1200);
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Right: Modern Quick Actions */}
        <div className="bento-header-actions">
          <Button
            variant="primary"
            size="sm"
            icon={Flame}
            onClick={() => navigate('/leads')}
          >
            New Lead
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/quotations')}
          >
            New Quote
          </Button>
        </div>
      </header>

      {/* 2. TELEMETRY STATS RIBBON (Modern Inline Glass Pills) */}
      <section className="bento-telemetry-ribbon" aria-label="Executive Telemetry">
        <div className="bento-ribbon-pill">
          <div className="bento-ribbon-icon green">
            <DollarSign size={16} />
          </div>
          <div className="bento-ribbon-info">
            <span className="bento-ribbon-label">Pipeline Value</span>
            <span className="bento-ribbon-val">{formatCurrency(currentPipeline)}</span>
          </div>
          <span className="bento-ribbon-trend pos">+14.2%</span>
        </div>

        <div className="bento-ribbon-pill">
          <div className="bento-ribbon-icon emerald">
            <Flame size={16} />
          </div>
          <div className="bento-ribbon-info">
            <span className="bento-ribbon-label">Total Leads</span>
            <span className="bento-ribbon-val">{summary?.totalLeads || 24} Leads</span>
          </div>
          <span className="bento-ribbon-trend neu">{summary?.newLeads || 12} new</span>
        </div>

        <div className="bento-ribbon-pill">
          <div className="bento-ribbon-icon teal">
            <Target size={16} />
          </div>
          <div className="bento-ribbon-info">
            <span className="bento-ribbon-label">Conversion Rate</span>
            <span className="bento-ribbon-val">{summary?.conversionRate || 68}% Win</span>
          </div>
          <span className="bento-ribbon-trend pos">Optimal</span>
        </div>

        <div className="bento-ribbon-pill">
          <div className="bento-ribbon-icon cyan">
            <Clock size={16} />
          </div>
          <div className="bento-ribbon-info">
            <span className="bento-ribbon-label">Active Tasks</span>
            <span className="bento-ribbon-val">{activeFollowUps.length} Pending</span>
          </div>
          <span className="bento-ribbon-trend warn">Priority</span>
        </div>
      </section>

      {/* 3. ASYMMETRICAL BENTO GRID WORKSPACE */}
      <section className="bento-grid">
        {/* =================================================================
            BENTO 1: DEAL MATRIX DECK (HERO WIDE - 2 COLUMNS)
           ================================================================= */}
        <div className="bento-card bento-hero-deal-deck">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <div className="bento-tag">Deal Radar</div>
              <h2 className="bento-card-title">Active Opportunities & Revenue Deck</h2>
            </div>

            {/* Stage Filter Chips */}
            <div className="bento-stage-chips">
              {['All', 'Proposal', 'Negotiation', 'Qualification'].map((stage) => (
                <button
                  key={stage}
                  type="button"
                  className={`bento-chip ${activeStageFilter === stage ? 'active' : ''}`}
                  onClick={() => setActiveStageFilter(stage)}
                >
                  {stage}
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                rightIcon={ArrowRight}
                onClick={() => navigate('/opportunities')}
              >
                All Deals
              </Button>
            </div>
          </div>

          {/* Matrix Card List */}
          {isLoading ? (
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              <Skeleton width="100%" height="68px" />
              <Skeleton width="100%" height="68px" />
              <Skeleton width="100%" height="68px" />
            </div>
          ) : (
            <div className="bento-matrix-cards">
              {filteredOpportunities.map((opp) => (
                <div key={opp.id} className="bento-matrix-card">
                  <div className="bento-matrix-col-main">
                    <div className="bento-matrix-avatar">
                      {opp.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="bento-matrix-deal-title">{opp.title}</div>
                      <div className="bento-matrix-customer-sub">
                        <span>{opp.customerName}</span>
                        <span className="bento-dot-sep">•</span>
                        <span>Owner: {opp.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bento-matrix-col-meta">
                    <div className="bento-matrix-val-row">
                      <span className="bento-matrix-val">{formatCurrency(opp.dealValue)}</span>
                      <Badge variant={getStatusBadgeVariant(opp.stage)}>
                        {opp.stage}
                      </Badge>
                    </div>

                    <div className="bento-matrix-prob-line">
                      <div className="bento-prob-bar">
                        <div
                          className="bento-prob-fill"
                          style={{ width: `${opp.probability}%` }}
                        />
                      </div>
                      <span className="bento-prob-num">{opp.probability}% Probability</span>
                      <span className="bento-dot-sep">•</span>
                      <span className="bento-date-text">Target: {opp.expectedCloseDate}</span>
                    </div>
                  </div>

                  <div className="bento-matrix-col-action">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/opportunities')}
                    >
                      Inspect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================================
            BENTO 2: TODAY'S ACTION RADAR & CIRCULAR SLA DIAL (1 COLUMN)
           ================================================================= */}
        <div className="bento-card bento-action-radar">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <div className="bento-tag warn">Execution Radar</div>
              <h2 className="bento-card-title">Daily Client Touchpoints</h2>
            </div>
            <span className="bento-due-count">{activeFollowUps.length} Pending</span>
          </div>

          {/* Circular Progress Gauge Component */}
          <div className="bento-radial-sla-box">
            <div className="bento-circle-dial-container">
              <svg className="bento-circle-svg" viewBox="0 0 100 100">
                <circle
                  className="bento-circle-bg"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="8"
                />
                <circle
                  className="bento-circle-fg"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * (completedCount / (totalFollowUps || 1)))}
                />
              </svg>
              <div className="bento-circle-text">
                <span className="bento-circle-pct">{followUpCompletionPct}%</span>
                <span className="bento-circle-sub">Done</span>
              </div>
            </div>

            <div className="bento-radial-sla-stats">
              <div className="bento-sla-item">
                <span className="bento-sla-item-num">{completedCount}</span>
                <span className="bento-sla-item-desc">Completed Today</span>
              </div>
              <div className="bento-sla-item">
                <span className="bento-sla-item-num">{activeFollowUps.length}</span>
                <span className="bento-sla-item-desc">Pending Action</span>
              </div>
            </div>
          </div>

          {/* Actionable Follow-up Micro-Deck */}
          <div className="bento-action-items">
            {activeFollowUps.length === 0 ? (
              <div className="bento-empty-action">
                <CheckCircle2 size={32} color="var(--primary-600)" />
                <p>All client callbacks completed for today!</p>
              </div>
            ) : (
              activeFollowUps.slice(0, 3).map((flw) => (
                <div key={flw.id} className="bento-action-row">
                  <div className="bento-action-type-bubble">
                    {flw.type === 'Call' && <Phone size={14} />}
                    {flw.type === 'Email' && <Mail size={14} />}
                    {flw.type !== 'Call' && flw.type !== 'Email' && <Clock size={14} />}
                  </div>
                  <div className="bento-action-content">
                    <div className="bento-action-title">{flw.title}</div>
                    <div className="bento-action-meta">
                      <strong>{flw.entityName}</strong> • {flw.contactPerson}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bento-check-btn"
                    title="Mark Done"
                    onClick={() => handleCompleteFollowUp(flw.id, flw.title)}
                  >
                    <Check size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =================================================================
            BENTO 3: REVENUE TARGET RADIAL GAUGE & SPARKLINE (1 COLUMN)
           ================================================================= */}
        <div className="bento-card bento-revenue-gauge">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <div className="bento-tag">Financial Run-Rate</div>
              <h2 className="bento-card-title">Monthly Quota Progress</h2>
            </div>
            <span className="bento-quota-tag">{quotaPct}% Target</span>
          </div>

          {/* Target Gauge Visual */}
          <div className="bento-quota-visual-box">
            <div className="bento-quota-metric-display">
              <div className="bento-quota-current">
                {formatCurrency(currentPipeline)}
              </div>
              <div className="bento-quota-target">
                of {formatCurrency(targetQuota)} Annual Milestone
              </div>
            </div>

            <div className="bento-segmented-meter">
              <div
                className="bento-segmented-meter-fill"
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>

          {/* Monthly Sparkline Columns */}
          <div className="bento-spark-columns">
            {summary?.monthlyPipeline?.map((bar) => {
              const heightPct = Math.round((bar.revenue / maxRevenue) * 100);
              return (
                <div key={bar.month} className="bento-spark-col">
                  <div className="bento-spark-track">
                    <div
                      className="bento-spark-fill"
                      style={{ height: `${heightPct}%` }}
                      title={`${bar.month}: $${bar.revenue.toLocaleString()}`}
                    />
                  </div>
                  <span className="bento-spark-month">{bar.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================
            BENTO 4: CONVERSION HEALTH & VELOCITY (1 COLUMN)
           ================================================================= */}
        <div className="bento-card bento-conversion-health">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <div className="bento-tag">Health Score</div>
              <h2 className="bento-card-title">Pipeline Conversion Velocity</h2>
            </div>
            <div className="bento-score-badge">
              <Sparkles size={13} />
              88 / 100
            </div>
          </div>

          {/* Stage Conversion Horizontal Metrics */}
          <div className="bento-funnel-breakdown">
            {summary?.leadDistribution?.map((stageItem) => {
              const total = summary.leadDistribution.reduce((a, b) => a + b.count, 0) || 1;
              const pct = Math.round((stageItem.count / total) * 100);
              return (
                <div key={stageItem.stage} className="bento-funnel-row">
                  <div className="bento-funnel-meta">
                    <span className="bento-funnel-name">{stageItem.stage}</span>
                    <span className="bento-funnel-val">{stageItem.count} ({pct}%)</span>
                  </div>
                  <div className="bento-funnel-bar">
                    <div
                      className="bento-funnel-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: stageItem.color || 'var(--primary-500)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bento-lead-flow-note">
            <Flame size={14} color="var(--primary-600)" />
            <span>Lead intake rate: +14 inquiries scheduled this month</span>
          </div>
        </div>

        {/* =================================================================
            BENTO 5: LIVE AUDIT & TEAM PULSE (1 COLUMN)
           ================================================================= */}
        <div className="bento-card bento-live-stream">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <div className="bento-tag">Audit Ticker</div>
              <h2 className="bento-card-title">System Live Stream</h2>
            </div>
            <span className="bento-live-dot-pulse" />
          </div>

          {/* Activity Stream */}
          <div className="bento-stream-list">
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="bento-stream-row">
                <div className="bento-stream-bullet" />
                <div className="bento-stream-text">
                  <span className="bento-stream-user">{act.user}</span>{' '}
                  <span className="bento-stream-action">{act.action}</span>{' '}
                  <strong className="bento-stream-target">{act.target}</strong>
                  <div className="bento-stream-time">{formatTimeAgo(act.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
