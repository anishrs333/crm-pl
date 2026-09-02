import { useState, useEffect, useCallback } from "react";
import { getLeads, createLead } from "../../services/leadService";

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

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getLeads({ search, status, priority });
            // Support paginated or list response
            const leadList = data.results ? data.results : (Array.isArray(data) ? data : []);
            
            // Format lead objects for display compatibility
            const formatted = leadList.map((item) => ({
                id: item.id,
                name: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
                first_name: item.first_name,
                last_name: item.last_name,
                company_name: item.company_name,
                phone: item.phone || "-",
                email: item.email || "-",
                source: item.source_label || item.source,
                assignedTo: item.assigned_to_name || "Unassigned",
                status: item.status_label || item.status,
                priority: item.priority_label || item.priority,
                rawStatus: item.status,
                rawPriority: item.priority,
                createdDate: new Date(item.created_at).toLocaleDateString("en-GB"),
                estimatedBudget: item.estimated_budget,
            }));
            setLeads(formatted);
        } catch (err) {
            console.error("Error fetching leads:", err);
            setError("Failed to load leads from server.");
        } finally {
            setLoading(false);
        }
    }, [search, status, priority]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleAddLead = async (newLeadData) => {
        try {
            await createLead(newLeadData);
            setShowAddLead(false);
            fetchLeads(); // Refresh lead list
        } catch (err) {
            console.error("Error creating lead:", err);
            alert("Failed to create lead. Please check the required fields.");
        }
    };

    return (
        <div className="leads-page">
            {/* Header */}
            <div className="leads-page-header">
                <div>
                    <span className="leads-eyebrow">CUSTOMER MANAGEMENT</span>
                    <h1>Leads</h1>
                    <p>Manage, track and convert your sales leads.</p>
                </div>

                <button
                    className="leads-add-button"
                    onClick={() => setShowAddLead(true)}
                >
                    <span>+</span>
                    Add Lead
                </button>
            </div>

            {/* Error Message */}
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}

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
            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading leads...</div>
            ) : (
                <LeadTable
                    leads={leads}
                    search={search}
                    status={status}
                    priority={priority}
                />
            )}

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