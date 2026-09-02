import api from "./api";

export const getDashboardStats = async () => {
    const response = await api.get("/reports/dashboard-stats/");
    return response.data;
};

const dashboardService = {
    getDashboardStats,
};

export default dashboardService;
