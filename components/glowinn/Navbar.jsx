"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PrismaLogo, MenuIcon } from './icons';
import './Navbar.css';

const LINKS = [
  { label: 'Overview', href: '#top' },
  { label: 'Shielded Payroll', href: '/payroll' },
  { label: 'Vendor Settlements', href: '/vendor' },
  { label: 'ZK Analytics', href: '/analytics' },
];

export default function Navbar() {
  const [active, setActive] = useState('Overview');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="nav">
      <div className="nav__inner shell">
        {/* 1. BRAND */}
        <Link className="nav__brand" href="#top">
          <PrismaLogo size={22} />
          <span>Prisma</span>
          <span className="nav__badge">v2.0</span>
        </Link>

        {/* 2. RAIL */}
        <nav className="nav__rail" aria-label="Primary">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={active === item.label ? 'is-active' : ''}
              onClick={() => {
                setActive(item.label);
                setOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 3. ACTIONS */}
        <div className="nav__actions">
          <Link className="nav__register" href="/login">
            Sign In
          </Link>
          <Link className="btn btn--ink" href="/payroll">
            Launch dApp
          </Link>
        </div>

        {/* 4. TOGGLE */}
        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {/* MOBILE SHEET */}
      {open && (
        <div className="nav__sheet">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                setActive(item.label);
                setOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}>
            Sign In
          </Link>
          <Link
            className="btn btn--pearl"
            href="/payroll"
            onClick={() => setOpen(false)}
          >
            Launch dApp
          </Link>
        </div>
      )}
    </header>
  );
}
