import React from 'react';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, getInitials } from '../../utils/formatters';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { DashboardCard } from '../../components/common/DashboardCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  Download, 
  Calendar 
} from 'lucide-react';
import './ReportsPage.css';

export const ReportsPage = () => {
  const { showToast } = useToast();

  const handleExport = (format) => {
    showToast(`Generating and downloading CRM ${format.toUpperCase()} report...`, 'success', 3000);
  };

  const repPerformance = [
    { name: 'Alex Rivera', role: 'Sales Lead', dealsWon: 14, revenue: 235000, winRate: 72 },
    { name: 'Jessica Chen', role: 'Account Exec', dealsWon: 11, revenue: 184500, winRate: 68 },
    { name: 'Sarah Connor', role: 'VP Sales', dealsWon: 8, revenue: 160000, winRate: 80 },
    { name: 'Marcus Vance', role: 'CS Representative', dealsWon: 5, revenue: 42000, winRate: 50 },
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="reports-title-area">
          <h1>Analytics & Reports</h1>
          <p>Comprehensive breakdown of revenue, sales pipeline velocity, and team performance.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            icon={Download}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={() => handleExport('pdf')}
          >
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="reports-metrics-grid">
        <DashboardCard
          title="Annual Run Rate (ARR)"
          value="₹ 1,24,00,000"
          icon={TrendingUp}
          variant="success"
          trend="+22.8%"
          trendType="positive"
        />
        <DashboardCard
          title="Avg. Deal Size"
          value="₹ 54,80,000"
          icon={DollarSign}
          variant="primary"
          trend="+8.4%"
          trendType="positive"
        />
        <DashboardCard
          title="Customer Acq. Cost"
          value="₹ 3,42,000"
          icon={Target}
          variant="info"
          trend="-12.1%"
          trendType="positive"
          subtitle="lower is better"
        />
        <DashboardCard
          title="Gross Revenue Churn"
          value="1.8%"
          icon={Users}
          variant="warning"
          trend="-0.4%"
          trendType="positive"
          subtitle="industry benchmark 2.5%"
        />
      </div>

      {/* Sales Rep Performance Leaderboard */}
      <Card>
        <CardHeader
          title="Sales Representative Performance"
          subtitle="Closed deals, total revenue contribution, and conversion efficiency"
        />
        <CardBody noPadding>
          <div className="crm-table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Representative</th>
                  <th>Deals Won</th>
                  <th>Total Pipeline Won</th>
                  <th>Win Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {repPerformance.map((rep) => (
                  <tr key={rep.name}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="rep-avatar">{getInitials(rep.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {rep.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {rep.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{rep.dealsWon} deals</td>
                    <td style={{ fontWeight: 700, color: 'var(--success-solid)' }}>
                      {formatCurrency(rep.revenue)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '100px',
                            height: '6px',
                            backgroundColor: 'var(--bg-subtle)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${rep.winRate}%`,
                              height: '100%',
                              backgroundColor: 'var(--primary-600)',
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {rep.winRate}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={rep.winRate >= 70 ? 'success' : 'info'}>
                        {rep.winRate >= 70 ? 'Top Performer' : 'On Track'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
