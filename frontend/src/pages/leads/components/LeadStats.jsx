function LeadStats() {
    const stats = [
        {
            label: "TOTAL LEADS",
            value: "248",
            change: "+12.8%",
            icon: "◌",
            type: "primary",
        },
        {
            label: "NEW LEADS",
            value: "86",
            change: "+8.4%",
            icon: "✦",
            type: "info",
        },
        {
            label: "QUALIFIED",
            value: "64",
            change: "+6.2%",
            icon: "✓",
            type: "success",
        },
        {
            label: "CONVERSION RATE",
            value: "25.8%",
            change: "+3.1%",
            icon: "↗",
            type: "warning",
        },
    ];

    return (
        <section className="lead-stats">
            {stats.map((stat) => (
                <div
                    className={`lead-stat-card lead-stat-${stat.type}`}
                    key={stat.label}
                >
                    <div className="lead-stat-top">
                        <span className="lead-stat-label">
                            {stat.label}
                        </span>

                        <span className="lead-stat-icon">
                            {stat.icon}
                        </span>
                    </div>

                    <div className="lead-stat-value">
                        {stat.value}
                    </div>

                    <div className="lead-stat-footer">
                        <span className="lead-stat-change">
                            {stat.change}
                        </span>

                        <span className="lead-stat-description">
                            vs last month
                        </span>
                    </div>
                </div>
            ))}
        </section>
    );
}

export default LeadStats;