const pipeline = [
    {
        label: "New",
        count: 82,
        percentage: 100,
        type: "new"
    },
    {
        label: "Contacted",
        count: 61,
        percentage: 74,
        type: "contacted"
    },
    {
        label: "Qualified",
        count: 44,
        percentage: 54,
        type: "qualified"
    },
    {
        label: "Proposal",
        count: 29,
        percentage: 35,
        type: "proposal"
    },
    {
        label: "Converted",
        count: 18,
        percentage: 22,
        type: "converted"
    }
];


function LeadPipeline() {

    return (
        <section className="dashboard-panel pipeline-panel">

            <div className="panel-header">

                <div>

                    <span className="panel-eyebrow">
                        SALES FUNNEL
                    </span>

                    <h2>
                        Lead pipeline
                    </h2>

                </div>

                <button className="panel-action">
                    View all →
                </button>

            </div>


            <div className="pipeline-list">

                {pipeline.map((item) => (

                    <div
                        className="pipeline-item"
                        key={item.label}
                    >

                        <div className="pipeline-info">

                            <span>
                                {item.label}
                            </span>

                            <strong>
                                {item.count}
                            </strong>

                        </div>


                        <div className="pipeline-track">

                            <div
                                className={`pipeline-progress pipeline-${item.type}`}
                                style={{
                                    width: `${item.percentage}%`
                                }}
                            />

                        </div>

                    </div>

                ))}

            </div>


            <div className="pipeline-footer">

                <div>
                    <strong>82</strong>
                    <span>Total active leads</span>
                </div>

                <div>
                    <strong>21.9%</strong>
                    <span>Conversion rate</span>
                </div>

            </div>

        </section>
    );
}

export default LeadPipeline;