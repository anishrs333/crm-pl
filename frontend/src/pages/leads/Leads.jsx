import { useState } from "react";

import LeadStats from "./components/LeadStats";
import LeadFilters from "./components/LeadFilters";
import LeadTable from "./components/LeadTable";
import AddLeadModal from "./components/AddLeadModal";

import "./Leads.css";

function Leads() {
    const [showAddLead, setShowAddLead] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    const [leads, setLeads] = useState([
        {
            id: 1,
            name: "Arun Kumar",
            phone: "9876543210",
            email: "arun@gmail.com",
            source: "Website",
            assignedTo: "Abishek",
            status: "New",
            priority: "High",
            createdDate: "01 Sep 2026",
        },
        {
            id: 2,
            name: "Priya Nair",
            phone: "9876501234",
            email: "priya@gmail.com",
            source: "Referral",
            assignedTo: "Rahul",
            status: "Contacted",
            priority: "Medium",
            createdDate: "31 Aug 2026",
        },
        {
            id: 3,
            name: "Vishnu Raj",
            phone: "9988776655",
            email: "vishnu@gmail.com",
            source: "Facebook",
            assignedTo: "Abishek",
            status: "Qualified",
            priority: "High",
            createdDate: "30 Aug 2026",
        },
    ]);

    const handleAddLead = (newLead) => {
        const lead = {
            id: Date.now(),
            ...newLead,
            createdDate: new Date().toLocaleDateString("en-GB"),
        };

        setLeads((previousLeads) => [
            lead,
            ...previousLeads,
        ]);

        setShowAddLead(false);
    };

    return (
        <div className="leads-page">

            {/* Header */}

            <div className="leads-page-header">

                <div>
                    <span className="leads-eyebrow">
                        CUSTOMER MANAGEMENT
                    </span>

                    <h1>Leads</h1>

                    <p>
                        Manage, track and convert your sales leads.
                    </p>
                </div>

                <button
                    className="leads-add-button"
                    onClick={() => setShowAddLead(true)}
                >
                    <span>+</span>
                    Add Lead
                </button>

            </div>

            {/* Statistics */}

            <LeadStats leads={leads} />

            {/* Filters */}

            <LeadFilters
                search={search}
                setSearch={setSearch}
                status={status}
                setStatus={setStatus}
                priority={priority}
                setPriority={setPriority}
            />

            {/* Table */}

            <LeadTable
                leads={leads}
                search={search}
                status={status}
                priority={priority}
            />

            {/* Add Lead Modal */}

            {showAddLead && (
                <AddLeadModal
                    onClose={() => setShowAddLead(false)}
                    onAdd={handleAddLead}
                />
            )}

        </div>
    );
}

export default Leads;