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
  Percent,
  Kanban,
  UserCheck,
  Shield,
  ArrowRightCircle,
  Trophy,
  Filter
} from 'lucide-react';
import './DashboardPage.css';

// Initial Kanban Stage Definitions
const STAGES = [
  { id: 'Discovery', label: '1. Discovery & Intake', icon: Flame, color: '#3b82f6' },
  { id: 'FollowUp', label: '2. Active Follow-up', icon: PhoneCall, color: '#f59e0b' },
  { id: 'Proposal', label: '3. Proposal & Negotiation', icon: FileText, color: '#059669' },
  { id: 'Won', label: '4. Closed / Won', icon: Trophy, color: '#10b981' },
];

export const DashboardPage = () => {
  const { user, isAdmin, isManager, switchRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [pipelineDeals, setPipelineDeals] = useState([]);
  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const [completedFollowUpIds, setCompletedFollowUpIds] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'high_value' | 'my_deals'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Map opportunities to our 4 interactive Kanban stages
      const mappedDeals = (oppData || []).map((opp, index) => {
        let stageId = 'Discovery';
        if (opp.stage === 'Qualification' || index % 4 === 0) stageId = 'Discovery';
        else if (opp.stage === 'Contacted' || index % 4 === 1) stageId = 'FollowUp';
        else if (opp.stage === 'Proposal' || opp.stage === 'Negotiation' || index % 4 === 2) stageId = 'Proposal';
        else if (opp.stage === 'Closed Won' || index % 4 === 3) stageId = 'Won';

        return {
          ...opp,
          kanbanStage: stageId,
        };
      });

      setPipelineDeals(mappedDeals);
      setPendingFollowUps(followData || []);
    } catch (err) {
      console.error('Failed loading CRM Kanban cockpit:', err);
      setError(err.message || 'Unable to load interactive sales pipeline.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Interactive stage advance action
  const handleAdvanceStage = (dealId, e) => {
    e.stopPropagation();
    setPipelineDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== dealId) return deal;
        const currentIdx = STAGES.findIndex((s) => s.id === deal.kanbanStage);
        if (currentIdx < STAGES.length - 1) {
          const nextStage = STAGES[currentIdx + 1];
          showToast(`Advanced "${deal.title}" to ${nextStage.label}`, 'success', 2200);
          return { ...deal, kanbanStage: nextStage.id };
        } else {
          showToast(`"${deal.title}" is already Closed Won!`, 'info', 2000);
          return deal;
        }
      })
    );
  };

  // Quick complete follow-up
  const handleCompleteFollowUp = (id, title) => {
    setCompletedFollowUpIds((prev) => [...prev, id]);
    showToast(`Touchpoint logged as complete: "${title}"`, 'success', 2200);
  };

  // Filter deals
  const filteredDeals = pipelineDeals.filter((deal) => {
    if (filterMode === 'high_value') return (deal.dealValue || 0) >= 50000;
    if (filterMode === 'my_deals') return deal.assignedTo?.includes(user?.name?.split(' ')[0] || '');
    return true;
  });

  const activeFollowUps = pendingFollowUps.filter(
    (f) => !completedFollowUpIds.includes(f.id)
  );

  const totalPipelineVal = pipelineDeals
    .filter((d) => d.kanbanStage !== 'Won')
    .reduce((sum, d) => sum + (d.dealValue || 0), 0);

  const wonDealsVal = pipelineDeals
    .filter((d) => d.kanbanStage === 'Won')
    .reduce((sum, d) => sum + (d.dealValue || 0), 0);

  const quotaTarget = 500000;
  const quotaPercent = quotaTarget > 0 ? Math.min(Math.round((wonDealsVal / quotaTarget) * 100), 100) : 0;

  if (error) {
    return (
      <div className="kanban-deck-container">
        <ErrorState
          title="Pipeline Board Unavailable"
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="kanban-deck-container">
      {/* =================================================================
          1. TOP MINIMALIST FLIGHT BAR & ROLE PREVIEW SWITCHER
         ================================================================= */}
      <header className="flight-header-strip">
        <div className="flight-user-col">
          <div className="flight-title-row">
            <h1 className="flight-title">
              Hello, {user?.name || 'Partner'}
            </h1>

            {/* Dynamic Role Pill */}
            <span className={`flight-role-badge ${isAdmin ? 'admin' : 'manager'}`}>
              <ShieldCheck size={13} />
              {isAdmin ? 'Admin Console' : 'Sales Manager'}
            </span>

            {/* Role Switcher Pill for Testing */}
            <div className="flight-role-switcher" title="Click to test Admin vs Manager permissions">
              <button
                type="button"
                className={`flight-switch-opt ${isAdmin ? 'active' : ''}`}
                onClick={() => {
                  switchRole('Admin');
                  showToast('Operating with Administrator Privileges', 'info', 1800);
                }}
              >
                Admin
              </button>
              <button
                type="button"
                className={`flight-switch-opt ${isManager ? 'active' : ''}`}
                onClick={() => {
                  switchRole('Manager');
                  showToast('Operating with Sales Manager Privileges', 'info', 1800);
                }}
              >
                Manager
              </button>
            </div>
          </div>

          <p className="flight-subtext">
            {isAdmin 
              ? 'Administrator Overview — Global access across Pipeline, Accounts, Quotations & User Administration.'
              : 'Sales Manager Deck — Tracking live deal movements, follow-ups, and operational team quota.'}
          </p>
        </div>

        {/* Telemetry Inline Numbers */}
        <div className="flight-telemetry-metrics">
          <div className="flight-metric-unit">
            <span className="flight-metric-caption">Active Pipeline</span>
            <span className="flight-metric-figure">{formatCurrency(totalPipelineVal)}</span>
          </div>

          <div className="flight-metric-divider" />

          <div className="flight-metric-unit">
            <span className="flight-metric-caption">Closed Won</span>
            <span className="flight-metric-figure green">{formatCurrency(wonDealsVal)}</span>
          </div>

          <div className="flight-metric-divider" />

          <div className="flight-metric-unit">
            <span className="flight-metric-caption">Action Due</span>
            <span className="flight-metric-figure orange">{activeFollowUps.length} calls</span>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flight-header-actions">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/leads')}
          >
            New Deal / Lead
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/quotations')}
          >
            Create Quote
          </Button>
        </div>
      </header>

      {/* =================================================================
          2. CORE WORKSPACE: LIVE INTERACTIVE PIPELINE KANBAN BOARD
         ================================================================= */}
      <section className="pipeline-board-section" aria-label="Interactive Deal Pipeline">
        <div className="board-control-bar">
          <div className="board-title-group">
            <div className="board-main-title">
              <Kanban size={18} className="board-title-icon" />
              <span>Live Sales & Deal Pipeline Board</span>
            </div>
            <span className="board-deal-counter">
              {filteredDeals.length} active deals in board
            </span>
          </div>

          {/* Filter Pills */}
          <div className="board-filter-cluster">
            <span className="board-filter-label">Filter:</span>
            {[
              { id: 'all', label: 'All Opportunities' },
              { id: 'high_value', label: 'High Value (≥ $50k)' },
              { id: 'my_deals', label: 'My Assigned' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`board-filter-chip ${filterMode === opt.id ? 'active' : ''}`}
                onClick={() => setFilterMode(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* The 4 Stage Columns */}
        <div className="kanban-columns-track">
          {STAGES.map((stage) => {
            const dealsInStage = filteredDeals.filter((d) => d.kanbanStage === stage.id);
            const stageTotal = dealsInStage.reduce((sum, d) => sum + (d.dealValue || 0), 0);
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title-box">
                    <Icon size={16} style={{ color: stage.color }} />
                    <span className="kanban-stage-title">{stage.label}</span>
                  </div>
                  <span className="kanban-stage-count">{dealsInStage.length}</span>
                </div>

                <div className="kanban-column-total">
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(stageTotal)}</strong>
                </div>

                <div className="kanban-cards-stack">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="kanban-card-skeleton">
                        <Skeleton width="60%" height="14px" />
                        <Skeleton width="40%" height="18px" style={{ margin: '8px 0' }} />
                        <Skeleton width="100%" height="12px" />
                      </div>
                    ))
                  ) : dealsInStage.length === 0 ? (
                    <div className="kanban-empty-column">
                      <span>No deals in this stage</span>
                    </div>
                  ) : (
                    dealsInStage.map((deal) => (
                      <div
                        key={deal.id}
                        className="kanban-deal-card"
                        onClick={() => navigate('/opportunities')}
                      >
                        <div className="kanban-card-top">
                          <span className="kanban-customer-badge">
                            {deal.customerName}
                          </span>
                          <span className="kanban-prob-badge">
                            {deal.probability}% Prob
                          </span>
                        </div>

                        <h3 className="kanban-deal-title">{deal.title}</h3>

                        <div className="kanban-deal-val-row">
                          <span className="kanban-deal-amount">
                            {formatCurrency(deal.dealValue)}
                          </span>
                        </div>

                        <div className="kanban-deal-footer">
                          <div className="kanban-owner-info">
                            <span className="kanban-owner-avatar">
                              {deal.assignedTo?.charAt(0) || 'U'}
                            </span>
                            <span className="kanban-owner-name">{deal.assignedTo}</span>
                          </div>

                          {stage.id !== 'Won' && (
                            <button
                              type="button"
                              className="kanban-advance-btn"
                              title="Advance Deal to Next Stage"
                              onClick={(e) => handleAdvanceStage(deal.id, e)}
                            >
                              <span>Next</span>
                              <ChevronRight size={13} />
                            </button>
                          )}
                          {stage.id === 'Won' && (
                            <span className="kanban-won-pill">
                              <Check size={12} /> Closed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================
          3. BOTTOM TWIN OPERATIONS DECK (60% Execution / 40% Intelligence)
         ================================================================= */}
      <section className="twin-operations-deck">
        {/* Left Wing: Actionable Client Touchpoints Radar */}
        <div className="deck-panel deck-left">
          <div className="deck-panel-header">
            <div>
              <h2 className="deck-panel-title">Today's Client Execution Queue</h2>
              <p className="deck-panel-sub">Scheduled callbacks, meetings, and prospect touchpoints</p>
            </div>
            <Badge variant="warning">{activeFollowUps.length} Pending Today</Badge>
          </div>

          <div className="deck-touchpoint-list">
            {activeFollowUps.length === 0 ? (
              <div className="deck-empty-state">
                <CheckCircle2 size={36} color="var(--primary-600)" />
                <p>All scheduled client touchpoints for today are completed!</p>
              </div>
            ) : (
              activeFollowUps.map((item) => (
                <div key={item.id} className="deck-touchpoint-card">
                  <div className="deck-touchpoint-icon-box">
                    {item.type === 'Call' && <Phone size={15} />}
                    {item.type === 'Email' && <Mail size={15} />}
                    {item.type !== 'Call' && item.type !== 'Email' && <Clock size={15} />}
                  </div>

                  <div className="deck-touchpoint-body">
                    <div className="deck-touchpoint-header-line">
                      <span className="deck-touchpoint-client">{item.entityName}</span>
                      <span className="deck-touchpoint-time">
                        <Clock size={11} />
                        {formatDateTime(item.scheduledDate)}
                      </span>
                    </div>

                    <div className="deck-touchpoint-title">{item.title}</div>
                    <div className="deck-touchpoint-contact">
                      Contact: <strong>{item.contactPerson}</strong> • Assigned: {item.assignedTo}
                    </div>
                  </div>

                  <div className="deck-touchpoint-actions">
                    <button
                      type="button"
                      className="deck-action-done-btn"
                      onClick={() => handleCompleteFollowUp(item.id, item.title)}
                      title="Mark Complete"
                    >
                      <Check size={14} />
                      <span>Done</span>
                    </button>
                    <button
                      type="button"
                      className="deck-action-call-btn"
                      onClick={() => {
                        showToast(`Dialing client: ${item.contactPerson}...`, 'info', 2000);
                      }}
                      title="Instant Trigger"
                    >
                      {item.type === 'Call' ? <Phone size={13} /> : <Mail size={13} />}
                      <span>{item.type === 'Call' ? 'Call' : 'Email'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Wing: Role Intelligence & Financial Quota Velocity */}
        <div className="deck-panel deck-right">
          <div className="deck-panel-header">
            <div>
              <h2 className="deck-panel-title">Operations & Role Intel</h2>
              <p className="deck-panel-sub">
                {isAdmin ? 'System telemetry & access privileges' : 'Manager sales quota performance'}
              </p>
            </div>
            <span className="deck-live-pulse-badge">
              <span className="pulse-circle" />
              Live Feed
            </span>
          </div>

          {/* Quota Progress Gauge */}
          <div className="deck-quota-box">
            <div className="deck-quota-top">
              <span className="deck-quota-label">Annual Sales Target Progress</span>
              <span className="deck-quota-percent">{quotaPercent}% to Target</span>
            </div>
            <div className="deck-quota-track">
              <div className="deck-quota-fill" style={{ width: `${quotaPercent}%` }} />
            </div>
            <div className="deck-quota-bottom">
              <span>{formatCurrency(wonDealsVal)} Closed</span>
              <span>Target: {formatCurrency(quotaTarget)}</span>
            </div>
          </div>

          {/* Role Privileges Card */}
          <div className="deck-role-info-card">
            <div className="deck-role-info-header">
              <Shield size={16} color="var(--primary-600)" />
              <strong>{isAdmin ? 'Administrator Capabilities' : 'Sales Manager Capabilities'}</strong>
            </div>
            <p className="deck-role-desc">
              {isAdmin 
                ? 'Full system rights: Manage all employees, reset access, edit master entity records, manage settings and export reports.'
                : 'Management rights: Full pipeline and deal progression, quotation creation, customer management, and team follow-ups.'}
            </p>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                icon={Users}
                onClick={() => navigate('/users')}
              >
                Manage Employees
              </Button>
            )}
          </div>

          {/* Live Action Stream Ticker */}
          <div className="deck-live-ticker">
            <span className="deck-ticker-header">Real-time System Audit:</span>
            <div className="deck-ticker-stream">
              {activities.length === 0 ? (
                <div className="deck-ticker-item">
                  <div className="deck-ticker-dot" />
                  <div className="deck-ticker-text" style={{ color: 'var(--text-muted)' }}>
                    System ready. Connected to live. 
                  </div>
                </div>
              ) : (
                activities.slice(0, 3).map((act) => (
                  <div key={act.id} className="deck-ticker-item">
                    <div className="deck-ticker-dot" />
                    <div className="deck-ticker-text">
                      <strong>{act.user}</strong> {act.action}{' '}
                      <span className="deck-ticker-target">{act.target}</span>
                      <span className="deck-ticker-time">{formatTimeAgo(act.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
