import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layouts/MainLayout';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UserListPage } from '../pages/users/UserListPage';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { LeadListPage } from '../pages/leads/LeadListPage';
import { OpportunityListPage } from '../pages/opportunities/OpportunityListPage';
import { FollowUpListPage } from '../pages/followups/FollowUpListPage';
import { QuotationListPage } from '../pages/quotations/QuotationListPage';
import { ProductListPage } from '../pages/products/ProductListPage';
import { TaskListPage } from '../pages/tasks/TaskListPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { RolePermissionPage } from '../pages/permissions/RolePermissionPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route: Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside Main CRM Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="leads" element={<LeadListPage />} />
        <Route path="follow-ups" element={<FollowUpListPage />} />
        <Route path="opportunities" element={<OpportunityListPage />} />
        <Route path="quotations" element={<QuotationListPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="tasks" element={<TaskListPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UserListPage />
            </ProtectedRoute>
          }
        />
        <Route path="permissions" element={<Navigate to="/users" replace />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
