import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import AuthModal from '../components/AuthModal';

export default function HowItWorksPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('user');
  const [activeTab, setActiveTab] = useState('auditors'); // 'auditors' | 'brands'
  const [activeFaq, setActiveFaq] = useState(null);

  const openAuth = (role = 'user') => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Is registration completely free for field auditors?',
      a: 'Yes, 100% free! You never have to pay any signup fee, membership subscription, or deposit to start performing tasks and earning money on DigiLites Studio.'
    },
    {
      q: 'How long does it take to get paid after completing a task?',
      a: 'Once your task submission is approved by our automated quality engine (usually within 12–24 hours), your task reward is credited immediately to your in-app wallet. You can withdraw instantly to GPay, PhonePe, Paytm, or your Bank Account.'
    },
    {
      q: 'How do brands target specific store locations?',
      a: 'Brands can target specific pincodes, GPS radii around landmarks, retail store chains (e.g. Reliance, D-Mart, McDonald\'s), or online e-commerce platforms. Tasks are automatically pushed to taskers physically near those locations.'
    },
    {
      q: 'What equipment do I need to perform mystery store audits?',
      a: 'All you need is a smartphone with a working camera, GPS location enabled, and an internet connection. No special equipment is required.'
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      <PublicHeader onOpenAuth={openAuth} />

      {/* Hero Banner */}
      <section style={{ background: "linear-gradient(90deg, rgba(9,30,66,0.92) 0%, rgba(9,30,66,0.82) 100%), url('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat", color: '#ffffff', padding: '72px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', padding: '6px 20px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            COMPLETE PLATFORM GUIDE
          </span>
          
          <h1 style={{ fontSize: '44px', margin: '0 0 16px', fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.2 }}>
            How DigiLites Studio Works<br />
            <span style={{ color: '#ffbd36' }}>Simple, Transparent & Rewarding</span>
          </h1>

          <p style={{ fontSize: '16.5px', color: '#cbd5e1', maxWidth: '760px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Whether you want to earn extra cash performing micro-tasks or gain 100% ground visibility for your retail brand, understand our step-by-step workflow.
          </p>

          {/* Interactive Role Switcher */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <button
              onClick={() => setActiveTab('auditors')}
              style={{
                background: activeTab === 'auditors' ? '#0b78ff' : 'transparent',
                color: '#ffffff',
                border: 0,
                padding: '12px 28px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🙋🏻 For Field Auditors & Taskers
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              style={{
                background: activeTab === 'brands' ? '#0b78ff' : 'transparent',
                color: '#ffffff',
                border: 0,
                padding: '12px 28px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🏛️ For Brands & Businesses
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Tab Content */}
      {activeTab === 'auditors' ? (
        <>
          {/* Auditor Workflow Steps */}
          <section style={{ padding: '72px 0', background: '#f8fafc' }}>
            <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  AUDITOR JOURNEY
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px' }}>
                  Earn Cash in 4 Easy Steps
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748b' }}>
                  Turn your free time and store visits into guaranteed earnings.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                  {
                    step: '01',
                    title: 'Sign Up Free',
                    desc: 'Create your free account in 30 seconds. Verify your phone number and basic profile.',
                    color: '#0b78ff'
                  },
                  {
                    step: '02',
                    title: 'Browse Nearby Tasks',
                    desc: 'Explore the map or list view to find store audits, quick surveys, and product review tasks near you.',
                    color: '#10b981'
                  },
                  {
                    step: '03',
                    title: 'Visit & Capture Evidence',
                    desc: 'Follow the simple step-by-step checklist, snap live geotagged photos, and answer questions.',
                    color: '#f59e0b'
                  },
                  {
                    step: '04',
                    title: 'Instant Payout',
                    desc: 'Once approved, task reward is added to your wallet. Transfer directly via UPI or Bank transfer.',
                    color: '#8b5cf6'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.03)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: item.color, background: '#f1f5f9', padding: '4px 12px', borderRadius: '999px', display: 'inline-block', marginBottom: '14px' }}>
                      STEP {item.step}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>{item.title}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                  onClick={() => openAuth('user')}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 0, padding: '16px 36px', borderRadius: '999px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}
                >
                  Start Earning As Auditor Now →
                </button>
              </div>
            </div>
          </section>

          {/* Types of Tasks Breakdown (Using Real Image Cards) */}
          <section style={{ padding: '72px 0', background: '#ffffff' }}>
            <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>
                  What Kind of Tasks Can You Do?
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748b' }}>Choose tasks that fit your lifestyle and schedule.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(2,132,199,0.06)' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" alt="Mystery Store Audits" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#0284c7', color: '#ffffff', padding: '4px 12px', borderRadius: '999px', fontSize: '10.5px', fontWeight: 800 }}>
                      PAYOUT: ₹300 - ₹800 / TASK
                    </span>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Mystery Store Audits</h3>
                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>Visit retail stores, supermarkets, cafes or petrol pumps as an incognito auditor. Verify product display, staff behavior and pricing.</p>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #fecdd3', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(225,29,72,0.06)' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                    <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80" alt="Shop & Product Reviews" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#e11d48', color: '#ffffff', padding: '4px 12px', borderRadius: '999px', fontSize: '10.5px', fontWeight: 800 }}>
                      PAYOUT: ₹200 - ₹500 / TASK
                    </span>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Shop & Product Reviews</h3>
                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>Order or buy featured products from partner brands. Test the items, write verified unboxing reviews, and get full product cost reimbursement plus task reward.</p>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(16,185,129,0.06)' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                    <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80" alt="Quick Mobile Surveys" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#16a34a', color: '#ffffff', padding: '4px 12px', borderRadius: '999px', fontSize: '10.5px', fontWeight: 800 }}>
                      PAYOUT: ₹50 - ₹150 / SURVEY
                    </span>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Quick Mobile Surveys</h3>
                    <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>Answer quick 2–5 minute multiple-choice questions on your phone. Share feedback on product awareness, ad campaigns or service preferences.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Brand Workflow Steps */}
          <section style={{ padding: '72px 0', background: '#f8fafc' }}>
            <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <span style={{ background: '#dbeafe', color: '#0284c7', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  BRAND WORKFLOW
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px' }}>
                  Launch Nationwide Store Inspections in 4 Steps
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748b' }}>
                  Get real-time retail execution analytics without manual fieldwork hassle.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                  { step: '01', title: 'Create Campaign', desc: 'Set up your audit campaign parameters, target store chains, and pincodes.', color: '#0b78ff' },
                  { step: '02', title: 'Design Checklist', desc: 'Add binary questions, mandatory photo slots, price entry fields, and bill checks.', color: '#10b981' },
                  { step: '03', title: 'Geofenced Dispatch', desc: 'Tasks are pushed to 50,000+ nearby verified taskers who execute on-ground checks.', color: '#f59e0b' },
                  { step: '04', title: 'Executive Dashboard', desc: 'View verified EXIF photos, geotagged proof, and downloadable PDF/Excel compliance reports.', color: '#8b5cf6' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.03)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: item.color, background: '#f1f5f9', padding: '4px 12px', borderRadius: '999px', display: 'inline-block', marginBottom: '14px' }}>
                      STEP {item.step}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>{item.title}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                  onClick={() => openAuth('client')}
                  style={{ background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)', color: '#ffffff', border: 0, padding: '16px 36px', borderRadius: '999px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(11,120,255,0.3)' }}
                >
                  Create Brand Account / Schedule Demo →
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FAQ Section */}
      <section style={{ padding: '72px 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ width: 'min(900px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ background: '#eff6ff', color: '#0b78ff', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              GENERAL FAQS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: 0,
                    padding: '18px 24px',
                    textAlign: 'left',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '18px', color: '#0b78ff' }}>{activeFaq === idx ? '−' : '+'}</span>
                </button>
                {activeFaq === idx && (
                  <div style={{ padding: '16px 24px 20px', background: '#ffffff', fontSize: '14px', color: '#475569', lineHeight: 1.6, borderTop: '1px solid #e2e8f0' }}>
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
