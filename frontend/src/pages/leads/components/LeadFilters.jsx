import "./LeadFilters.css";

function LeadFilters({
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
}) {
    const clearFilters = () => {
        setSearch("");
        setStatus("All");
        setPriority("All");
    };

    return (
        <div className="lead-filters">

            {/* Search */}
            <div className="lead-search">
                <span className="lead-search-icon">⌕</span>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search leads..."
                />

                {search && (
                    <button
                        className="search-clear"
                        onClick={() => setSearch("")}
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Status */}
            <div className="lead-filter-group">
                <label>Status</label>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Converted">Converted</option>
                </select>
            </div>

            {/* Priority */}
            <div className="lead-filter-group">
                <label>Priority</label>

                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="All">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Clear */}
            <button
                className="lead-clear-filters"
                onClick={clearFilters}
            >
                Clear filters
            </button>

        </div>
    );
}

export default LeadFilters;