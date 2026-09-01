import { useState } from "react";
import "./AddLeadModal.css";

function AddLeadModal({ onClose }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "Website",
        status: "New",
        priority: "Medium",
        assignedTo: "",
        expectedValue: "",
        followUpDate: "",
        notes: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Lead Data:", formData);

        // Later:
        // API call will be added here

        onClose();
    };

    return (
        <div className="lead-modal-overlay" onClick={onClose}>
            <div
                className="lead-modal"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ================= HEADER ================= */}

                <div className="lead-modal-header">

                    <div className="lead-modal-title-area">

                        <div className="lead-modal-icon">
                            +
                        </div>

                        <div>
                            <span className="lead-modal-eyebrow">
                                CUSTOMER MANAGEMENT
                            </span>

                            <h2>Add New Lead</h2>

                            <p>
                                Create a new lead and add it to your sales pipeline.
                            </p>
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


                {/* ================= FORM ================= */}

                <form
                    className="lead-form"
                    onSubmit={handleSubmit}
                >

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

                            {/* NAME */}

                            <div className="lead-form-group">

                                <label>
                                    Full Name
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="lead-form-group">

                                <label>
                                    Email Address
                                </label>

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

                                <label>
                                    Phone Number
                                    <span>*</span>
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    required
                                />

                            </div>


                            {/* COMPANY */}

                            <div className="lead-form-group">

                                <label>
                                    Company
                                </label>

                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Company name"
                                />

                            </div>

                        </div>

                    </div>


                    {/* LEAD DETAILS */}

                    <div className="lead-form-section">

                        <div className="lead-section-heading">

                            <span className="section-number">
                                02
                            </span>

                            <div>
                                <h3>Lead Details</h3>

                                <p>
                                    Configure the lead and sales information.
                                </p>
                            </div>

                        </div>


                        <div className="lead-form-grid">


                            {/* SOURCE */}

                            <div className="lead-form-group">

                                <label>
                                    Lead Source
                                </label>

                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                >

                                    <option value="Website">
                                        Website
                                    </option>

                                    <option value="Referral">
                                        Referral
                                    </option>

                                    <option value="Social Media">
                                        Social Media
                                    </option>

                                    <option value="Advertisement">
                                        Advertisement
                                    </option>

                                    <option value="Cold Call">
                                        Cold Call
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* STATUS */}

                            <div className="lead-form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >

                                    <option value="New">
                                        New
                                    </option>

                                    <option value="Contacted">
                                        Contacted
                                    </option>

                                    <option value="Qualified">
                                        Qualified
                                    </option>

                                    <option value="Proposal">
                                        Proposal
                                    </option>

                                    <option value="Converted">
                                        Converted
                                    </option>

                                    <option value="Lost">
                                        Lost
                                    </option>

                                </select>

                            </div>


                            {/* PRIORITY */}

                            <div className="lead-form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >

                                    <option value="High">
                                        High
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="Low">
                                        Low
                                    </option>

                                </select>

                            </div>


                            {/* ASSIGNED */}

                            <div className="lead-form-group">

                                <label>
                                    Assigned To
                                </label>

                                <select
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select employee
                                    </option>

                                    <option value="Abishek">
                                        Abishek
                                    </option>

                                    <option value="Employee 1">
                                        Employee 1
                                    </option>

                                    <option value="Employee 2">
                                        Employee 2
                                    </option>

                                </select>

                            </div>


                            {/* VALUE */}

                            <div className="lead-form-group">

                                <label>
                                    Expected Value
                                </label>

                                <div className="input-with-prefix">

                                    <span>₹</span>

                                    <input
                                        type="number"
                                        name="expectedValue"
                                        value={formData.expectedValue}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                    />

                                </div>

                            </div>


                            {/* FOLLOW UP */}

                            <div className="lead-form-group">

                                <label>
                                    Follow-up Date
                                </label>

                                <input
                                    type="date"
                                    name="followUpDate"
                                    value={formData.followUpDate}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </div>


                    {/* NOTES */}

                    <div className="lead-form-section">

                        <div className="lead-section-heading">

                            <span className="section-number">
                                03
                            </span>

                            <div>

                                <h3>Additional Notes</h3>

                                <p>
                                    Add any additional information about this lead.
                                </p>

                            </div>

                        </div>


                        <div className="lead-form-group">

                            <label>
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Write notes about this lead..."
                                rows="4"
                            />

                        </div>

                    </div>


                    {/* ================= FOOTER ================= */}

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
                        >
                            <span>+</span>
                            Create Lead
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default AddLeadModal;