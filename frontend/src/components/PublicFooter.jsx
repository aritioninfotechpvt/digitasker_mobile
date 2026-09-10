import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { showSuccess, showToast } from '../utils/swal';

export default function PublicFooter() {
  const [emailInput, setEmailInput] = useState('');
  const [contactInfo] = useState(() => {
    const cached = localStorage.getItem('digitasker_website_cms_contact');
    return cached ? JSON.parse(cached) : {
      email: 'support@digilitestudio.com',
      phone: '+91 7360002233',
      address: 'DigiLites Studio HQ, Innovation Hub, Tech City',
      copyright: '© 2026 DigiLites Studio. All rights reserved.',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com'
    };
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showSuccess('Subscribed Successfully!', `Thank you for subscribing (${emailInput}). You will receive task alerts and updates.`);
    setEmailInput('');
  };

  return (
    <footer className="public-footer">
      <style>{`
        .public-footer {
          border-top: 1px solid #e8edf4;
          background: #fbfcfe;
          padding: 36px 0 16px;
        }
        .footer-container {
          width: min(1180px, calc(100% - 40px));
          margin: auto;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 0.8fr 0.8fr 1.6fr;
          gap: 24px;
        }
        .footer-grid h4 {
          font-size: 13px;
          margin: 0 0 12px;
          font-weight: 700;
          color: #0f172a;
        }
        .footer-grid a, .footer-grid p {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin: 8px 0;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-grid a:hover {
          color: #0b78ff;
        }
        .footer-socials {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .footer-socials i {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #eef4ff;
          color: #0b78ff;
          display: grid;
          place-items: center;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .footer-socials i:hover {
          background: #0b78ff;
          color: #ffffff;
        }
        .newsletter-box {
          background: #f1f5f9;
          border-radius: 14px;
          padding: 18px;
        }
        .newsletter-box h4 { margin-bottom: 4px; }
        .newsletter-box p { margin: 0 0 12px; color: #475569; }
        .subscribe-form { display: flex; gap: 8px; }
        .subscribe-form input {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
          outline: none;
        }
        .subscribe-form button {
          background: linear-gradient(135deg,#0b78ff,#1763eb);
          color: #fff;
          border: 0;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .copy-bar {
          margin-top: 28px;
          padding-top: 16px;
          border-top: 1px solid #edf1f6;
          display: flex;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 11px;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; }
          .copy-bar { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/logo.jpg" alt="DigiLites Studio Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontWeight: 800, fontSize: '18px', color: '#0d2142', letterSpacing: '-0.02em' }}>DigiLites Studio</span>
                <span style={{ fontSize: '8.5px', fontWeight: 600, color: '#ff8a00', letterSpacing: '0.2px' }}>Building Brands That Stand Out</span>
              </div>
            </Link>
            <p style={{ marginTop: '12px', fontSize: '11.5px', color: '#64748b' }}>
              Connecting brands with real-time field intelligence and mystery audit taskers nationwide.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/for-auditors">For Auditors</Link>
            <Link to="/for-brands">For Brands</Link>
            <Link to="/about">About Us</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/privacy">Cookie Policy</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/faq">FAQs</Link>
            <Link to="/contact">Help & Support</Link>
            <a href={`mailto:${contactInfo.email || 'support@digilitestudio.com'}`}>{contactInfo.email || 'support@digilitestudio.com'}</a>
            <h4 style={{ marginTop: '14px' }}>Follow Us</h4>
            <div className="footer-socials">
              <i className="fa-brands fa-facebook-f" onClick={() => window.open(contactInfo.facebook || 'https://facebook.com', '_blank')}></i>
              <i className="fa-brands fa-instagram" onClick={() => window.open(contactInfo.instagram || 'https://instagram.com', '_blank')}></i>
              <i className="fa-brands fa-linkedin-in" onClick={() => window.open(contactInfo.linkedin || 'https://linkedin.com', '_blank')}></i>
              <i className="fa-brands fa-youtube" onClick={() => showToast('YouTube: DigiLites Studio', 'info')}></i>
            </div>
          </div>
          <div className="newsletter-box">
            <h4>Subscribe to Alerts</h4>
            <p>Get the latest field audit tasks & platform news.</p>
            <form onSubmit={handleSubscribe} className="subscribe-form">
              <input
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="copy-bar">
          <span>{contactInfo.copyright || '© 2026 DigiLites Studio. All rights reserved.'}</span>
          <span>Building Brands That Stand Out. A Smarter Tomorrow.</span>
        </div>
      </div>
    </footer>
  );
}
