const leads = [
    {
        name: "Rahul Kumar",
        company: "TechNova",
        status: "Qualified",
        initials: "RK"
    },
    {
        name: "Priya Menon",
        company: "BluePeak",
        status: "New",
        initials: "PM"
    },
    {
        name: "Arun Raj",
        company: "Vertex Labs",
        status: "Contacted",
        initials: "AR"
    },
    {
        name: "Meena S",
        company: "CloudNine",
        status: "Proposal",
        initials: "MS"
    }
];


function RecentLeads() {

    return (
        <section className="dashboard-panel recent-leads-panel">

            <div className="panel-header">

                <div>

                    <span className="panel-eyebrow">
                        LEADS
                    </span>

                    <h2>
                        Recent leads
                    </h2>

                </div>

                <button className="panel-action">
                    View all →
                </button>

            </div>


            <div className="recent-leads-list">

                {leads.map((lead) => (

                    <div
                        className="recent-lead"
                        key={lead.name}
                    >

                        <div className="lead-avatar">
                            {lead.initials}
                        </div>


                        <div className="lead-details">

                            <strong>
                                {lead.name}
                            </strong>

                            <span>
                                {lead.company}
                            </span>

                        </div>


                        <span
                            className={`lead-status status-${lead.status
                                .toLowerCase()
                                .replace(" ", "-")}`}
                        >
                            {lead.status}
                        </span>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default RecentLeads;