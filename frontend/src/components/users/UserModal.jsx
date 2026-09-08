import React, { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal';
import { FormField } from '../forms/FormField';
import { Button } from '../common/Button';
import { validators } from '../../utils/validators';
import { User, Mail, Phone, ShieldCheck, Briefcase } from 'lucide-react';
import './UserModal.css';

export const UserModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'Employee',
    department: 'Sales',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        username: initialData.username || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: 'Admin',
        department: initialData.department || 'Sales',
        status: initialData.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        username: '',
        email: '',
        phone: '',
        role: 'Employee',
        department: 'Sales',
        status: 'Active',
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

    const nameErr = validators.required(formData.name, 'Full Name');
    if (nameErr) newErrors.name = nameErr;

    const userErr = validators.required(formData.username, 'Username');
    if (userErr) newErrors.username = userErr;

    const emailErr = validators.required(formData.email, 'Email Address') || validators.email(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (formData.phone) {
      const phoneErr = validators.phone(formData.phone);
      if (phoneErr) newErrors.phone = phoneErr;
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
      title={isEditing ? 'Edit CRM User' : 'Create New User'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="user-form-grid">
          <FormField
            label="Full Name"
            name="name"
            placeholder="e.g. Eleanor Vance"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            icon={User}
          />

          <FormField
            label="Username"
            name="username"
            placeholder="e.g. eleanor_v"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            disabled={isEditing}
            icon={User}
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. eleanor@apexcrm.io"
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
            error={errors.phone}
            icon={Phone}
          />

          <FormField
            label="User Role"
            name="role"
            type="select"
            value={formData.role}
            onChange={handleChange}
            required
            icon={ShieldCheck}
            options={[
              { value: 'Admin', label: 'Admin (Full System & User Management)' },
              { value: 'Manager', label: 'Manager (Sales & Operational Access)' },
            ]}
          />

          <FormField
            label="Department"
            name="department"
            type="select"
            value={formData.department}
            onChange={handleChange}
            icon={Briefcase}
            options={[
              { value: 'Sales', label: 'Sales' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Customer Support', label: 'Customer Support' },
              { value: 'Management', label: 'Management' },
              { value: 'Engineering', label: 'Engineering' },
            ]}
          />

          <div className="user-form-full-width">
            <FormField
              label="Account Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
