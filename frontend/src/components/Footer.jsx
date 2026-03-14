import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Find Referrers", href: "#" },
    { label: "For Job Seekers", href: "#" },
    { label: "Success Stories", href: "#" },
    { label: "How It Works", href: "#" },
  ];

  const supportLinks = [
    { label: "FAQ", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const socialLinks = [
    {
      label: "GitHub",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "Twitter",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .dc-footer {
          --dc-bg: #0a0f1a;
          --dc-surface: #111827;
          --dc-border: rgba(99, 179, 237, 0.1);
          --dc-accent: #38bdf8;
          --dc-accent-glow: rgba(56, 189, 248, 0.15);
          --dc-text-primary: #f1f5f9;
          --dc-text-secondary: #94a3b8;
          --dc-text-muted: #64748b;
          --dc-gradient: linear-gradient(135deg, #38bdf8, #818cf8);
          font-family: 'DM Sans', sans-serif;
          background-color: var(--dc-bg);
          color: var(--dc-text-secondary);
          position: relative;
          overflow: hidden;
        }

        .dc-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--dc-accent), transparent);
          opacity: 0.5;
        }

        .dc-footer__glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%);
          top: -200px;
          left: -100px;
          pointer-events: none;
        }

        .dc-footer__container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 24px 0;
          position: relative;
          z-index: 1;
        }

        .dc-footer__main {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
          gap: 48px;
          padding-bottom: 48px;
        }

        /* Brand Column */
        .dc-footer__brand-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--dc-text-primary);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .dc-footer__brand-logo span {
          background: var(--dc-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dc-footer__brand-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--dc-accent);
          background: var(--dc-accent-glow);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 3px 10px;
          border-radius: 100px;
          margin-bottom: 14px;
        }

        .dc-footer__brand-desc {
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--dc-text-muted);
          max-width: 280px;
          margin-bottom: 24px;
        }

        .dc-footer__socials {
          display: flex;
          gap: 10px;
        }

        .dc-footer__social-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--dc-surface);
          border: 1px solid var(--dc-border);
          color: var(--dc-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .dc-footer__social-btn:hover {
          background: var(--dc-accent-glow);
          border-color: rgba(56, 189, 248, 0.4);
          color: var(--dc-accent);
          transform: translateY(-2px);
        }

        /* Link Columns */
        .dc-footer__col-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dc-text-primary);
          margin-bottom: 20px;
        }

        .dc-footer__links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dc-footer__link {
          color: var(--dc-text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease, gap 0.2s ease;
        }

        .dc-footer__link::before {
          content: '';
          width: 0;
          height: 1px;
          background: var(--dc-accent);
          transition: width 0.2s ease;
          display: inline-block;
        }

        .dc-footer__link:hover {
          color: var(--dc-text-primary);
          gap: 10px;
        }

        .dc-footer__link:hover::before {
          width: 12px;
        }

        /* Newsletter Column */
        .dc-footer__newsletter-desc {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--dc-text-muted);
          margin-bottom: 16px;
        }

        .dc-footer__newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dc-footer__newsletter-input {
          background: var(--dc-surface);
          border: 1px solid var(--dc-border);
          border-radius: 10px;
          padding: 11px 16px;
          color: var(--dc-text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .dc-footer__newsletter-input::placeholder {
          color: var(--dc-text-muted);
        }

        .dc-footer__newsletter-input:focus {
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
        }

        .dc-footer__newsletter-btn {
          background: var(--dc-gradient);
          border: none;
          border-radius: 10px;
          padding: 11px 18px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.825rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
          width: 100%;
        }

        .dc-footer__newsletter-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        /* Divider */
        .dc-footer__divider {
          height: 1px;
          background: var(--dc-border);
          margin: 0 -24px;
        }

        /* Bottom bar */
        .dc-footer__bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0 28px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .dc-footer__copyright {
          font-size: 0.825rem;
          color: var(--dc-text-muted);
        }

        .dc-footer__copyright strong {
          color: var(--dc-text-secondary);
          font-weight: 500;
        }

        .dc-footer__badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dc-footer__badge {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--dc-text-muted);
          background: var(--dc-surface);
          border: 1px solid var(--dc-border);
          padding: 4px 12px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .dc-footer__badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .dc-footer__main {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
        }

        @media (max-width: 600px) {
          .dc-footer__container {
            padding: 48px 20px 0;
          }
          .dc-footer__main {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .dc-footer__brand-desc {
            max-width: 100%;
          }
          .dc-footer__bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>

      <footer className="dc-footer">
        <div className="dc-footer__glow" aria-hidden="true" />

        <div className="dc-footer__container">
          <div className="dc-footer__main">

            {/* Brand Column */}
            <div>
              <a href="/" className="dc-footer__brand-logo">
                Dev<span>Connect</span>
              </a>
              <div className="dc-footer__brand-tag">Now in Beta</div>
              <p className="dc-footer__brand-desc">
                Bridging the gap between talented developers and referrers at
                top tech companies — faster, smarter, together.
              </p>
              <div className="dc-footer__socials">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="dc-footer__social-btn"
                    aria-label={s.label}
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="dc-footer__col-title">Quick Links</h4>
              <ul className="dc-footer__links">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="dc-footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="dc-footer__col-title">Support</h4>
              <ul className="dc-footer__links">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="dc-footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="dc-footer__col-title">Stay in the Loop</h4>
              <p className="dc-footer__newsletter-desc">
                Get job referral tips, platform updates, and success stories
                delivered to your inbox.
              </p>
              <div className="dc-footer__newsletter-form">
                <input
                  className="dc-footer__newsletter-input"
                  type="email"
                  placeholder="your@email.com"
                  aria-label="Email for newsletter"
                />
                <button className="dc-footer__newsletter-btn">
                  Subscribe →
                </button>
              </div>
            </div>
          </div>

          <div className="dc-footer__divider" />

          <div className="dc-footer__bottom">
            <p className="dc-footer__copyright">
              © {currentYear} <strong>DevConnect</strong>. All rights reserved.
            </p>
            <div className="dc-footer__badges">
              <span className="dc-footer__badge">
                <span className="dc-footer__badge-dot" />
                All systems operational
              </span>
              <span className="dc-footer__badge">Made with ♥ for devs</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
