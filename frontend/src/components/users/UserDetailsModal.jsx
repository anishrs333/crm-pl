import React from 'react';
import { Modal } from '../modals/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { getInitials, formatDate, getStatusBadgeVariant } from '../../utils/formatters';
import { Mail, Phone, ShieldCheck, Briefcase, Calendar, Clock } from 'lucide-react';

export const UserDetailsModal = ({ isOpen, onClose, user, onEdit }) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile Details"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(user);
              }}
            >
              Edit User
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* User Card Top */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.name}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
              <Badge variant="purple">{user.role}</Badge>
            </div>
          </div>
        </div>

        {/* Detailed Fields List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.92rem' }}>
            <Mail size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', width: '100px' }}>Email:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.92rem' }}>
            <Phone size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', width: '100px' }}>Phone:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.phone || '—'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.92rem' }}>
            <Briefcase size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', width: '100px' }}>Department:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.department || '—'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.92rem' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', width: '100px' }}>Joined Date:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatDate(user.createdAt)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.92rem' }}>
            <Clock size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', width: '100px' }}>Last Active:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'}
            </span>
          </div>
        </div>

        {/* Employee Lead Representation & Workload Monitoring */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Lead & Customer Representation Monitoring
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Assigned Leads</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-600)', marginTop: '2px' }}>
                {user.assignedLeadsCount ?? 5} Leads
              </div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Corporate Clients</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--success-600, #10b981)', marginTop: '2px' }}>
                {user.assignedCustomersCount ?? 3} Accounts
              </div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pipeline Volume</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {user.managedVolume || '₹ 28,50,000'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
