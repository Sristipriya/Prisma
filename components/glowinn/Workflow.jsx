import React from 'react';
import './Workflow.css';

export default function Workflow() {
  return (
    <section className="workflow shell" id="workflow">
      <div className="workflow__inner glass">
        <div className="workflow__content">
          <div className="hero__pill-tag">
            <span className="hero__dot" />
            <span>How it works</span>
          </div>
          <h2 className="workflow__title">Cryptographic Payroll Flow</h2>
          <p className="workflow__desc">
            Prisma utilizes specialized zero-knowledge circuits compiled for the Midnight Network to validate payroll execution without exposing underlying data.
          </p>
          
          <ul className="workflow__steps">
            <li className="workflow__step">
              <span className="workflow__step-num">01</span>
              <div>
                <strong>Define Stream</strong>
                <p>Set recipient, amount, and vesting schedule locally.</p>
              </div>
            </li>
            <li className="workflow__step">
              <span className="workflow__step-num">02</span>
              <div>
                <strong>Generate Proof</strong>
                <p>Client-side proving validates criteria against network state.</p>
              </div>
            </li>
            <li className="workflow__step">
              <span className="workflow__step-num">03</span>
              <div>
                <strong>Verify & Settle</strong>
                <p>Midnight Network verifies the proof and settles the transaction.</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="workflow__visual">
          <div className="code-mockup">
            <div className="code-mockup__header">
              <div className="mac-dots">
                <span/> <span/> <span/>
              </div>
              <span className="file-name">payroll.compact</span>
            </div>
            <pre className="code-mockup__body">
              <code>
{`export circuit create_payroll(
  recipient: Bytes<32>, 
  amount: Uint<64>
): [] {
  assert amount > 0, "Invalid amount";
  
  // Verify private state without disclosure
  let state = get_state();
  assert state.balance >= amount;
  
  // Update ledger commitments
  commit_transaction(recipient, amount);
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
