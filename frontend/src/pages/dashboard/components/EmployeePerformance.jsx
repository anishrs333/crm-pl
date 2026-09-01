const employees = [
    {
        name: "Arun Kumar",
        initials: "AK",
        deals: 24,
        revenue: "₹4.8L",
        progress: 88
    },
    {
        name: "Priya Menon",
        initials: "PM",
        deals: 19,
        revenue: "₹3.7L",
        progress: 72
    },
    {
        name: "Karthik R",
        initials: "KR",
        deals: 16,
        revenue: "₹2.9L",
        progress: 61
    }
];


function EmployeePerformance() {

    return (
        <section className="dashboard-panel employee-panel">

            <div className="panel-header">

                <div>

                    <span className="panel-eyebrow">
                        TEAM
                    </span>

                    <h2>
                        Employee performance
                    </h2>

                </div>

                <button className="panel-action">
                    View report →
                </button>

            </div>


            <div className="employee-table">

                <div className="employee-table-head">

                    <span>
                        EMPLOYEE
                    </span>

                    <span>
                        DEALS
                    </span>

                    <span>
                        REVENUE
                    </span>

                    <span>
                        TARGET
                    </span>

                </div>


                {employees.map((employee) => (

                    <div
                        className="employee-row"
                        key={employee.name}
                    >

                        <div className="employee-info">

                            <div className="employee-avatar">
                                {employee.initials}
                            </div>

                            <strong>
                                {employee.name}
                            </strong>

                        </div>


                        <span>
                            {employee.deals}
                        </span>


                        <strong>
                            {employee.revenue}
                        </strong>


                        <div className="employee-progress">

                            <div className="employee-progress-track">

                                <div
                                    style={{
                                        width: `${employee.progress}%`
                                    }}
                                />

                            </div>

                            <span>
                                {employee.progress}%
                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default EmployeePerformance;