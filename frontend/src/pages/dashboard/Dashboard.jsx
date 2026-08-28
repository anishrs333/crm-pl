import "./Dashboard.css";
import api from "../../services/api";

function Dashboard() {
  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <div>
            <p>Total Users</p>
            <h2>120</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👤</div>
          <div>
            <p>Customers</p>
            <h2>85</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📈</div>
          <div>
            <p>Leads</p>
            <h2>42</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">💰</div>
          <div>
            <p>Revenue</p>
            <h2>₹1.2L</h2>
          </div>
        </div>

      </div>

      <div className="dashboard-content">

        <div className="dashboard-panel">
          <h3>Recent Activity</h3>

          <div className="activity-item">
            <span>New customer registered</span>
            <small>5 min ago</small>
          </div>

          <div className="activity-item">
            <span>User account created</span>
            <small>20 min ago</small>
          </div>

          <div className="activity-item">
            <span>New lead added</span>
            <small>1 hour ago</small>
          </div>

        </div>

        <div className="dashboard-panel">
          <h3>Quick Overview</h3>

          <div className="overview-row">
            <span>Active Users</span>
            <strong>98</strong>
          </div>

          <div className="overview-row">
            <span>Pending Leads</span>
            <strong>16</strong>
          </div>

          <div className="overview-row">
            <span>Completed Deals</span>
            <strong>31</strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;