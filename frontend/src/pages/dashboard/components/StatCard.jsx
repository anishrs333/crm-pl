function StatCard({
    label,
    value,
    change,
    description,
    icon,
    type
}) {

    return (
        <article className={`stat-card stat-card-${type}`}>

            <div className="stat-card-top">

                <span className="stat-label">
                    {label}
                </span>

                <span className="stat-icon">
                    {icon}
                </span>

            </div>


            <div className="stat-value">
                {value}
            </div>


            <div className="stat-footer">

                <span className="stat-change">
                    ↗ {change}
                </span>

                <span className="stat-description">
                    {description}
                </span>

            </div>

        </article>
    );
}

export default StatCard;