import React from 'react';
import { Search, Inbox, Users, Bell, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: CustomIcon,
  type = 'search',
  title = 'No items found',
  description = 'Try adjusting your filters or search terms to find what you are looking for.',
  actionLabel,
  actionTo,
  onAction,
}) => {
  const defaultIcons = {
    search: Search,
    inbox: Inbox,
    users: Users,
    bell: Bell,
    resume: FileText,
  };

  const Icon = CustomIcon || defaultIcons[type] || Search;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: '#ffffff',
        border: '1px dashed var(--border-main)',
        margin: '1rem 0',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3B82F6',
          marginBottom: '1rem',
        }}
      >
        <Icon size={26} strokeWidth={1.75} />
      </div>

      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          maxWidth: '380px',
          lineHeight: 1.55,
          margin: '0 0 1.25rem',
        }}
      >
        {description}
      </p>

      {actionLabel && (actionTo ? (
        <Link to={actionTo} className="btn btn-primary btn-sm">
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      ) : null)}
    </div>
  );
};

export default EmptyState;

