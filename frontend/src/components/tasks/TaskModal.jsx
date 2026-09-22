import React, { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal';
import { FormField } from '../forms/FormField';
import { Button } from '../common/Button';
import { userService } from '../../services/userService';
import { validators } from '../../utils/validators';
import { CheckSquare, Calendar, User, Tag } from 'lucide-react';

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [assigneeOptions, setAssigneeOptions] = useState([
    { value: 'Unassigned', label: 'Unassigned' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Unassigned',
    category: 'Sales',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const res = await userService.getUsers({ limit: 100 });
        const list = res.data || res.results || [];
        if (list.length > 0) {
          const opts = list.map((u) => ({
            value: String(u.id),
            label: `${u.name} (${u.role_label || u.role || 'Staff'})`,
          }));
          setAssigneeOptions([{ value: 'Unassigned', label: 'Unassigned' }, ...opts]);
        }
      } catch (e) {
        console.warn('Failed to load assignees for task modal:', e);
      }
    };

    if (isOpen) {
      fetchAssignees();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Pending',
        assignedTo: initialData.assigned_to ? String(initialData.assigned_to) : (initialData.assignedTo || 'Unassigned'),
        category: initialData.category || 'Sales',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Pending',
        assignedTo: 'Unassigned',
        category: 'Sales',
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

    const titleErr = validators.required(formData.title, 'Task Title');
    if (titleErr) newErrors.title = titleErr;

    const dateErr = validators.required(formData.dueDate, 'Due Date');
    if (dateErr) newErrors.dueDate = dateErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const selectedUserId = formData.assignedTo !== 'Unassigned' ? Number(formData.assignedTo) : null;
    const selectedUserObj = assigneeOptions.find((o) => String(o.value) === String(formData.assignedTo));
    onSubmit({
      ...formData,
      assignedToId: selectedUserId,
      assignedTo: selectedUserObj ? selectedUserObj.label.split(' (')[0] : formData.assignedTo,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit CRM Task' : 'Schedule New Task'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FormField
            label="Task Title"
            name="title"
            placeholder="e.g. Schedule onboarding sync"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            icon={CheckSquare}
          />

          <FormField
            label="Detailed Description"
            name="description"
            type="textarea"
            placeholder="Provide context, meeting notes or instructions..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
              required
              icon={Calendar}
            />

            <FormField
              label="Priority Level"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleChange}
              options={[
                { value: 'High', label: '🔴 High Priority' },
                { value: 'Medium', label: '🟡 Medium Priority' },
                { value: 'Low', label: '🔵 Low Priority' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField
              label="Category / Department"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              icon={Tag}
              options={[
                { value: 'Sales', label: 'Sales Follow-up' },
                { value: 'Support', label: 'Client Support' },
                { value: 'Management', label: 'Operations & Strategy' },
                { value: 'Onboarding', label: 'Product Onboarding' },
              ]}
            />

            <FormField
              label="Assignee"
              name="assignedTo"
              type="select"
              value={formData.assignedTo}
              onChange={handleChange}
              icon={User}
              options={assigneeOptions}
            />
          </div>

          <FormField
            label="Task Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
};
