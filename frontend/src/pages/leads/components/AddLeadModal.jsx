import { useState } from "react";
import "./AddLeadModal.css";

function AddLeadModal({ onClose, onAdd }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_name: "",
        source: "website",
        status: "new",
        priority: "warm",
        estimated_budget: "",
        notes: "",
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || null,
            phone: formData.phone || null,
            company_name: formData.company_name || null,
            source: formData.source,
            status: formData.status,
            priority: formData.priority,
            estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
            notes: formData.notes,
        };

        if (onAdd) {
            await onAdd(payload);
        }
        setSubmitting(false);
    };

    return (
        <div className="lead-modal-overlay" onClick={onClose}>
            <div
                className="lead-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="lead-modal-header">
                    <div className="lead-modal-title-area">
                        <div className="lead-modal-icon">+</div>
                        <div>
                            <span className="lead-modal-eyebrow">CUSTOMER MANAGEMENT</span>
                            <h2>Add New Lead</h2>
                            <p>Create a new lead and add it to your sales pipeline.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="lead-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* FORM */}
                <form className="lead-form" onSubmit={handleSubmit}>
                    {/* BASIC INFORMATION */}
                    <div className="lead-form-section">
                        <div className="lead-section-heading">
                            <span className="section-number">01</span>
                            <div>
                                <h3>Basic Information</h3>
                                <p>Enter the lead's contact details.</p>
                            </div>
                        </div>

                        <div className="lead-form-grid">
                            {/* FIRST NAME */}
                            <div className="lead-form-group">
                                <label>First Name <span>*</span></label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>

                            {/* LAST NAME */}
                            <div className="lead-form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="lead-form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                />
                            </div>

                            {/* PHONE */}
                            <div className="lead-form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            {/* COMPANY */}
                            <div className="lead-form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    placeholder="Company name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LEAD DETAILS */}
                    <div className="lead-form-section">
                        <div className="lead-section-heading">
                            <span className="section-number">02</span>
                            <div>
                                <h3>Lead Details</h3>
                                <p>Configure the lead and sales information.</p>
                            </div>
                        </div>

                        <div className="lead-form-grid">
                            {/* SOURCE */}
                            <div className="lead-form-group">
                                <label>Lead Source</label>
                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                >
                                    <option value="website">Website Inbound</option>
                                    <option value="referral">Client Referral</option>
                                    <option value="linkedin">LinkedIn / Social</option>
                                    <option value="cold_call">Cold Outreach</option>
                                    <option value="campaign">Marketing Campaign</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* STATUS */}
                            <div className="lead-form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="unqualified">Unqualified</option>
                                </select>
                            </div>

                            {/* PRIORITY */}
                            <div className="lead-form-group">
                                <label>Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="hot">Hot (High Intent)</option>
                                    <option value="warm">Warm (Medium Intent)</option>
                                    <option value="cold">Cold (Low Intent)</option>
                                </select>
                            </div>

                            {/* ESTIMATED BUDGET */}
                            <div className="lead-form-group">
                                <label>Estimated Budget</label>
                                <div className="input-with-prefix">
                                    <span>₹</span>
                                    <input
                                        type="number"
                                        name="estimated_budget"
                                        value={formData.estimated_budget}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTES */}
                    <div className="lead-form-section">
                        <div className="lead-section-heading">
                            <span className="section-number">03</span>
                            <div>
                                <h3>Additional Notes</h3>
                                <p>Add any additional information about this lead.</p>
                            </div>
                        </div>

                        <div className="lead-form-group">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Write notes about this lead..."
                                rows="4"
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="lead-modal-footer">
                        <button
                            type="button"
                            className="lead-cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="lead-save-button"
                            disabled={submitting}
                        >
                            <span>+</span>
                            {submitting ? "Saving..." : "Create Lead"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddLeadModal;