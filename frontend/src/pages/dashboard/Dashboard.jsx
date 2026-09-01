import WelcomeHeader from "./components/WelcomeHeader";
import StatCard from "./components/StatCard";
import SalesOverview from "./components/SalesOverview";
import LeadPipeline from "./components/LeadPipeline";
import RecentLeads from "./components/RecentLeads";
import UpcomingFollowups from "./components/UpcomingFollowups";
import EmployeePerformance from "./components/EmployeePerformance";

import "./Dashboard.css";


function Dashboard() {

    return (
        <div className="dashboard-page">

            {/* ==============================
                HEADER
            ============================== */}

            <WelcomeHeader />


            {/* ==============================
                STATISTICS
            ============================== */}

            <section className="dashboard-stats">

                <StatCard
                    label="TOTAL LEADS"
                    value="248"
                    change="+12.8%"
                    description="vs last month"
                    icon="◌"
                    type="primary"
                />

                <StatCard
                    label="CUSTOMERS"
                    value="126"
                    change="+8.4%"
                    description="vs last month"
                    icon="◉"
                    type="secondary"
                />

                <StatCard
                    label="OPEN OPPORTUNITIES"
                    value="38"
                    change="+5.2%"
                    description="vs last month"
                    icon="◇"
                    type="warning"
                />

                <StatCard
                    label="REVENUE"
                    value="₹12.4L"
                    change="+18.6%"
                    description="vs last month"
                    icon="₹"
                    type="success"
                />

            </section>


            {/* ==============================
                ANALYTICS
            ============================== */}

            <section className="dashboard-grid dashboard-grid-main">

                <SalesOverview />

                <LeadPipeline />

            </section>


            {/* ==============================
                ACTIVITY
            ============================== */}

            <section className="dashboard-grid dashboard-grid-secondary">

                <RecentLeads />

                <UpcomingFollowups />

            </section>


            {/* ==============================
                EMPLOYEE PERFORMANCE
            ============================== */}

            <section className="dashboard-full-section">

                <EmployeePerformance />

            </section>

        </div>
    );
}


export default Dashboard;