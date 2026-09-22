import React, { useState } from 'react';
import { Modal } from '../modals/Modal';
import { FormField } from '../forms/FormField';
import { Button } from '../common/Button';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';
import { Lock, KeyRound } from 'lucide-react';

export const ChangePasswordModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await userService.changePassword(user.id, newPassword);
      showToast(`Password successfully changed for ${user.name || user.username}!`, 'success');
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reset Password — ${user.name || user.username}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} icon={KeyRound}>
            Update Password
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Set a new login password for user account <strong>@{user.username}</strong> ({user.email}).
        </div>

        <FormField
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="Enter new password..."
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError('');
          }}
          error={error}
          required
          icon={Lock}
        />

        <FormField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password..."
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          required
          icon={Lock}
        />
      </form>
    </Modal>
  );
};
