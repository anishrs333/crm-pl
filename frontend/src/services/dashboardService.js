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
    return dashboardService.getSummary();
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
      
      return {
        totalLeads,
        newLeads,
        convertedLeads,
        totalCustomers,
        activeUsers,
        pendingFollowUps,
        openOpportunities,
        opportunityPipelineValue,
        quotationStats,
        pendingTasks,
        monthlyPipeline: [],
        leadDistribution: [],
      };
    }

    try {
      const data = await api.get('/reports/dashboard-stats/');
      return data || {};
    } catch (e) {
      console.warn('Backend stats endpoint fallback:', e);
      return {
        totalLeads: 0,
        newLeads: 0,
        convertedLeads: 0,
        totalCustomers: 0,
        openOpportunities: 0,
        opportunityPipelineValue: 0,
        quotationStats: { total: 0, accepted: 0, sent: 0, totalValue: 0 },
        pendingFollowUps: 0,
        monthlyPipeline: [],
        leadDistribution: [],
      };
    }
  },

  getRecentActivities: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      return [];
    }
    try {
      const data = await api.get('/leads/');
      const results = Array.isArray(data) ? data : (data?.results || data?.data || []);
      if (!Array.isArray(results) || results.length === 0) return [];
      return results.slice(0, 5).map((l) => ({
        id: `act-${l.id}`,
        user: l.assigned_to_name || 'Staff',
        action: 'created lead',
        target: l.first_name ? `${l.first_name} ${l.last_name || ''}` : (l.company_name || 'New Client'),
        timestamp: l.created_at || new Date().toISOString(),
      }));
    } catch (e) {
      return [];
    }
  },

  getRecentLeads: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      return [];
    }
    try {
      const data = await api.get('/leads/');
      const results = Array.isArray(data) ? data : (data?.results || data?.data || []);
      return Array.isArray(results) ? results : [];
    } catch (e) {
      return [];
    }
  },

  getPendingFollowUps: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      return [];
    }
    try {
      const data = await api.get('/tasks/');
      const tasks = Array.isArray(data) ? data : (data?.results || data?.data || []);
      if (!Array.isArray(tasks) || tasks.length === 0) return [];
      return tasks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        type: t.task_type_label || t.task_type || 'Follow-up',
        entityName: t.customer_name || t.lead_name || 'Client',
        contactPerson: t.assigned_to_name || 'Rep',
        scheduledDate: t.due_date || t.created_at,
        assignedTo: t.assigned_to_name || 'Assigned Rep',
      }));
    } catch (e) {
      return [];
    }
  },

  getRecentOpportunities: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      return [];
    }
    try {
      const res = await api.get('/opportunities/');
      const list = Array.isArray(res) ? res : (res?.results || res?.data || []);
      if (!Array.isArray(list) || list.length === 0) return [];
      return list.map((opp) => ({
        id: opp.id,
        title: opp.title,
        customerName: typeof opp.customer_name === 'string' ? opp.customer_name : (opp.customer || 'Client'),
        contactPerson: opp.assigned_to_name || 'Rep',
        dealValue: Number(opp.amount) || 0,
        stage: opp.stage_label || opp.stage || 'Discovery',
        probability: opp.probability || 50,
      }));
    } catch (e) {
      return [];
    }
  },
};


export default dashboardService;
