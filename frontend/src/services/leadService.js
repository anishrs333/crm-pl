import api from "./api";

export const getLeads = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "All") params.append("status", filters.status.toLowerCase());
    if (filters.priority && filters.priority !== "All") params.append("priority", filters.priority.toLowerCase());

    const response = await api.get(`/leads/?${params.toString()}`);
    return response.data;
};

export const createLead = async (leadData) => {
    const response = await api.post("/leads/", leadData);
    return response.data;
};

export const convertLead = async (id, conversionData) => {
    const response = await api.post(`/leads/${id}/convert/`, conversionData);
    return response.data;
};

export const addLeadNote = async (id, note) => {
    const response = await api.post(`/leads/${id}/add-note/`, { note });
    return response.data;
};

const leadService = {
    getLeads,
    createLead,
    convertLead,
    addLeadNote,
};

export default leadService;
