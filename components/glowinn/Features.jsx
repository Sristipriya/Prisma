import React from 'react';
import './Features.css';
import { ShieldCheck, Zap, Lock, Globe, Server, Code } from 'lucide-react';

const FEATURES = [
  {
    icon: <ShieldCheck size={24} />,
    title: 'Zero-Knowledge Proofs',
    desc: 'Verify transactions on-chain without revealing sensitive payroll amounts or recipient addresses.'
  },
  {
    icon: <Zap size={24} />,
    title: 'High-Performance',
    desc: 'Execute thousands of payroll streams concurrently with near-instant settlement on Midnight Preprod.'
  },
  {
    icon: <Lock size={24} />,
    title: 'Enterprise Privacy',
    desc: 'Maintain complete financial confidentiality while complying with organizational auditing requirements.'
  },
  {
    icon: <Globe size={24} />,
    title: 'Global Settlements',
    desc: 'Pay contractors and vendors worldwide without intermediary delays or hidden currency conversion fees.'
  },
  {
    icon: <Server size={24} />,
    title: 'Immutable Ledger',
    desc: 'Every shielded transaction is cryptographically secured on the Midnight blockchain architecture.'
  },
  {
    icon: <Code size={24} />,
    title: 'Developer Ready',
    desc: 'Easily integrate our ZK contracts with existing HR software and enterprise resource planning systems.'
  }
];

export default function Features() {
  return (
    <section className="features shell" id="features">
      <div className="features__header">
        <h2 className="features__title">Engineered for the Shielded Web</h2>
        <p className="features__subtitle">
          Prisma leverages the Midnight Network to bring unprecedented privacy and performance to enterprise finance.
        </p>
      </div>

      <div className="features__grid">
        {FEATURES.map((feat, idx) => (
          <div key={idx} className="feature-card glass">
            <div className="feature-card__icon">{feat.icon}</div>
            <h3 className="feature-card__title">{feat.title}</h3>
            <p className="feature-card__desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
