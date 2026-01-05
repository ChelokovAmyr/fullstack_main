'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export default function Modal({ isOpen, onClose, title, children, type = 'info' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: '✓',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
    },
    error: {
      icon: '✕',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
    },
    warning: {
      icon: '⚠',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
    },
    info: {
      icon: 'ℹ',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className={`modal-content ${style.bgColor} ${style.borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {title && (
            <h2 className={`modal-title ${style.textColor}`}>
              <span className="modal-icon">{style.icon}</span>
              {title}
            </h2>
          )}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

