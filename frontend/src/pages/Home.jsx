import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserAvatar from '../components/ui/UserAvatar';
import { RoleBadge, SkillBadge } from '../components/ui/Badge';
import ScrollReveal from '../components/ui/ScrollReveal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Users, 
  Compass,
  Star,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import './Home.css';

const STATS = [
  { num: '4,200+', label: 'Developers Placed via Referrals' },
  { num: '320+', label: 'Verified Tech Partner Companies' },
  { num: '89%', label: 'Referral Response Rate' },
  { num: '< 2 Wks', label: 'Average Time to First Interview' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Showcase your technical stack, projects, and career aspirations. Upload your resume with verified credentials.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Discover Professionals',
    desc: 'Search verified software engineers and employees at top tech companies filtered by stack, seniority, or company.',
    icon: Compass,
  },
  {
    step: '03',
    title: 'Connect & Request Referrals',
    desc: 'Send personalized referral requests directly to working engineers. Share your target role link and portfolio in one click.',
    icon: Briefcase,
  },
  {
    step: '04',
    title: 'Start Your Career Journey',
    desc: 'Chat directly, track your referral milestones through interview stages, and land your dream tech role.',
    icon: Sparkles,
  },
];

const PLATFORM_BENEFITS = [
  {
    icon: Zap,
    title: 'Skip the ATS Resume Black Hole',
    desc: 'Internal employee referrals receive up to 4x higher interview call rates compared to applying blindly through job boards.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Working Engineers',
    desc: 'Connect with actual engineers and professionals at Google, Stripe, Meta, and Microsoft ready to champion your candidacy.',
  },
  {
    icon: MessageSquare,
    title: 'Direct 1:1 Messaging',
    desc: 'Engage in contextual conversations directly on the platform without awkward cold messages or unanswered emails.',
  },
  {
    icon: TrendingUp,
    title: 'Live Milestone Tracker',
    desc: 'Follow your referral progress transparently from request submission to review, referral submission, and interview.',
  },
  {
    icon: FileText,
    title: 'Direct Resume Sharing',
    desc: 'Securely attach your resume to your profile so referrers can inspect your qualifications without leaving the application.',
  },
  {
    icon: Award,
    title: 'Employee Recognition',
    desc: 'Employees gain referral points, mentorship status, and build strong pipelines for their engineering teams.',
  },
];

const FEATURED_PROFESSIONALS = [
  {
    name: 'Sarah Chen',
    role: 'employee',
    company: 'Stripe',
    experience: 'Staff Frontend Engineer · 6+ yrs',
    bio: 'Passionate about React performance, modern architecture, and helping college grads transition into high-growth fintech.',
    skills: ['React', 'TypeScript', 'Node.js', 'System Design'],
    rating: 24,
  },
  {
    name: 'David Miller',
    role: 'employee',
    company: 'Google',
    experience: 'Senior Software Engineer · 5+ yrs',
    bio: 'Infrastructure & Cloud systems. Happy to review resumes and refer motivated backend engineers for Cloud & Core teams.',
    skills: ['Go', 'Kubernetes', 'Python', 'Distributed Systems'],
    rating: 19,
  },
  {
    name: 'Priya Sharma',
    role: 'employee',
    company: 'Meta',
    experience: 'Software Engineer II · 4+ yrs',
    bio: 'Full-stack product engineer. Excited to connect with ambitious new grads and junior developers targeting product roles.',
    skills: ['GraphQL', 'React', 'Python', 'Mobile'],
    rating: 15,
  },
  {
    name: 'Marcus Vance',
    role: 'employee',
    company: 'Microsoft',
    experience: 'Principal Dev Lead · 8+ yrs',
    bio: 'Azure Developer Experience lead. Mentoring passionate developers and referring top talent for our engineering teams.',
    skills: ['C#', 'Azure', 'TypeScript', 'Microservices'],
    rating: 31,
  },
];

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-page">
      {/* ── 1. Hero Section ── */}
      <section className="landing-hero">
        {/* Floating Ambient Gradient Blobs */}
        <div className="hero-ambient-blob-1" aria-hidden="true" />
        <div className="hero-ambient-blob-2" aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="landing-hero__inner">
            <div className="landing-badge">
              <Sparkles size={15} color="#3B82F6" />
              <span>Next-Generation Employee Referral Platform</span>
            </div>

            <h1 className="landing-title">
              Your Next Opportunity Starts With a{' '}
              <span className="landing-title__gradient">Connection.</span>
            </h1>

            <p className="landing-subtitle">
              DevConnect bridges the gap between ambitious students, job seekers, and verified software engineers at top tech companies to unlock real career referrals.
            </p>

            <div className="landing-ctas">
              <Link to={user ? "/discover" : "/login"} className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
                <span>Explore Professionals</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Join DevConnect Free
              </Link>
            </div>

            {/* Social Trust Line */}
            <div className="hero-social-proof" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex' }}>
                {['#3B82F6', '#1E3A8A', '#7C3AED', '#0F766E'].map((color, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: '2px solid #FFFFFF',
                      marginLeft: idx > 0 ? '-8px' : 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                    }}
                  >
                    {['S', 'G', 'M', 'A'][idx]}
                  </div>
                ))}
              </div>
              <span>Joined by engineers at Stripe, Google, Meta, and Microsoft</span>
            </div>
          </div>

          {/* Interactive Product Dashboard Preview Mockup */}
          <div style={{ marginTop: '3.5rem' }}>
            <div className="preview-mockup-wrapper">
              <div className="preview-mockup-card">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <div className="mockup-dot" style={{ backgroundColor: '#EF4444' }} />
                    <div className="mockup-dot" style={{ backgroundColor: '#F59E0B' }} />
                    <div className="mockup-dot" style={{ backgroundColor: '#10B981' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    app.devconnect.io/dashboard
                  </div>
                  <div style={{ width: '40px' }} />
                </div>

                {/* Simulated UI Inside Preview */}
                <div style={{ padding: '1.5rem', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Referral Status</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#15803D', marginTop: '4px' }}>✓ Accepted by Stripe</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Forwarded to hiring manager</div>
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response Rate</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-blue)', marginTop: '4px' }}>89% First-week Response</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Verified employee champions</div>
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct 1:1 Messages</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--violet-600)', marginTop: '4px' }}>Real-time Chat Active</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Resume review in progress</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#172554', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        SC
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Sarah Chen · Stripe Staff Engineer</div>
                        <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>"Loved your open-source projects! I just submitted your referral for Senior Frontend."</div>
                      </div>
                    </div>
                    <Link to={user ? "/discover" : "/login"} className="btn btn-primary btn-sm">
                      Connect Like This →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Stats Ribbon with Animated Numbers ── */}
      <section className="stats-ribbon">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat, idx) => (
              <AnimatedCounter
                key={idx}
                value={stat.num}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. How It Works ── */}
      <section className="landing-section">
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <span className="section-eyebrow">How It Works</span>
              <h2 className="section-heading">Four steps to unlock your next role</h2>
              <p className="section-subheading">
                Skip the blind online application queues. DevConnect provides a clear, collaborative path from college student to hired professional.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger={true} className="steps-grid">
            {HOW_IT_WORKS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="step-card">
                  <div className="step-number">{step.step}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. Platform Benefits ── */}
      <section className="landing-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid var(--border-main)', borderBottom: '1px solid var(--border-main)' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <span className="section-eyebrow">Why DevConnect</span>
              <h2 className="section-heading">Built specifically for tech hiring</h2>
              <p className="section-subheading">
                Engineers at top tech companies want to refer great developers, and talented job seekers need direct access. DevConnect solves both.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger={true} className="benefits-grid">
            {PLATFORM_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="benefit-card">
                  <div className="benefit-icon">
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {benefit.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5. Featured Professionals Showcase ── */}
      <section className="landing-section">
        <div className="container">
          <ScrollReveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="section-eyebrow">Meet The Network</span>
                <h2 className="section-heading" style={{ margin: 0 }}>
                  Featured Referrers & Engineers
                </h2>
              </div>
              <Link to={user ? "/discover" : "/login"} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                <span>View All Professionals</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger={true} className="featured-grid">
            {FEATURED_PROFESSIONALS.map((prof, idx) => (
              <div
                key={idx}
                className="card card-hover"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <UserAvatar name={prof.name} size="md" showRoleDot={true} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 3px' }}>
                      {prof.name}
                    </h4>
                    <RoleBadge role={prof.role} company={prof.company} size="sm" />
                  </div>
                </div>

                <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={12} />
                  <span>{prof.experience}</span>
                </div>

                <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', lineHeight: 1.5, flexGrow: 1, marginBottom: '1rem' }}>
                  {prof.bio}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.25rem' }}>
                  {prof.skills.map((s, i) => (
                    <SkillBadge key={i} skill={s} />
                  ))}
                </div>

                <Link to={user ? "/discover" : "/login"} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Connect with {prof.name.split(' ')[0]}
                </Link>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ── 6. Final Call to Action ── */}
      <div className="container">
        <ScrollReveal>
          <div className="final-cta-banner">
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(59, 130, 246, 0.25)',
                  color: '#93C5FD',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                <Sparkles size={14} />
                Start Connecting Today
              </span>

              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-0.03em' }}>
                Ready to accelerate your tech career?
              </h2>

              <p style={{ fontSize: '1.0625rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '2rem' }}>
                Join thousands of developers and tech employees who are unlocking opportunities and building real relationships. It takes less than 2 minutes to get started.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/register?role=seeker" className="btn btn-primary btn-lg" style={{ backgroundColor: '#3B82F6' }}>
                  Join as Job Seeker →
                </Link>
                <Link to="/register?role=referrer" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent' }}>
                  Join as Employee Referrer
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Home;
