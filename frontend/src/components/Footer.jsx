import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from './ui/Logo';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './ui/BrandIcons';
import { Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useContext(AuthContext);

  const getDestination = (path) => {
    if (path === '/') return '/';
    return user ? path : '/login';
  };

  const productLinks = [
    { label: 'Discover Referrers', to: '/discover' },
    { label: 'Referral Tracker', to: '/referrals' },
    { label: 'Community Network', to: '/network' },
    { label: 'Real-time Messaging', to: '/chat' },
  ];

  const resourceLinks = [
    { label: 'How Referrals Work', to: '/' },
    { label: 'Resume Guide', to: '/profile' },
    { label: 'Tech Career Pathways', to: '/discover' },
    { label: 'Student & Graduate Guide', to: '/' },
  ];

  const companyLinks = [
    { label: 'About DevConnect', to: '/' },
    { label: 'Privacy Policy', to: '/settings' },
    { label: 'Terms of Service', to: '/settings' },
    { label: 'Safety & Trust', to: '/' },
  ];

  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-main)',
        marginTop: 'auto',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid var(--border-main)',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '320px' }}>
            <Logo size="md" to="/" />
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginTop: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              DevConnect bridges the gap between students, job seekers, and verified tech professionals at top companies to unlock real career referrals.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '36px', height: '36px', padding: 0 }}
                aria-label="DevConnect on GitHub"
              >
                <GithubIcon size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '36px', height: '36px', padding: 0 }}
                aria-label="DevConnect on LinkedIn"
              >
                <LinkedinIcon size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '36px', height: '36px', padding: 0 }}
                aria-label="DevConnect on Twitter"
              >
                <TwitterIcon size={16} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}
            >
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={getDestination(link.to)}
                    style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.target.style.color = '#3B82F6')}
                    onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}
            >
              Resources
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={getDestination(link.to)}
                    style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.target.style.color = '#3B82F6')}
                    onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Community */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}
            >
              Trust & Community
            </h4>
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-main)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldCheck size={18} color="#16A34A" />
                <span style={{ fontWeight: 600, fontSize: '0.84375rem', color: 'var(--text-primary)' }}>
                  Verified Professionals
                </span>
              </div>
              <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                Direct referral requests go to actual engineers & employees with zero middleman spam.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & status row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {currentYear} DevConnect Inc. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                backgroundColor: '#F0FDF4',
                color: '#15803D',
                borderRadius: '9999px',
                border: '1px solid #BBF7D0',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#16A34A',
                }}
              />
              Platform Operational
            </span>

            <span>Designed for world-class developer careers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
