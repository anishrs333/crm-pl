import api from './api';

export const dashboardService = {
  /**
   * Fetch aggregate summary metrics from backend
   */
  getSummary: async () => {
    try {
      const stats = await api.get('/reports/dashboard-stats/');

      const [oppRes, leadRes, taskRes] = await Promise.allSettled([
        api.get('/opportunities/'),
        api.get('/leads/'),
        api.get('/tasks/'),
      ]);

      const opps = oppRes.status === 'fulfilled' ? (oppRes.value?.results || oppRes.value || []) : [];
      const leads = leadRes.status === 'fulfilled' ? (leadRes.value?.results || leadRes.value || []) : [];
      const tasks = taskRes.status === 'fulfilled' ? (taskRes.value?.results || taskRes.value || []) : [];

      const totalLeads = stats.total_leads ?? leads.length;
      const totalCustomers = stats.total_customers ?? 0;
      const openOpportunities = stats.total_opportunities ?? opps.length;
      const pendingTasks = stats.open_tasks ?? tasks.filter((t) => (t.status || '').toLowerCase() !== 'completed').length;

      const newLeads = leads.filter((l) => (l.status || '').toLowerCase() === 'new').length;
      const convertedLeads = leads.filter((l) => {
        const st = (l.status || '').toLowerCase();
        return st === 'converted' || st === 'qualified';
      }).length;

      const opportunityPipelineValue = opps.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

      return {
        totalCustomers,
        totalLeads,
        newLeads,
        convertedLeads,
        openOpportunities,
        opportunityPipelineValue,
        pendingTasks,
        conversionRate,
        totalRevenue: opportunityPipelineValue,
        quotationStats: {
          total: 0,
          accepted: 0,
          sent: 0,
          draft: 0,
          totalValue: 0,
        },
      };
    } catch (err) {
      console.warn('Unable to load backend dashboard stats, using zero defaults:', err.message);
      return {
        totalCustomers: 0,
        totalLeads: 0,
        newLeads: 0,
        convertedLeads: 0,
        openOpportunities: 0,
        opportunityPipelineValue: 0,
        pendingTasks: 0,
        conversionRate: 0,
        totalRevenue: 0,
        quotationStats: { total: 0, accepted: 0, sent: 0, draft: 0, totalValue: 0 },
      };
    }
  },

  /**
   * Fetch recent audit activities from backend tasks/events
   */
  getRecentActivities: async () => {
    try {
      const res = await api.get('/tasks/');
      const tasks = res?.results || res || [];
      return tasks.slice(0, 5).map((t) => ({
        id: t.id,
        user: t.assigned_to_name || 'System User',
        action: 'scheduled task',
        target: t.title,
        timestamp: t.created_at || t.updated_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Fetch recent leads from backend
   */
  getRecentLeads: async () => {
    try {
      const res = await api.get('/leads/');
      const leads = res?.results || res || [];
      return leads.slice(0, 5).map((l) => ({
        id: l.id,
        name: l.company || `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Untitled Lead',
        contactName: `${l.first_name || ''} ${l.last_name || ''}`.trim(),
        email: l.email,
        status: l.status,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Fetch recent opportunities from backend
   */
  getRecentOpportunities: async () => {
    try {
      const res = await api.get('/opportunities/');
      const opps = res?.results || res || [];
      return opps.slice(0, 10).map((o) => ({
        id: o.id,
        title: o.title,
        customerName: o.customer_name || (o.customer ? `Customer #${o.customer}` : 'Prospect'),
        dealValue: parseFloat(o.amount) || 0,
        stage: o.stage || 'discovery',
        probability: o.probability || 10,
        expectedCloseDate: o.expected_close_date,
        assignedTo: o.assigned_to_name || 'Direct Rep',
      }));
    } catch {
      return [];
    }
  },

  /**
   * Fetch pending follow-ups / tasks from backend
   */
  getPendingFollowUps: async () => {
    try {
      const res = await api.get('/tasks/');
      const tasks = res?.results || res || [];
      return tasks
        .filter((t) => (t.status || '').toLowerCase() !== 'completed')
        .slice(0, 6)
        .map((t) => ({
          id: t.id,
          title: t.title,
          entityName: t.description || t.title,
          contactPerson: 'Account Contact',
          type: (t.title || '').toLowerCase().includes('call') ? 'Call' : 'Email',
          scheduledDate: t.due_date || t.created_at || new Date().toISOString(),
          assignedTo: t.assigned_to_name || 'Staff',
          status: 'Pending',
        }));
    } catch {
      return [];
    }
  },
};
