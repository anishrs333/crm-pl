import { useState, useEffect } from "react";
import { getDashboardStats } from "../../services/dashboardService";

import WelcomeHeader from "./components/WelcomeHeader";
import StatCard from "./components/StatCard";
import SalesOverview from "./components/SalesOverview";
import LeadPipeline from "./components/LeadPipeline";
import RecentLeads from "./components/RecentLeads";
import UpcomingFollowups from "./components/UpcomingFollowups";
import EmployeePerformance from "./components/EmployeePerformance";

import "./Dashboard.css";

function Dashboard() {
    const [stats, setStats] = useState({
        total_leads: 0,
        total_customers: 0,
        total_opportunities: 0,
        open_tasks: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to load dashboard metrics from backend:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="dashboard-page">
            {/* HEADER */}
            <WelcomeHeader />

            {/* STATISTICS */}
            <section className="dashboard-stats">
                <StatCard
                    label="TOTAL LEADS"
                    value={loading ? "..." : stats.total_leads.toString()}
                    change="+12.8%"
                    description="vs last month"
                    icon="◌"
                    type="primary"
                />

                <StatCard
                    label="CUSTOMERS"
                    value={loading ? "..." : stats.total_customers.toString()}
                    change="+8.4%"
                    description="vs last month"
                    icon="◉"
                    type="secondary"
                />

                <StatCard
                    label="OPEN OPPORTUNITIES"
                    value={loading ? "..." : stats.total_opportunities.toString()}
                    change="+5.2%"
                    description="vs last month"
                    icon="◇"
                    type="warning"
                />

                <StatCard
                    label="OPEN TASKS"
                    value={loading ? "..." : stats.open_tasks.toString()}
                    change="+18.6%"
                    description="pending actions"
                    icon="✓"
                    type="success"
                />
            </section>

            {/* ANALYTICS */}
            <section className="dashboard-grid dashboard-grid-main">
                <SalesOverview />
                <LeadPipeline />
            </section>

            {/* ACTIVITY */}
            <section className="dashboard-grid dashboard-grid-secondary">
                <RecentLeads />
                <UpcomingFollowups />
            </section>

            {/* EMPLOYEE PERFORMANCE */}
            <section className="dashboard-full-section">
                <EmployeePerformance />
            </section>
        </div>
    );
}

export default Dashboard;