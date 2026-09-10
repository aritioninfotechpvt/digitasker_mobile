import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import AuthModal from '../components/AuthModal';

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('auditors');
  const [activeFaq, setActiveFaq] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('vendor');

  const openAuth = (role = 'vendor') => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const faqs = {
    auditors: [
      { q: 'How do I start earning money on DigiLites Studio?', a: 'Sign up for a free account, complete your profile verification, browse available tasks near your location on the map, complete the task checklist, upload photo proof, and withdraw your reward once approved.' },
      { q: 'What types of tasks are available for auditors?', a: 'Tasks include Mystery Audits at restaurants and cafes, Retail Store Display Checks, Pharmacy Product Audits, Fuel Station Service Checks, and Bank/ATM Hygiene Audits.' },
      { q: 'How and when do I receive payment?', a: 'Once your task submission is approved by QC, funds are instantly credited to your DigiLites Wallet. You can withdraw to any UPI ID or bank account 24/7.' },
      { q: 'Is there any minimum payout limit?', a: 'The minimum withdrawal limit is just ₹100, allowing you to transfer your earnings whenever you want.' },
    ],
    brands: [
      { q: 'How do brands launch audit campaigns?', a: 'Brand managers register for a Brand Workspace account, upload campaign targets (store addresses, audit checklist, photo evidence rules), specify reward rates, and publish the campaign across target cities.' },
      { q: 'How does DigiLites Studio prevent fraudulent submissions?', a: 'Our platform uses automated GPS geofencing (must be within store radius), EXIF photo metadata validation, image duplicate detection, and mandatory manual QC verification.' },
      { q: 'Can we get custom white-label reports?', a: 'Yes! Enterprise brand accounts have access to our Custom Report Builder to generate PDF reports, executive summaries, and scheduled email alerts with your company branding.' },
    ],
    payouts: [
      { q: 'What payment methods are supported for withdrawals?', a: 'We support instant UPI (GPay, PhonePe, Paytm, BHIM), IMPS bank transfers, and wallet transfers.' },
      { q: 'What happens if a task submission is rejected?', a: 'If a submission is missing required photo proof or submitted out of radius, our QC team will provide detailed feedback, and you can re-submit the task if slots are open.' },
    ],
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      <PublicHeader onOpenAuth={openAuth} />

      <section style={{ background: "linear-gradient(90deg, rgba(13,32,60,0.92) 0%, rgba(13,32,60,0.78) 100%), url('https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat", color: '#ffffff', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.12)', color: '#38bdf8', padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            HELP & KNOWLEDGE BASE
          </span>
          <h1 style={{ fontSize: '42px', margin: '16px 0 12px', fontWeight: 800 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '650px', margin: '0 auto' }}>
            Find answers to common questions about field auditing, payout methods, campaign setup, and security.
          </p>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div style={{ width: 'min(1000px, calc(100% - 40px))', margin: 'auto' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '36px' }}>
            {[
              { id: 'auditors', label: 'For Field Auditors' },
              { id: 'brands', label: 'For Brands & Clients' },
              { id: 'payouts', label: 'Payouts & Wallet' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveCategory(tab.id); setActiveFaq(0); }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: activeCategory === tab.id ? '2px solid #0b78ff' : '1px solid #e2e8f0',
                  background: activeCategory === tab.id ? '#eff6ff' : '#ffffff',
                  color: activeCategory === tab.id ? '#0b78ff' : '#475569',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs[activeCategory].map((faq, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: activeFaq === idx ? '#ffffff' : '#f8fafc',
                  boxShadow: activeFaq === idx ? '0 8px 24px rgba(11,120,255,0.08)' : 'none',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    color: '#0f172a',
                  }}
                >
                  {faq.q}
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: activeFaq === idx ? '#0b78ff' : '#cbd5e1', color: activeFaq === idx ? '#fff' : '#0f172a', display: 'grid', placeItems: 'center', fontSize: '14px' }}>
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </div>
                {activeFaq === idx && (
                  <div style={{ padding: '0 20px 20px', fontSize: '14px', color: '#475569', lineHeight: 1.65 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole={authRole} />
    </div>
  );
}
