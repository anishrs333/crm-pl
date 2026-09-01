
function SalesOverview() {

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug"
    ];

    const values = [
        35,
        48,
        42,
        61,
        54,
        76,
        68,
        86
    ];

    return (
        <section className="dashboard-panel sales-panel">

            <div className="panel-header">

                <div>
                    <span className="panel-eyebrow">
                        PERFORMANCE
                    </span>

                    <h2>
                        Revenue overview
                    </h2>
                </div>


                <select className="panel-select">
                    <option>Last 8 months</option>
                    <option>This year</option>
                    <option>Last year</option>
                </select>

            </div>


            <div className="revenue-summary">

                <strong>
                    ₹12.4L
                </strong>

                <span>
                    +18.6% from previous period
                </span>

            </div>


            <div className="chart-area">

                <div className="chart-y-axis">

                    <span>15L</span>
                    <span>10L</span>
                    <span>5L</span>
                    <span>0</span>

                </div>


                <div className="chart">

                    <div className="chart-grid">

                        <span />
                        <span />
                        <span />
                        <span />

                    </div>


                    <svg
                        className="revenue-line"
                        viewBox="0 0 800 240"
                        preserveAspectRatio="none"
                    >

                        <defs>

                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >

                                <stop
                                    offset="0%"
                                    stopColor="rgba(22,121,107,0.18)"
                                />

                                <stop
                                    offset="100%"
                                    stopColor="rgba(22,121,107,0)"
                                />

                            </linearGradient>

                        </defs>


                        <path
                            d="
                                M0 190
                                C80 175,
                                100 150,
                                160 165
                                S240 125,
                                300 145
                                S380 90,
                                440 120
                                S520 80,
                                580 95
                                S680 40,
                                800 55
                                L800 240
                                L0 240
                                Z
                            "
                            fill="url(#revenueGradient)"
                        />


                        <path
                            d="
                                M0 190
                                C80 175,
                                100 150,
                                160 165
                                S240 125,
                                300 145
                                S380 90,
                                440 120
                                S520 80,
                                580 95
                                S680 40,
                                800 55
                            "
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="3"
                            vectorEffect="non-scaling-stroke"
                        />

                    </svg>


                    <div className="chart-months">

                        {months.map((month) => (
                            <span key={month}>
                                {month}
                            </span>
                        ))}

                    </div>

                </div>

            </div>

        </section>
    );
}

export default SalesOverview;