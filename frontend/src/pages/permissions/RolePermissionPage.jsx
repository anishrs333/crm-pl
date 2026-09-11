import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Save, CheckCircle2 } from 'lucide-react';
import './RolePermissionPage.css';

const defaultPermissions = {
  Admin: {
    Leads: { view: true, create: true, edit: true, delete: true, export: true },
    Customers: { view: true, create: true, edit: true, delete: true, export: true },
    Opportunities: { view: true, create: true, edit: true, delete: true, export: true },
    FollowUps: { view: true, create: true, edit: true, delete: true, export: true },
    Quotations: { view: true, create: true, edit: true, delete: true, export: true },
    Products: { view: true, create: true, edit: true, delete: true, export: true },
    Tasks: { view: true, create: true, edit: true, delete: true, export: true },
    Reports: { view: true, create: true, edit: true, delete: true, export: true },
    Users: { view: true, create: true, edit: true, delete: true, export: true },
  },
  Manager: {
    Leads: { view: true, create: true, edit: true, delete: false, export: true },
    Customers: { view: true, create: true, edit: true, delete: false, export: true },
    Opportunities: { view: true, create: true, edit: true, delete: false, export: true },
    FollowUps: { view: true, create: true, edit: true, delete: true, export: true },
    Quotations: { view: true, create: true, edit: true, delete: false, export: true },
    Products: { view: true, create: false, edit: false, delete: false, export: false },
    Tasks: { view: true, create: true, edit: true, delete: true, export: true },
    Reports: { view: true, create: false, edit: false, delete: false, export: true },
    Users: { view: true, create: false, edit: false, delete: false, export: false },
  },
  // Employee: {
  //   Leads: { view: true, create: true, edit: true, delete: false, export: false },
  //   Customers: { view: true, create: false, edit: false, delete: false, export: false },
  //   Opportunities: { view: true, create: true, edit: true, delete: false, export: false },
  //   FollowUps: { view: true, create: true, edit: true, delete: false, export: false },
  //   Quotations: { view: true, create: true, edit: false, delete: false, export: false },
  //   Products: { view: true, create: false, edit: false, delete: false, export: false },
  //   Tasks: { view: true, create: true, edit: true, delete: false, export: false },
  //   Reports: { view: false, create: false, edit: false, delete: false, export: false },
  //   Users: { view: false, create: false, edit: false, delete: false, export: false },
  // },
};

export const RolePermissionPage = () => {
  const { showToast } = useToast();
  const [activeRole, setActiveRole] = useState('Manager');
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (moduleName, action) => {
    if (activeRole === 'Admin' && action === 'view') {
      showToast('Admin must maintain global view permissions.', 'warning', 2000);
      return;
    }

    setPermissions((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [moduleName]: {
          ...prev[activeRole][moduleName],
          [action]: !prev[activeRole][moduleName][action],
        },
      },
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast(`Permission matrix for "${activeRole}" updated successfully.`, 'success');
    }, 400);
  };

  const modules = [
    { key: 'Leads', name: 'Lead Management & Conversion' },
    { key: 'Customers', name: 'Customer Accounts & Profiles' },
    { key: 'Opportunities', name: 'Sales Pipeline & Opportunities' },
    { key: 'FollowUps', name: 'Follow-up Management & Reminders' },
    { key: 'Quotations', name: 'Quotation Management & PDF' },
    { key: 'Products', name: 'Product & Service Catalog' },
    { key: 'Tasks', name: 'Task Scheduling & Assignment' },
    { key: 'Reports', name: 'Analytics, KPIs & Executive Reports' },
    { key: 'Users', name: 'Employee & User Management' },
  ];

  return (
    <div className="permissions-page-container">
      <div className="permissions-page-header">
        <div className="permissions-title-area">
          <h1>Role & Permission Management</h1>
          <p>Configure granular module-level access controls for Admin, Sales Manager, and Employee roles.</p>
        </div>

        <Button
          variant="primary"
          icon={Save}
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save Permissions
        </Button>
      </div>

      {/* Role Switcher Tabs */}
      <div className="permissions-tabs">
        {['Admin', 'Manager', 'Employee'].map((role) => (
          <button
            key={role}
            type="button"
            className={`role-tab-btn ${activeRole === role ? 'active' : ''}`}
            onClick={() => setActiveRole(role)}
          >
            {role === 'Admin' ? '👑 Admin (Full Access)' : role === 'Manager' ? '👔 Sales Manager' : '💼 Sales Employee'}
          </button>
        ))}
      </div>

      {/* Permissions Matrix Card */}
      <Card>
        <CardHeader
          title={`Access Controls for ${activeRole}`}
          subtitle="Check or uncheck permissions granted to this user group"
        />
        <CardBody noPadding>
          <div className="crm-table-responsive">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>CRM Module</th>
                  <th style={{ width: '12%' }}>View</th>
                  <th style={{ width: '12%' }}>Create</th>
                  <th style={{ width: '12%' }}>Edit</th>
                  <th style={{ width: '12%' }}>Delete</th>
                  <th style={{ width: '12%' }}>Export CSV</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => {
                  const rolePerms = permissions[activeRole][mod.key] || {};
                  return (
                    <tr key={mod.key}>
                      <td>{mod.name}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="perm-checkbox"
                          checked={Boolean(rolePerms.view)}
                          onChange={() => handleToggle(mod.key, 'view')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="perm-checkbox"
                          checked={Boolean(rolePerms.create)}
                          onChange={() => handleToggle(mod.key, 'create')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="perm-checkbox"
                          checked={Boolean(rolePerms.edit)}
                          onChange={() => handleToggle(mod.key, 'edit')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="perm-checkbox"
                          checked={Boolean(rolePerms.delete)}
                          onChange={() => handleToggle(mod.key, 'delete')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="perm-checkbox"
                          checked={Boolean(rolePerms.export)}
                          onChange={() => handleToggle(mod.key, 'export')}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
