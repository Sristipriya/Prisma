import React from 'react';
import './Footer.css';
import { PrismaLogo } from './icons';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <PrismaLogo size={48} />
            <p className="footer__desc">
              Next-generation zero-knowledge payroll infrastructure built on the Midnight Network.
            </p>
          </div>
          
          <div className="footer__links">
            <div className="footer__col">
              <h4>Product</h4>
              <a href="#">Payroll Streams</a>
              <a href="#">Vendor Payments</a>
              <a href="#">Enterprise Analytics</a>
              <a href="#">Compliance</a>
            </div>
            <div className="footer__col">
              <h4>Developers</h4>
              <a href="#">Documentation</a>
              <a href="#">Midnight SDK</a>
              <a href="#">Smart Contracts</a>
              <a href="#">API Reference</a>
            </div>
            <div className="footer__col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Prisma Infrastructure. All rights reserved.</p>
          <div className="footer__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
