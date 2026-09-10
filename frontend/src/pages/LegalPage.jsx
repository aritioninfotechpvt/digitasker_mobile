import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import AuthModal from '../components/AuthModal';

export default function LegalPage({ title = 'Terms & Conditions' }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      <PublicHeader onOpenAuth={() => setShowAuthModal(true)} />

      <section style={{ background: "linear-gradient(90deg, rgba(13,32,60,0.92) 0%, rgba(13,32,60,0.78) 100%), url('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat", color: '#ffffff', padding: '50px 0', textAlign: 'center' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <h1 style={{ fontSize: '36px', margin: 0, fontWeight: 800 }}>{title}</h1>
          <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '8px' }}>Last Updated: January 1, 2026</p>
        </div>
      </section>

      <section style={{ padding: '50px 0' }}>
        <div style={{ width: 'min(900px, calc(100% - 40px))', margin: 'auto', lineHeight: 1.7, color: '#334155', fontSize: '15px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>1. Overview & Platform Rules</h2>
          <p>
            Welcome to DigiLites Studio. By accessing or using our platform as a Brand Client, Field Auditor, or Vendor Partner, you agree to comply with these terms.
          </p>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '28px' }}>2. Field Audit Submissions & Verification</h2>
          <p>
            All task submissions must be completed in good faith. Submissions generated using spoofed GPS coordinates, stock imagery, or altered EXIF metadata will result in immediate account termination and forfeiture of wallet rewards.
          </p>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '28px' }}>3. Payouts & Wallet Terms</h2>
          <p>
            Approved audit rewards are credited to your DigiLites Wallet and can be withdrawn to verified UPI IDs or Bank accounts. Wallet balances are non-transferable between accounts.
          </p>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '28px' }}>4. Data Protection & Privacy Compliance</h2>
          <p>
            DigiLites Studio adheres to the Digital Personal Data Protection (DPDP) Act. Personal details and geolocation data are encrypted and used solely for audit verification.
          </p>
        </div>
      </section>

      <PublicFooter />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole="vendor" />
    </div>
  );
}
