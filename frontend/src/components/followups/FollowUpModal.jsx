import React, { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal';
import { FormField } from '../forms/FormField';
import { Button } from '../common/Button';
import { validators } from '../../utils/validators';
import { Calendar, User, PhoneCall, Building2 } from 'lucide-react';
import './FollowUpModal.css';

export const FollowUpModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    title: '',
    entityType: 'Customer',
    entityName: '',
    contactPerson: '',
    type: 'Call',
    scheduledDate: '',
    assignedTo: 'Alex Rivera',
    status: 'Pending',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        entityType: initialData.entityType || 'Customer',
        entityName: initialData.entityName || '',
        contactPerson: initialData.contactPerson || '',
        type: initialData.type || 'Call',
        scheduledDate: initialData.scheduledDate || '',
        assignedTo: initialData.assignedTo || 'Alex Rivera',
        status: initialData.status || 'Pending',
        notes: initialData.notes || '',
      });
    } else {
      // setFormData({
      //   title: '',
      //   entityType: 'Customer',
      //   entityName: '',
      //   contactPerson: '',
      //   type: 'Call',
      //   scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      //   assignedTo: 'Alex Rivera',
      //   status: 'Pending',
      //   notes: '',
      // });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const titleErr = validators.required(formData.title, 'Subject / Follow-up Title');
    if (titleErr) newErrors.title = titleErr;

    const entityErr = validators.required(formData.entityName, 'Client / Lead Name');
    if (entityErr) newErrors.entityName = entityErr;

    const dateErr = validators.required(formData.scheduledDate, 'Follow-up Date & Time');
    if (dateErr) newErrors.scheduledDate = dateErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Scheduled Follow-up' : 'Schedule New Follow-up'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Schedule Follow-up'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="followup-form-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField
              label="Follow-up Subject / Objective"
              name="title"
              placeholder="e.g. Call to discuss contract revisions & milestones"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              icon={PhoneCall}
            />
          </div>

          <FormField
            label="Client / Lead Category"
            name="entityType"
            type="select"
            value={formData.entityType}
            onChange={handleChange}
            options={[
              { value: 'Customer', label: 'Existing Customer Account' },
              { value: 'Lead', label: 'Sales Lead / Prospect' },
            ]}
          />

          <FormField
            label="Company / Lead Name"
            name="entityName"
            placeholder="e.g. Acme Global Corp"
            value={formData.entityName}
            onChange={handleChange}
            error={errors.entityName}
            required
            icon={Building2}
          />

          <FormField
            label="Contact Person"
            name="contactPerson"
            placeholder="e.g. David Miller"
            value={formData.contactPerson}
            onChange={handleChange}
            icon={User}
          />

          <FormField
            label="Communication Medium"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            options={[
              { value: 'Call', label: 'Phone Call' },
              { value: 'Meeting', label: 'Face-to-Face / Zoom Meeting' },
              { value: 'Email', label: 'Email Follow-up' },
              { value: 'Demo', label: 'Product Demonstration' },
            ]}
          />

          <FormField
            label="Date & Time"
            name="scheduledDate"
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={handleChange}
            error={errors.scheduledDate}
            required
            icon={Calendar}
          />

          <FormField
            label="Assigned Salesperson"
            name="assignedTo"
            type="select"
            value={formData.assignedTo}
            onChange={handleChange}
            icon={User}
            options={[
              { value: 'Alex Rivera', label: 'Alex Rivera (Sales Lead)' },
              { value: 'Jessica Chen', label: 'Jessica Chen (Account Exec)' },
              { value: 'Sarah Connor', label: 'Sarah Connor (VP Sales)' },
              { value: 'Marcus Vance', label: 'Marcus Vance (Customer Rep)' },
            ]}
          />

          <div style={{ gridColumn: '1 / -1' }}>
            <FormField
              label="Discussion Notes & Agenda"
              name="notes"
              type="textarea"
              placeholder="Preparation items, points to address..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
