import api, { isMockEnabled, mockDelay } from './api';
import { 
  initialUsers, 
  initialCustomers, 
  initialLeads, 
  initialTasks, 
  initialActivities,
  initialFollowUps,
  initialOpportunities,
  initialQuotations 
} from './mockData';

export const getDashboardStats = async () => {
    if (isMockEnabled) {
        return dashboardService.getSummary();
    }
    return await api.get('/reports/dashboard-stats/');
};

export const dashboardService = {
  getSummary: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 300);

      const activeUsers = initialUsers.filter((u) => u.status === 'Active').length;
      const totalCustomers = initialCustomers.length;
      const totalLeads = initialLeads.length;
      const newLeads = initialLeads.filter((l) => l.status === 'New').length;
      const convertedLeads = initialLeads.filter((l) => l.status === 'Won' || l.status === 'Qualified').length;
      
      const pendingFollowUps = initialFollowUps.filter((f) => f.status === 'Pending').length;
      const openOpportunities = initialOpportunities.filter((o) => o.status === 'Open').length;
      const opportunityPipelineValue = initialOpportunities
        .filter((o) => o.status === 'Open')
        .reduce((sum, o) => sum + (o.dealValue || 0), 0);

      const quotationStats = {
        total: initialQuotations.length,
        accepted: initialQuotations.filter((q) => q.status === 'Accepted').length,
        sent: initialQuotations.filter((q) => q.status === 'Sent').length,
        draft: initialQuotations.filter((q) => q.status === 'Draft').length,
        totalValue: initialQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0),
      };

      const pendingTasks = initialTasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length;
      const completedTasks = initialTasks.filter((t) => t.status === 'Completed').length;
      
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
      const totalRevenue = initialCustomers.reduce((acc, c) => acc + (c.dealValue || 0), 0);

      return {
        total_leads: totalLeads,
        total_customers: totalCustomers,
        total_opportunities: openOpportunities,
        open_tasks: pendingTasks,
        totalCustomers,
        activeUsers,
        totalLeads,
        newLeads,
        convertedLeads,
        pendingFollowUps,
        openOpportunities,
        opportunityPipelineValue,
        quotationStats,
        pendingTasks,
        completedTasks,
        conversionRate,
        totalRevenue,
        monthlyPipeline: [
          { month: 'Oct', revenue: 42000, leads: 18 },
          { month: 'Nov', revenue: 68000, leads: 24 },
          { month: 'Dec', revenue: 95000, leads: 32 },
          { month: 'Jan', revenue: 78000, leads: 28 },
          { month: 'Feb', revenue: 112000, leads: 38 },
          { month: 'Mar', revenue: 145000, leads: 46 },
        ],
        leadDistribution: [
          { stage: 'New', count: 12, color: '#3b82f6' },
          { stage: 'Contacted', count: 18, color: '#f59e0b' },
          { stage: 'Qualified', count: 15, color: '#10b981' },
          { stage: 'Proposal', count: 8, color: '#6366f1' },
        ],
      };
    }

    return await api.get('/reports/dashboard-stats/');
  },

  getRecentActivities: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      return [...initialActivities];
    }
    return await api.get('/reports/dashboard-stats/');
  },

  getRecentLeads: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      return initialLeads.slice(0, 5);
    }
    return await api.get('/leads/');
  },

  getRecentCustomers: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      return initialCustomers.slice(0, 5);
    }
    return await api.get('/customers/');
  },

  getPendingFollowUps: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      return initialFollowUps.filter((f) => f.status === 'Pending').slice(0, 4);
    }
    return await api.get('/tasks/');
  },
};

export default dashboardService;
