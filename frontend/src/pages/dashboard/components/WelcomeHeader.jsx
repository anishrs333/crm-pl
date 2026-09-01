function WelcomeHeader() {

    return (
        <div className="dashboard-welcome">

            <div className="welcome-content">

                <span className="welcome-eyebrow">
                    CRM OVERVIEW
                </span>

                <h1>
                    Good afternoon, Abishek
                </h1>

                <p>
                    Here's what's happening with your
                    customer relationships today.
                </p>

            </div>


            <div className="welcome-actions">

                <button className="btn-secondary">
                    Export
                </button>

                <button className="btn-primary">
                    + Add Lead
                </button>

            </div>

        </div>
    );
}

export default WelcomeHeader;