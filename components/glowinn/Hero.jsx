"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import './Hero.css';

const HERO_VIDEO_URL = '/hero.mp4';

const STATS = [
  { figure: '100%', label: 'Shielded', foot: 'Private State' },
  { figure: '< 3s', label: 'Proof Time', foot: 'Midnight Preprod' },
  { figure: '0%', label: 'Data Leak', foot: 'Zero-Knowledge' },
];

export default function Hero() {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setReady(true);
    }
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero__media" aria-hidden="true">
        <video
          ref={videoRef}
          className={`hero__video ${ready ? 'is-ready' : ''}`}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
        />
        <div className="hero__scrim" />
      </div>

      <div className="hero__body shell">
        <div className="hero__pill-tag">
          <span className="hero__dot" />
          <span>Midnight Network • Zero-Knowledge Engine</span>
        </div>

        <h1 className="hero__title">
          <span className="hero__title-lead">Shielded Financial Infrastructure</span>
          Private Payroll & Vendor Settlements.
        </h1>

        <div className="hero__actions">
          <Link className="btn btn--pearl hero__cta" href="/payroll">
            Launch Shielded Payroll
          </Link>
          <Link className="btn btn--ink hero__cta" href="/vendor">
            Vendor Settlements
          </Link>
        </div>
      </div>

      <div className="hero__foot shell">
        <article className="card card--note">
          <h2>Zero-Knowledge Privacy</h2>
          <p>
            Execute enterprise payroll streams and contractor invoices with
            cryptographic zero-knowledge proofs on Midnight Network.
          </p>
        </article>

        <p className="hero__caption">
          Mathematical proofs without disclosing balances or recipient state.
        </p>

        <div className="hero__stats">
          {STATS.map((s) => (
            <article key={s.figure} className="card card--stat">
              <strong>{s.figure}</strong>
              <span className="card__label">{s.label}</span>
              <span className="card__foot">{s.foot}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
