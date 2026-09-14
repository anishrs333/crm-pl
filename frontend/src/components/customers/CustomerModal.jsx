import React, { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal';
import { FormField } from '../forms/FormField';
import { Button } from '../common/Button';
import { validators } from '../../utils/validators';
import { Building2, User, Mail, Phone, DollarSign, MapPin } from 'lucide-react';

export const CustomerModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    stage: 'Active',
    industry: 'Enterprise Software',
    dealValue: '',
    assignedTo: 'Alex Rivera',
    city: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        contactPerson: initialData.contactPerson || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        stage: initialData.stage || 'Active',
        industry: initialData.industry || 'Enterprise Software',
        dealValue: initialData.dealValue || '',
        assignedTo: initialData.assignedTo || 'Alex Rivera',
        city: initialData.city || '',
      });
    } else {
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        stage: 'Active',
        industry: 'Enterprise Software',
        dealValue: '',
        assignedTo: 'Alex Rivera',
        city: '',
      });
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

    const compErr = validators.required(formData.companyName, 'Company Name');
    if (compErr) newErrors.companyName = compErr;

    const personErr = validators.required(formData.contactPerson, 'Contact Person');
    if (personErr) newErrors.contactPerson = personErr;

    const emailErr = validators.required(formData.email, 'Email') || validators.email(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (formData.dealValue) {
      const valErr = validators.isPositiveNumber(formData.dealValue, 'Deal Value');
      if (valErr) newErrors.dealValue = valErr;
    }

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
      title={isEditing ? 'Edit Customer' : 'Add New Customer'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
          <FormField
            label="Company Name"
            name="companyName"
            placeholder="e.g. Acme Global Inc."
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            required
            icon={Building2}
          />

          <FormField
            label="Contact Person"
            name="contactPerson"
            placeholder="e.g. David Miller"
            value={formData.contactPerson}
            onChange={handleChange}
            error={errors.contactPerson}
            required
            icon={User}
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. contact@acme.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            icon={Mail}
          />

          <FormField
            label="Phone Number"
            name="phone"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            icon={Phone}
          />

          <FormField
            label="Estimated Deal Value (₹)"
            name="dealValue"
            type="number"
            placeholder="150000"
            value={formData.dealValue}
            onChange={handleChange}
            error={errors.dealValue}
          />

          <FormField
            label="Customer Stage"
            name="stage"
            type="select"
            value={formData.stage}
            onChange={handleChange}
            options={[
              { value: 'Active', label: 'Active Account' },
              { value: 'Ongoing', label: 'Ongoing Lead / Prospect' },
              { value: 'Won', label: 'Closed Won' },
              { value: 'Lost', label: 'Closed Lost' },
              { value: 'Inactive', label: 'Inactive / Churned' },
            ]}
          />

          <FormField
            label="Location / City"
            name="city"
            placeholder="e.g. San Francisco, USA"
            value={formData.city}
            onChange={handleChange}
            icon={MapPin}
          />

          <FormField
            label="Assigned Representative"
            name="assignedTo"
            type="select"
            value={formData.assignedTo}
            onChange={handleChange}
            options={[
              { value: 'Sarah Connor', label: 'Sarah Connor (Admin)' },
              { value: 'Alex Rivera', label: 'Alex Rivera (Manager)' },
              { value: 'Jessica Chen', label: 'Jessica Chen (Sales)' },
              { value: 'Marcus Vance', label: 'Marcus Vance (Support)' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
};
