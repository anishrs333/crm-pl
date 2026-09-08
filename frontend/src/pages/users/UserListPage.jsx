import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';
import { formatDate, getInitials, getStatusBadgeVariant } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/forms/SearchBar';
import { FilterDropdown } from '../../components/forms/FilterDropdown';
import { DataTable } from '../../components/tables/DataTable';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { UserModal } from '../../components/users/UserModal';
import { UserDetailsModal } from '../../components/users/UserDetailsModal';
import { UserPlus, Download } from 'lucide-react';
import './UserListPage.css';

export const UserListPage = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers({
        page,
        limit: pageSize,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(response.data);
      setTotalItems(response.totalItems);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load user records.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search & Filter Resets
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleRoleFilterChange = (val) => {
    setRoleFilter(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  // Open Modals
  const handleOpenAdd = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Submit Add / Edit
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        // Edit
        await userService.updateUser(selectedUser.id, formData);
        showToast('User record updated successfully.', 'success');
      } else {
        // Create
        await userService.createUser(formData);
        showToast('New user account created.', 'success');
      }
      setIsFormModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Operation failed. Please check inputs.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await userService.deleteUser(selectedUser.id);
      showToast(`User ${selectedUser.name} deleted successfully.`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (_, row) => (
        <div className="user-cell">
          <div className="user-cell-avatar">{getInitials(row.name)}</div>
          <div>
            <div className="user-cell-name">{row.name}</div>
            <div className="user-cell-username">@{row.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (val) => <span style={{ color: 'var(--text-secondary)' }}>{val}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <Badge variant={val === 'Admin' ? 'primary' : 'info'}>
          {val || 'Manager'}
        </Badge>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (val) => val || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={getStatusBadgeVariant(val)}>{val}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => formatDate(val),
    },
  ];

  return (
    <div className="users-page-container">
      {/* Header Banner */}
      <div className="users-page-header">
        <div className="users-title-area">
          <h1>User Management</h1>
          <p>Manage system team members, assignments, access roles, and permissions.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={handleOpenAdd}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="users-toolbar">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name, email, or username..."
        />

        <div className="users-filters-group">
          <FilterDropdown
            label="Role"
            value={roleFilter}
            onChange={handleRoleFilterChange}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Manager', label: 'Manager' },
            ]}
          />

          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={[
              { value: '', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      {/* Users Data Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchUsers}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No team members found"
        emptyDescription="No users match your query or filter criteria. Try resetting filters."
        emptyActionText="Create User"
        onEmptyAction={handleOpenAdd}
      />

      {/* Pagination Footer */}
      {!isLoading && users.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      )}

      {/* Add / Edit User Modal */}
      <UserModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
        isLoading={isSubmitting}
      />

      {/* View User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
        onEdit={handleOpenEdit}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${selectedUser?.name}"? All associated CRM assignments will be detached.`}
        confirmText="Yes, Delete User"
        isLoading={isSubmitting}
      />
    </div>
  );
};
