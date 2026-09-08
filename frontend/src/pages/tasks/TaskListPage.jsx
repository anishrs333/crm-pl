import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '../../services/taskService';
import { useToast } from '../../hooks/useToast';
import { formatDate, getStatusBadgeVariant } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/forms/SearchBar';
import { FilterDropdown } from '../../components/forms/FilterDropdown';
import { DataTable } from '../../components/tables/DataTable';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { TaskModal } from '../../components/tasks/TaskModal';
import { CheckSquare, Plus, Check } from 'lucide-react';
import './TaskListPage.css';

export const TaskListPage = () => {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await taskService.getTasks({
        page,
        limit: pageSize,
        search,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(res.data);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Failed to load task schedule.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (taskId) => {
    try {
      const updated = await taskService.toggleComplete(taskId);
      showToast(
        updated.status === 'Completed'
          ? 'Task marked as completed! 🎉'
          : 'Task marked as pending.',
        'info',
        2500
      );
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setSelectedTask(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedTask) {
        await taskService.updateTask(selectedTask.id, formData);
        showToast('Task updated successfully.', 'success');
      } else {
        await taskService.createTask(formData);
        showToast('New task scheduled.', 'success');
      }
      setIsFormModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to save task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await taskService.deleteTask(selectedTask.id);
      showToast('Task deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to delete task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Task Details',
      render: (_, row) => {
        const isDone = row.status === 'Completed';
        return (
          <div className="task-checkbox-wrapper">
            <button
              type="button"
              className={`task-complete-btn ${isDone ? 'is-completed' : ''}`}
              onClick={() => handleToggleComplete(row.id)}
              aria-label={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
            >
              {isDone && <Check size={14} />}
            </button>
            <div>
              <div className={`task-title-text ${isDone ? 'is-completed' : ''}`}>
                {row.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {row.description}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => (
        <Badge
          variant={
            val === 'High' ? 'danger' : val === 'Medium' ? 'warning' : 'info'
          }
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={getStatusBadgeVariant(val)}>{val}</Badge>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'assignedTo',
      label: 'Assignee',
      render: (val) => val || '—',
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => val || '—',
    },
  ];

  return (
    <div className="tasks-page-container">
      <div className="tasks-page-header">
        <div className="tasks-title-area">
          <h1>Tasks & Schedule</h1>
          <p>Organize follow-up calls, contract reviews, and cross-team actions.</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          New Task
        </Button>
      </div>

      <div className="tasks-toolbar">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search tasks or assignees..."
        />

        <div className="tasks-filters-group">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />

          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            onChange={(val) => {
              setPriorityFilter(val);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'High', label: 'High Priority' },
              { value: 'Medium', label: 'Medium Priority' },
              { value: 'Low', label: 'Low Priority' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        isError={Boolean(error)}
        errorMessage={error}
        onRetry={fetchTasks}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        emptyTitle="No tasks found"
        emptyDescription="You are all caught up! No tasks match the current filter criteria."
        emptyActionText="Create Task"
        onEmptyAction={handleOpenAdd}
      />

      {!isLoading && tasks.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      )}

      <TaskModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTask}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete task "${selectedTask?.title}"?`}
        confirmText="Delete Task"
        isLoading={isSubmitting}
      />
    </div>
  );
};
