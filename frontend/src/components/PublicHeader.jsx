import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PublicHeader({ onOpenAuth }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="public-nav-header">
        <style>{`
          .public-nav-header {
            height: 74px;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          }
          .public-nav-container {
            width: min(1180px, calc(100% - 40px));
            margin: auto;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }
          .public-nav-links {
            display: flex;
            gap: 24px;
            font-size: 14px;
            align-items: center;
          }
          .public-nav-links a {
            color: #1e293b;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
          }
          .public-nav-links a:hover, .public-nav-links a.active {
            color: #0b78ff;
          }
          .public-nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .mobile-toggle-btn {
            display: none;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            width: 40px;
            height: 40px;
            font-size: 18px;
            color: #0f172a;
            cursor: pointer;
            place-items: center;
          }
          .mobile-menu-drawer {
            display: none;
            position: fixed;
            top: 74px;
            left: 0;
            right: 0;
            bottom: 0;
            background: #ffffff;
            z-index: 999;
            padding: 24px;
            flex-direction: column;
            gap: 14px;
            overflow-y: auto;
            border-top: 1px solid #e2e8f0;
          }
          .mobile-menu-drawer.open {
            display: flex;
          }
          .mobile-menu-drawer a {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            text-decoration: none;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          @media (max-width: 900px) {
            .public-nav-links { display: none; }
            .public-nav-actions .lang, .public-nav-actions .btn-light { display: none; }
            .mobile-toggle-btn { display: grid; }
          }
        `}</style>

        <div className="public-nav-container">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/logo.jpg" alt="DigiLites Studio Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontWeight: 800, fontSize: '19px', color: '#0d2142', letterSpacing: '-0.02em' }}>DigiLites Studio</span>
              <span style={{ fontSize: '8.5px', fontWeight: 600, color: '#ff8a00', letterSpacing: '0.2px' }}>Building Brands That Stand Out</span>
            </div>
          </Link>

          <nav className="public-nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/how-it-works" className={location.pathname === '/how-it-works' ? 'active' : ''}>How It Works</Link>
            <Link to="/for-auditors" className={location.pathname === '/for-auditors' ? 'active' : ''}>For Auditors</Link>
            <Link to="/for-brands" className={location.pathname === '/for-brands' ? 'active' : ''}>For Brands</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link>
            <Link to="/faq" className={location.pathname === '/faq' ? 'active' : ''}>FAQs</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
          </nav>

          <div className="public-nav-actions">
            <button className="btn btn-primary" style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#0b78ff,#1763eb)', color: '#fff', border: 0, borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(11,120,255,0.22)' }} onClick={() => onOpenAuth && onOpenAuth('login')}>
              Sign In / Sign Up
            </button>
            <button className="mobile-toggle-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation menu">
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
        <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
        <Link to="/for-auditors" onClick={() => setIsMobileMenuOpen(false)}>For Auditors</Link>
        <Link to="/for-brands" onClick={() => setIsMobileMenuOpen(false)}>For Brands & Businesses</Link>
        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
        <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>
        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
        <Link to="/privacy" onClick={() => setIsMobileMenuOpen(false)}>Privacy Policy</Link>
        <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)}>Terms & Conditions</Link>
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#0b78ff,#1763eb)', color: '#fff', border: 0, borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setIsMobileMenuOpen(false); onOpenAuth && onOpenAuth('login'); }}>
            Sign In / Sign Up
          </button>
        </div>
      </div>
    </>
  );
}
