import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Briefcase, 
  Code2, 
  Building2,
  Check
} from 'lucide-react';

export const RoleBadge = ({ role, company, size = 'sm' }) => {
  const isEmployee = role === 'employee';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: '9999px',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        backgroundColor: isEmployee ? '#F0FDF4' : '#EFF6FF',
        color: isEmployee ? '#15803D' : '#1D4ED8',
        border: `1px solid ${isEmployee ? '#BBF7D0' : '#DBEAFE'}`,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      {isEmployee ? (
        <Building2 size={size === 'sm' ? 12 : 14} />
      ) : (
        <Code2 size={size === 'sm' ? 12 : 14} />
      )}
      <span>{isEmployee ? (company ? `Referrer @ ${company}` : 'Referrer') : 'Job Seeker'}</span>
    </span>
  );
};

export const StatusBadge = ({ status, size = 'sm' }) => {
  const configs = {
    pending: {
      label: 'Pending',
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#FDE68A',
      icon: Clock,
    },
    accepted: {
      label: 'Accepted',
      bg: '#F0FDF4',
      text: '#15803D',
      border: '#BBF7D0',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Declined',
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#FECACA',
      icon: XCircle,
    },
    completed: {
      label: 'Referred',
      bg: '#F5F3FF',
      text: '#6D28D9',
      border: '#DDD6FE',
      icon: Sparkles,
    },
  };

  const cfg = configs[status] || configs.pending;
  const Icon = cfg.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '3px 8px' : '4px 12px',
        borderRadius: '9999px',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        transition: 'all 0.22s var(--ease-out-expo)',
      }}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{cfg.label}</span>
    </span>
  );
};

export const SkillBadge = ({ skill, onClick, active = false }) => {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: active ? '#EFF6FF' : '#F1F5F9',
        color: active ? '#1D4ED8' : '#334155',
        border: `1px solid ${active ? '#93C5FD' : '#E2E8F0'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s var(--ease-out-expo)',
        userSelect: 'none',
        lineHeight: 1.3,
      }}
    >
      {skill}
    </span>
  );
};

