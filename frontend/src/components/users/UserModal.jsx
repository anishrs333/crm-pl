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
    role: 'Sales Executive',
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
        role: initialData.role || 'Sales Executive',
        department: initialData.department || 'Sales',
        status: initialData.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        username: '',
        email: '',
        phone: '',
        role: 'Sales Executive',
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

    const nameErr = validators.required(formData.name, 'Employee Name');
    if (nameErr) newErrors.name = nameErr;

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

    const cleanUsername = formData.username.trim() || formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const defaultPassword = 'Emp@' + Math.floor(1000 + Math.random() * 9000);

    onSubmit({
      ...formData,
      username: cleanUsername,
      password: defaultPassword,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Employee Details' : 'Add New Employee (Monitoring Roster)'}
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
            {isEditing ? 'Save Employee' : 'Add Employee'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="user-form-grid">
          <FormField
            label="Employee Full Name"
            name="name"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            icon={User}
          />

          <FormField
            label="Employee Email Address"
            name="email"
            type="email"
            placeholder="e.g. rahul.sharma@company.in"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            icon={Mail}
          />

          <FormField
            label="Phone Number"
            name="phone"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={Phone}
          />

          <FormField
            label="Designation / Role"
            name="role"
            type="select"
            value={formData.role}
            onChange={handleChange}
            required
            icon={ShieldCheck}
            options={[
              { value: 'Sales Executive', label: 'Sales Executive' },
              { value: 'Account Manager', label: 'Account Manager' },
              { value: 'Sales Representative', label: 'Sales Representative' },
              { value: 'Senior Manager', label: 'Senior Manager' },
              { value: 'Support Representative', label: 'Support Representative' },
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
              { value: 'Business Development', label: 'Business Development' },
              { value: 'Customer Success', label: 'Customer Success' },
              { value: 'Operations', label: 'Operations' },
            ]}
          />

          <FormField
            label="Employee Monitoring Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'Active', label: 'Active (Assigned to Leads)' },
              { value: 'Inactive', label: 'Inactive (On Leave / Unassigned)' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
};
