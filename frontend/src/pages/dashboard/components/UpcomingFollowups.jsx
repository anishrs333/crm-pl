const followups = [
    {
        time: "10:30 AM",
        name: "Priya Menon",
        type: "Call",
        priority: "High"
    },
    {
        time: "11:45 AM",
        name: "Karthik R",
        type: "Meeting",
        priority: "Medium"
    },
    {
        time: "02:00 PM",
        name: "Rahul Kumar",
        type: "Follow-up",
        priority: "High"
    },
    {
        time: "04:30 PM",
        name: "Meena S",
        type: "Email",
        priority: "Low"
    }
];


function UpcomingFollowups() {

    return (
        <section className="dashboard-panel followups-panel">

            <div className="panel-header">

                <div>

                    <span className="panel-eyebrow">
                        TODAY
                    </span>

                    <h2>
                        Upcoming follow-ups
                    </h2>

                </div>

                <button className="panel-action">
                    Calendar →
                </button>

            </div>


            <div className="followup-list">

                {followups.map((item) => (

                    <div
                        className="followup-item"
                        key={`${item.time}-${item.name}`}
                    >

                        <div className="followup-time">
                            {item.time}
                        </div>


                        <div className="followup-content">

                            <strong>
                                {item.name}
                            </strong>

                            <span>
                                {item.type}
                            </span>

                        </div>


                        <span
                            className={`priority priority-${item.priority.toLowerCase()}`}
                        >
                            {item.priority}
                        </span>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default UpcomingFollowups;