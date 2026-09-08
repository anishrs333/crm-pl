import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm | md | lg | xl
}) => {
  const dialogRef = useRef(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="crm-modal-backdrop"
      onClick={(e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`crm-modal-dialog modal-${size}`}
        ref={dialogRef}
      >
        <div className="crm-modal-header">
          <h3 className="crm-modal-title">{title}</h3>
          <button
            type="button"
            className="crm-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="crm-modal-body">{children}</div>

        {footer && <div className="crm-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
