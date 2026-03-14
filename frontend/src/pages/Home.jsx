import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/* ─── Static data ──────────────────────────────────── */
const STATS = [
  { number: '4,200+', label: 'Developers placed' },
  { number: '320+', label: 'Partner companies' },
  { number: '89%', label: 'Referral success rate' },
  { number: '< 2wk', label: 'Avg. time to referral' },
];

const STEPS = [
  {
    number: '01',
    icon: '🧑‍💻',
    title: 'Create your profile',
    desc: 'Showcase your skills, experience, and the roles you\'re targeting. Stand out with a developer-first profile built for tech hiring.',
  },
  {
    number: '02',
    icon: '🔍',
    title: 'Find your referrer',
    desc: 'Browse employees at top companies filtered by company, tech stack, or role. Every profile shows response rate and availability.',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Get referred',
    desc: 'Chat directly, share your resume, and track every referral request from sent to submitted — all in one place.',
  },
];

const FEATURES = [
  {
    icon: '🔎',
    title: 'Smart Employee Search',
    desc: 'Filter by company, tech stack, role, or seniority. Find the exact person who can refer you into your dream team.',
    highlight: false,
  },
  {
    icon: '💬',
    title: 'Real‑time Messaging',
    desc: 'End-to-end encrypted chat built into the platform. No cold DMs on LinkedIn — every conversation has context.',
    highlight: true,
  },
  {
    icon: '📋',
    title: 'Referral Tracker',
    desc: 'A live dashboard for every referral: Pending → In Review → Submitted → Hired. Never lose track of an application again.',
    highlight: false,
  },
  {
    icon: '📄',
    title: 'Resume Sharing',
    desc: 'Attach your resume directly inside a chat thread. Referrers see everything they need without leaving the platform.',
    highlight: false,
  },
  {
    icon: '🏢',
    title: 'Company Insights',
    desc: 'Browse open roles, team culture notes, and interview tips shared by employees — before you even send your first message.',
    highlight: false,
  },
  {
    icon: '🔔',
    title: 'Instant Notifications',
    desc: 'Get alerted the moment a referrer responds, or when your referral status changes. No more checking and waiting.',
    highlight: false,
  },
];

/* ─── Sub-components ───────────────────────────────── */
const HeroVisual = () => (
  <div className="hero__visual anim-fade-up anim-delay-4">
    {/* Job card */}
    <div className="hero-card hero-card--main">
      <div className="hero-card__logo">🏢</div>
      <div>
        <div className="hero-card__company">Stripe</div>
        <div className="hero-card__role">Senior Frontend Engineer</div>
      </div>
      <span className="hero-card__badge">Referring</span>
    </div>

    {/* Chat preview */}
    <div className="hero-card hero-card--chat">
      <div className="chat-bubble chat-bubble--in">
        Hey! I saw your profile — your React experience is solid 👀
      </div>
      <div className="chat-bubble chat-bubble--out">
        Thanks! I'd love a referral for the frontend role 🙏
      </div>
    </div>

    {/* Status card */}
    <div className="hero-card hero-card--status">
      <div className="status-icon">✅</div>
      <div>
        <div className="status-label">Referral status</div>
        <div className="status-value">Submitted to Hiring Manager</div>
      </div>
    </div>
  </div>
);

/* ─── Main Component ───────────────────────────────── */
const Home = () => {
  return (
    <div className="home-page">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />

        <div className="container">
          <div className="hero__inner">

            {/* Left: copy */}
            <div className="hero__copy">
              <h1 className="hero__title anim-fade-up anim-delay-1">
                Get Referred to Your{' '}
                <span className="hero__title-accent">Dream Tech Job</span>
              </h1>

              <p className="hero__subtitle anim-fade-up anim-delay-2">
                Connect directly with employees at top tech companies.
                Skip the filters, build real relationships, and land the
                referral that gets your resume seen.
              </p>

              <div className="hero__ctas anim-fade-up anim-delay-3">
                <Link to="/register?role=seeker" className="btn btn-primary">
                  Get Referred →
                </Link>
                <Link to="/register?role=referrer" className="btn btn-outline">
                  Refer Developers
                </Link>
              </div>

              <div className="hero__social-proof anim-fade-up anim-delay-4">
                <div className="hero__avatars">
                  {['🧑', '👩', '🧑‍🦱', '👨‍🦲'].map((emoji, i) => (
                    <div className="hero__avatar" key={i}>{emoji}</div>
                  ))}
                </div>
                <span>Join 4,200+ developers already placed</span>
              </div>
            </div>

            {/* Right: visual mockup */}
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────── */}
      <div className="stats">
        <div className="container">
          <div className="stats__grid">
            {STATS.map((stat, i) => (
              <React.Fragment key={i}>
                <div className="stats__item">
                  <div className="stats__item-number">{stat.number}</div>
                  <div className="stats__item-label">{stat.label}</div>
                </div>
                {i < STATS.length - 1 && <div className="stats__divider" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="how-it-works">
        <div className="container">
          <div className="how-it-works__header">
            <p className="section-eyebrow">How it works</p>
            <h2 className="section-title">Three steps to your next role</h2>
            <p className="section-subtitle">
              DevConnect cuts through the noise. No cold applying, no ATS black
              holes — just direct access to people who can open doors.
            </p>
          </div>

          <div className="steps">
            {STEPS.map((step) => (
              <div className="step-card" key={step.number}>
                <div className="step-card__number">{step.number}</div>
                <div className="step-card__icon">{step.icon}</div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="features">
        <div className="container">
          <div className="features__header">
            <p className="section-eyebrow">Platform features</p>
            <h2 className="section-title">Everything you need to get hired</h2>
          </div>

          <div className="features__grid">
            {FEATURES.map((f) => (
              <div
                className={`feature-card${f.highlight ? ' feature-card--highlight' : ''}`}
                key={f.title}
              >
                <div className="feature-card__icon-wrap">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────── */}
      <div className="container">
        <div className="cta-banner">
          <h2 className="cta-banner__title">Ready to skip the queue?</h2>
          <p className="cta-banner__sub">
            Join DevConnect for free. It takes less than 2 minutes to set up your profile.
          </p>
          <div className="cta-banner__actions">
            <Link to="/register?role=seeker" className="btn btn-primary">
              Start as a Developer
            </Link>
            <Link to="/register?role=referrer" className="btn btn-outline">
              Join as an Employee
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
