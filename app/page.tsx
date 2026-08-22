"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import '@/components/glowinn/landing.css';
import { PrismaLogo, MenuIcon } from '@/components/glowinn/icons';

/* ─── DATA ─────────────────────────────── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#workflow' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'Developers', href: '#developers' },
];

const STATS = [
  { value: '100%', label: 'Shielded', note: 'Private state on Midnight' },
  { value: '<3s', label: 'Proof Time', note: 'Client-side ZK proving' },
  { value: '0%', label: 'Data Leak', note: 'Zero-knowledge guarantees' },
];

import { Shield, Zap, Globe, Building2, Network, Code2, Check } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Zero-Knowledge Proofs',
    desc: 'Verify every transaction on-chain without revealing payroll amounts, balances, or recipient addresses. Privacy is the default.',
  },
  {
    icon: Zap,
    title: 'Sub-3s Settlement',
    desc: 'Client-side proving completes in under 3 seconds. Midnight confirms shielded transactions with cryptographic finality.',
  },
  {
    icon: Globe,
    title: 'Global Payroll Streams',
    desc: 'Pay contractors and employees in any jurisdiction without intermediaries, FX fees, or compliance bottlenecks.',
  },
  {
    icon: Building2,
    title: 'Enterprise Compliance',
    desc: 'Maintain auditability with selective disclosure. Prove compliance to regulators without revealing private financial data.',
  },
  {
    icon: Network,
    title: 'Immutable Ledger',
    desc: 'Every shielded payroll execution is cryptographically recorded on the Midnight blockchain — tamper-proof by design.',
  },
  {
    icon: Code2,
    title: 'SDK Integration',
    desc: 'Drop Prisma into your existing HR or ERP stack with our typed SDK. First class TypeScript, REST, and webhook support.',
  },
];

const WORKFLOW_STEPS = [
  {
    n: '01',
    title: 'Define the Stream',
    desc: 'Configure recipient wallet, amount, vesting schedule, and compliance criteria — all processed locally.',
  },
  {
    n: '02',
    title: 'Generate ZK Proof',
    desc: 'Our Compact circuit compiles a zero-knowledge proof client-side, validating all constraints without server exposure.',
  },
  {
    n: '03',
    title: 'Submit to Midnight',
    desc: 'The shielded transaction is broadcast to Midnight preprod. Validators verify the proof and confirm settlement.',
  },
  {
    n: '04',
    title: 'Recipient Claims',
    desc: 'Recipients claim their vested amount directly to their wallet. No intermediary ever touches the funds.',
  },
];

const USE_CASES = [
  {
    tag: 'Enterprise',
    title: 'Corporate Payroll',
    desc: 'Run monthly payroll for thousands of employees with ZK-verified amounts and automatic compliance attestation.',
  },
  {
    tag: 'Startups',
    title: 'Token Vesting',
    desc: 'Issue shielded vesting schedules for equity and token allocations. Cliff, linear, or custom unlock curves.',
  },
  {
    tag: 'Remote Teams',
    title: 'Contractor Invoicing',
    desc: 'Settle vendor invoices globally in seconds. Private, verifiable, and immutable — no SWIFT delays.',
  },
  {
    tag: 'Finance',
    title: 'Treasury Management',
    desc: 'Move funds between treasury wallets with cryptographic audit trails and selective disclosure for boards.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Prisma eliminated our international payroll overhead entirely. Our contractors get paid in seconds, not days, and our finance team finally has cryptographic proof of every disbursement.',
    name: 'Ayesha Raza',
    role: 'CFO, Nexus Capital Group',
    initial: 'A',
  },
  {
    quote: "We replaced three payroll providers with Prisma. The zero-knowledge architecture means we're compliant across seven jurisdictions without exposing a single salary figure.",
    name: 'Dmitri Volkov',
    role: 'Head of Engineering, Archon Labs',
    initial: 'D',
  },
  {
    quote: 'The developer SDK is exceptional. We integrated shielded payroll into our ERP in a single sprint. The TypeScript types are perfect and the docs are comprehensive.',
    name: 'Samira Okafor',
    role: 'Staff Engineer, Meridian Finance',
    initial: 'S',
  },
];

const TRUST_LOGOS = [
  'Midnight Network', 'Cardano Foundation', 'IOHK', 'Emurgo',
  'Catalyst DAO', 'Fintech Alliance', 'ZK Guild', 'Open Finance',
];

const METRICS = [
  { value: '$2.4', unit: 'B+', label: 'Value Processed' },
  { value: '14', unit: 'k+', label: 'Active Streams' },
  { value: '99.98', unit: '%', label: 'Uptime SLA' },
  { value: '<3', unit: 's', label: 'Avg. Proof Time' },
];

/* ─── PAGE ──────────────────────────────── */
export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p?.catch) p.catch(() => {});
  }, []);

  return (
    <div className="lp-root">

      {/* ── STICKY VIDEO BACKGROUND ── */}
      <div className="lp-bg" aria-hidden="true">
        <video
          ref={videoRef}
          className={videoReady ? 'ready' : ''}
          src="/hero.mp4"
          autoPlay muted loop playsInline preload="auto"
          onCanPlay={() => setVideoReady(true)}
        />
        <div className="lp-bg__scrim" />
      </div>

      {/* ── LIQUID GLASS NAVBAR ── */}
      <header className="nav">
        <div className="nav__pill">
          <Link className="nav__brand" href="/">
            <PrismaLogo size={20} />
            <span>Prisma</span>
            <span className="nav__badge">Beta</span>
          </Link>

          <nav className="nav__rail" aria-label="Primary">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href}>{l.label}</a>
            ))}
          </nav>

          <div className="nav__actions">
            <Link className="btn-glass btn-glass--primary" href="/login">
              Get Started →
            </Link>
          </div>

          <button
            className="nav__toggle"
            aria-expanded={navOpen}
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setNavOpen(!navOpen)}
          >
            <MenuIcon open={navOpen} size={20} />
          </button>
        </div>

        {navOpen && (
          <div className="nav__sheet">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={() => setNavOpen(false)}>{l.label}</a>
            ))}
            <Link href="/login" onClick={() => setNavOpen(false)}>Sign In</Link>
            <Link href="/payroll" className="btn-glass btn-glass--primary" onClick={() => setNavOpen(false)}>
              Launch dApp →
            </Link>
          </div>
        )}
      </header>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section className="hero" id="top">
        <div className="hero__body shell">
          <div className="hero__pill-tag">
            <span className="hero__dot" />
            <span>Midnight Network · Zero-Knowledge Infrastructure</span>
          </div>

          <h1 className="hero__title">
            Shielded Payroll &<br />
            <em>Vendor Finance</em><br />
            at Enterprise Scale.
          </h1>

          <p className="hero__sub">
            Prisma brings cryptographic zero-knowledge proofs to enterprise payroll.
            Execute private, verifiable financial transactions — without leaking a single number.
          </p>

          <div className="hero__actions">
            <Link className="btn-glass btn-glass--primary" href="/login">
              Get Started Free →
            </Link>
            <Link className="btn-glass" href="#workflow">
              How it Works
            </Link>
          </div>
        </div>

        <div className="hero__foot shell">
          <div className="hero__note">
            <h3>Zero-Knowledge Privacy</h3>
            <p>Every payroll stream is cryptographically verified on Midnight without revealing balances, recipients, or amounts to the network.</p>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 300, paddingBottom: '6px', textAlign: 'center' }}>
            Proof-verified. Never exposed. Always shielded.
          </p>

          <div style={{ display: 'flex', gap: '16px' }}>
            {STATS.map(s => (
              <div key={s.value} className="stat-card">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          TRUST STRIP
      ════════════════════════════════ */}
      <div className="trust-strip">
        <p className="trust-strip__label">Trusted by teams building on</p>
        <div className="trust-strip__track">
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((name, i) => (
            <span key={i} className="trust-logo">{name}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════
          FEATURES
      ════════════════════════════════ */}
      <section className="lp-section shell" id="features">
        <div className="section__header">
          <div className="section__eyebrow">Core Capabilities</div>
          <h2 className="section__title">Built for the Shielded Economy</h2>
          <p className="section__desc">
            Every feature of Prisma is designed around the principle that financial data should be verifiable without being visible.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feat-card">
                <div className="feat-card__icon">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="feat-card__title">{f.title}</h3>
                <p className="feat-card__desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════
          METRICS BAND
      ════════════════════════════════ */}
      <section className="lp-section lp-section--darker" id="metrics">
        <div className="metrics-band shell">
          <div className="metrics-grid">
            {METRICS.map(m => (
              <div key={m.label} className="metric-cell">
                <div className="metric-cell__value">
                  {m.value}<em>{m.unit}</em>
                </div>
                <div className="metric-cell__label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════ */}
      <section className="lp-section shell" id="workflow">
        <div className="section__header">
          <div className="section__eyebrow">Protocol Flow</div>
          <h2 className="section__title">From Stream to Settlement</h2>
          <p className="section__desc">
            Four steps. One cryptographic proof. Zero exposure of your financial data to the network.
          </p>
        </div>

        <div className="workflow-split">
          <ul className="workflow__steps">
            {WORKFLOW_STEPS.map(s => (
              <li key={s.n} className="workflow__step">
                <div className="step-num">{s.n}</div>
                <div className="step-body">
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="code-pane">
            <div className="code-pane__header">
              <div className="mac-dots"><span/><span/><span/></div>
              <span className="code-pane__filename">payroll.compact</span>
            </div>
            <pre className="code-pane__body">{`export circuit create_payroll(
  recipient: Bytes<32>,
  amount:    Uint<64>,
  nonce:     Bytes<16>
): [] {
  // All validation is local — nothing
  // is disclosed to the network.
  assert amount > 0u64,
    "Amount must be positive";

  let state = get_own_state<PayrollState>();
  assert state.balance >= amount,
    "Insufficient shielded balance";

  // Commit to the Midnight ledger
  commit_transfer(recipient, amount);
  update_state(PayrollState {
    balance: state.balance - amount
  });
}`}</pre>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          USE CASES
      ════════════════════════════════ */}
      <section className="lp-section lp-section--lighter shell" id="use-cases">
        <div className="section__header">
          <div className="section__eyebrow">Use Cases</div>
          <h2 className="section__title">Built for Every Financial Team</h2>
          <p className="section__desc">
            Whether you're running payroll for 10 or 10,000 people, Prisma's shielded infrastructure scales with you.
          </p>
        </div>

        <div className="use-cases-grid">
          {USE_CASES.map(u => (
            <div key={u.title} className="use-case-card">
              <div className="use-case-card__tag">{u.tag}</div>
              <h3 className="use-case-card__title">{u.title}</h3>
              <p className="use-case-card__desc">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          DEVELOPER / API
      ════════════════════════════════ */}
      <section className="lp-section shell" id="developers">
        <div className="devapi-split">
          <div>
            <div className="devapi__eyebrow">Developer SDK</div>
            <h2 className="devapi__title">Ship Shielded Finance in One Sprint</h2>
            <p className="devapi__desc">
              Our TypeScript SDK wraps the Midnight JS client and Compact contracts into a clean, idiomatic API. REST webhooks, real-time proof events, and full documentation included.
            </p>

            <div className="devapi__features">
              {[
                'TypeScript & Node.js SDK with full type safety',
                'Automatic ZK proof generation — no cryptography expertise required',
                'Webhook events for stream creation, vesting, and settlement',
                'REST API with OpenAPI spec and Postman collection',
                'Supabase-backed off-chain data store, ready to deploy',
              ].map(item => (
                <div key={item} className="devapi__feature">
                  <div className="devapi__check"><Check className="w-4 h-4" /></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link className="btn-glass btn-glass--primary" href="/payroll">
                Read the Docs →
              </Link>
              <Link className="btn-glass" href="https://github.com" target="_blank">
                View on GitHub
              </Link>
            </div>
          </div>

          <div className="code-pane">
            <div className="code-pane__header">
              <div className="mac-dots"><span/><span/><span/></div>
              <span className="code-pane__filename">prisma-sdk · TypeScript</span>
            </div>
            <pre className="code-pane__body">{`import { PrismaClient } from '@prisma/sdk';

const prisma = new PrismaClient({
  network: 'midnight-preprod',
  walletSeed: process.env.WALLET_SEED,
});

// Create a shielded payroll stream
const stream = await prisma.payroll.create({
  recipient: '0xabc...def',
  amount: 5_000_00n, // 5,000 USDC (6dp)
  vestingSchedule: {
    type: 'linear',
    cliff: '30d',
    duration: '12mo',
  },
});

console.log(stream.zkProofHash);
// → 0x3f8a...c7d2 (verified on-chain)`}</pre>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
      <section className="lp-section lp-section--darker shell" id="testimonials">
        <div className="section__header">
          <div className="section__eyebrow">What Teams Say</div>
          <h2 className="section__title">Trusted by Finance &amp; Engineering Leaders</h2>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-card__quote">"{t.quote}"</p>
              <div className="testimonial-card__author">
                <div className="author-avatar">{t.initial}</div>
                <div>
                  <span className="author-name">{t.name}</span>
                  <span className="author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          FINAL CTA
      ════════════════════════════════ */}
      <section className="final-cta lp-section" id="contact">
        <div className="final-cta__box shell">
          <div className="final-cta__label">Get Started Today</div>
          <h2 className="final-cta__title">
            Your Payroll Stack,<br />Finally Private.
          </h2>
          <p className="final-cta__sub">
            Join the enterprises using Prisma to run verifiable, shielded payroll on the Midnight Network. No compromise between privacy and compliance.
          </p>
          <div className="final-cta__btns">
            <Link className="btn-glass btn-glass--primary" href="/payroll">
              Launch Shielded Payroll →
            </Link>
            <Link className="btn-glass" href="/login">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer className="site-footer">
        <div className="shell">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand__name">
                <PrismaLogo size={22} />
                Prisma
              </div>
              <p className="footer-brand__desc">
                Zero-knowledge payroll infrastructure built natively on the Midnight Network. Private, verifiable, immutable.
              </p>
            </div>

            <div className="footer-col">
              <h5>Product</h5>
              <a href="/payroll">Payroll Streams</a>
              <a href="/vendor">Vendor Payments</a>
              <a href="/analytics">ZK Analytics</a>
              <a href="#">Compliance</a>
            </div>

            <div className="footer-col">
              <h5>Developers</h5>
              <a href="#">Documentation</a>
              <a href="#">SDK Reference</a>
              <a href="#">Compact Contracts</a>
              <a href="#">API Changelog</a>
            </div>

            <div className="footer-col">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-bottom__copy">
              © {new Date().getFullYear()} Prisma Infrastructure Ltd. All rights reserved.
            </p>
            <div className="footer-bottom__links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
