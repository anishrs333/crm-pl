import "./LeadTable.css";

const leadsData = [
    {
        id: 1,
        name: "Rahul Kumar",
        initials: "RK",
        company: "ABC Technologies",
        email: "rahul@abc.com",
        phone: "+91 98765 43210",
        status: "Qualified",
        priority: "High",
        assignedTo: "Arun",
        value: "₹2,50,000",
        lastContact: "Today",
    },
    {
        id: 2,
        name: "Priya Nair",
        initials: "PN",
        company: "Tech Solutions",
        email: "priya@techsolutions.com",
        phone: "+91 98765 12345",
        status: "New",
        priority: "Medium",
        assignedTo: "Abishek",
        value: "₹1,80,000",
        lastContact: "Yesterday",
    },
    {
        id: 3,
        name: "Sanjay Kumar",
        initials: "SK",
        company: "Digital Works",
        email: "sanjay@digitalworks.com",
        phone: "+91 99887 66554",
        status: "Contacted",
        priority: "Low",
        assignedTo: "Meena",
        value: "₹95,000",
        lastContact: "2 days ago",
    },
    {
        id: 4,
        name: "Anjali Menon",
        initials: "AM",
        company: "Bright Solutions",
        email: "anjali@bright.com",
        phone: "+91 91234 56789",
        status: "Proposal",
        priority: "High",
        assignedTo: "Arun",
        value: "₹3,20,000",
        lastContact: "3 days ago",
    },
    {
        id: 5,
        name: "Vishnu Raj",
        initials: "VR",
        company: "Nova Systems",
        email: "vishnu@nova.com",
        phone: "+91 90000 11223",
        status: "New",
        priority: "Medium",
        assignedTo: "Abishek",
        value: "₹1,25,000",
        lastContact: "4 days ago",
    },
];

function LeadTable({
    search = "",
    status = "All",
    priority = "All",
}) {
    const filteredLeads = leadsData.filter((lead) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            lead.name.toLowerCase().includes(searchValue) ||
            lead.company.toLowerCase().includes(searchValue) ||
            lead.email.toLowerCase().includes(searchValue) ||
            lead.phone.toLowerCase().includes(searchValue);

        const matchesStatus =
            status === "All" || lead.status === status;

        const matchesPriority =
            priority === "All" || lead.priority === priority;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );
    });

    const handleView = (lead) => {
        console.log("View Lead:", lead);
    };

    const handleEdit = (lead) => {
        console.log("Edit Lead:", lead);
    };

    const handleDelete = (lead) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${lead.name}?`
        );

        if (confirmed) {
            console.log("Delete Lead:", lead.id);
        }
    };

    return (
        <section className="lead-table-panel">

            <div className="lead-table-header">
                <div>
                    <span className="table-eyebrow">
                        LEAD DATABASE
                    </span>

                    <h2>All Leads</h2>

                    <p>
                        Manage and track your sales leads.
                    </p>
                </div>

                <span className="lead-count">
                    {filteredLeads.length} Leads
                </span>
            </div>

            <div className="lead-table-wrapper">

                <table className="lead-table">

                    <thead>
                        <tr>
                            <th>LEAD</th>
                            <th>COMPANY</th>
                            <th>STATUS</th>
                            <th>PRIORITY</th>
                            <th>ASSIGNED TO</th>
                            <th>VALUE</th>
                            <th>LAST CONTACT</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (

                                <tr key={lead.id}>

                                    <td>
                                        <div className="lead-person">

                                            <div className="lead-table-avatar">
                                                {lead.initials}
                                            </div>

                                            <div className="lead-person-info">

                                                <strong>
                                                    {lead.name}
                                                </strong>

                                                <span>
                                                    {lead.email}
                                                </span>

                                            </div>

                                        </div>
                                    </td>

                                    <td>
                                        <span className="company-name">
                                            {lead.company}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`lead-status status-${lead.status.toLowerCase()}`}
                                        >
                                            {lead.status}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`lead-priority priority-${lead.priority.toLowerCase()}`}
                                        >
                                            <span className="priority-dot" />
                                            {lead.priority}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="assigned-person">
                                            {lead.assignedTo}
                                        </span>
                                    </td>

                                    <td>
                                        <strong className="lead-value">
                                            {lead.value}
                                        </strong>
                                    </td>

                                    <td>
                                        <span className="last-contact">
                                            {lead.lastContact}
                                        </span>
                                    </td>

                                    <td>

                                        <div className="lead-actions">

                                            <button
                                                className="action-view"
                                                onClick={() =>
                                                    handleView(lead)
                                                }
                                                title="View"
                                            >
                                                View
                                            </button>

                                            <button
                                                className="action-edit"
                                                onClick={() =>
                                                    handleEdit(lead)
                                                }
                                                title="Edit"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="action-delete"
                                                onClick={() =>
                                                    handleDelete(lead)
                                                }
                                                title="Delete"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))
                        ) : (

                            <tr>
                                <td
                                    colSpan="8"
                                    className="lead-empty"
                                >
                                    <div>
                                        <strong>
                                            No leads found
                                        </strong>

                                        <span>
                                            Try changing your search
                                            or filters.
                                        </span>
                                    </div>
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );
}

export default LeadTable;