import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import AuthModal from '../components/AuthModal';

export default function ForAuditors() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('user');
  const [activeFaq, setActiveFaq] = useState(null);

  const openAuth = () => {
    setAuthRole('user');
    setShowAuthModal(true);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const auditorFaqs = [
    {
      q: 'Do I need prior mystery shopping experience to join?',
      a: 'Not at all! Every task comes with simple, step-by-step instructions. Our in-app guide walks you through what photos to take and what questions to answer.'
    },
    {
      q: 'How much can I earn per day on DigiLites Studio?',
      a: 'Earnings depend on your location and the number of tasks you complete. Dedicated taskers complete 3–5 store audits daily and earn between ₹800 to ₹2,500 per day.'
    },
    {
      q: 'Is there a minimum withdrawal amount for wallet earnings?',
      a: 'The minimum withdrawal limit is just ₹100. Once your wallet balance reaches ₹100, you can request an instant UPI or bank transfer.'
    },
    {
      q: 'What happens if my audit submission is rejected?',
      a: 'If a photo is blurry or missing a required item, our support team will notify you with the reason and allow you to re-submit or correct the evidence where possible.'
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      <PublicHeader onOpenAuth={openAuth} />

      {/* Hero Section */}
      <section style={{ background: "linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.82) 100%), url('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat", color: '#ffffff', padding: '72px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(244,63,94,0.18)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '6px 20px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            FIELD AUDITOR & TASKER COMMUNITY
          </span>
          
          <h1 style={{ fontSize: '44px', margin: '0 0 16px', fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.2 }}>
            Turn Everyday City Walks & Shopping<br />
            <span style={{ color: '#ff416c' }}>Into Instant Cash Income</span>
          </h1>

          <p style={{ fontSize: '16.5px', color: '#cbd5e1', maxWidth: '760px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Visit local stores, audit product displays, write verified reviews, and answer quick surveys on your phone. Work whenever you want and get paid directly to your UPI account.
          </p>

          <button
            onClick={openAuth}
            style={{
              background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
              color: '#ffffff',
              border: 0,
              padding: '16px 40px',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255,65,108,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>Sign Up As Auditor Free</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '48px', background: 'rgba(255,255,255,0.06)', padding: '20px 24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <b style={{ fontSize: '26px', color: '#ffffff', display: 'block', fontWeight: 800 }}>50,000+</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>Active Taskers</span>
            </div>
            <div>
              <b style={{ fontSize: '26px', color: '#4ade80', display: 'block', fontWeight: 800 }}>₹10 Cr+</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>Paid Out To Date</span>
            </div>
            <div>
              <b style={{ fontSize: '26px', color: '#38bdf8', display: 'block', fontWeight: 800 }}>Instant UPI</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>24-Hour Payouts</span>
            </div>
            <div>
              <b style={{ fontSize: '26px', color: '#ffbd36', display: 'block', fontWeight: 800 }}>4.8 ★★★★★</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>App Store Rating</span>
            </div>
          </div>

        </div>
      </section>

      {/* Why Taskers Love DigiLites (Using Images Instead of Icons) */}
      <section style={{ padding: '72px 0', background: '#f8fafc' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ background: '#ffe4e6', color: '#e11d48', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              KEY ADVANTAGES
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px' }}>
              Why Over 50,000 People Audit With Us
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" alt="Total Work Freedom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '24px', flex: 1 }}>
                <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Total Work Freedom</h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>No fixed shifts or mandatory hours. Pick up audit tasks near your home, college or workplace whenever you have spare time.</p>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80" alt="Instant Wallet Payouts" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '24px', flex: 1 }}>
                <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Instant Wallet Payouts</h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>Withdraw your wallet earnings directly via GPay, PhonePe, Paytm, or direct Bank transfer with 100% payment guarantee.</p>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80" alt="Interactive GPS Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '24px', flex: 1 }}>
                <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>Interactive GPS Map</h3>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>Use our in-app map view to discover live tasks at supermarkets, cafes, banks, and pharmacies right in your neighborhood.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auditor Leveling & Tier System */}
      <section style={{ padding: '72px 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              LEVEL UP YOUR EARNINGS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px' }}>
              Auditor Rank & Reward Tiers
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748b' }}>
              Complete high-quality audits to unlock higher payouts, exclusive VIP tasks, and bonus reward multipliers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { level: 'BRONZE', title: 'New Tasker', tasks: '1–10 Audits', payout: 'Standard Payouts', color: '#b45309', bg: '#fef3c7' },
              { level: 'SILVER', title: 'Verified Auditor', tasks: '10–50 Audits', payout: '+5% Bonus Payout', color: '#64748b', bg: '#f1f5f9' },
              { level: 'GOLD', title: 'Pro Tasker', tasks: '50–150 Audits', payout: '+12% Bonus + VIP Tasks', color: '#eab308', bg: '#fef9c3' },
              { level: 'DIAMOND', title: 'Master Auditor', tasks: '150+ Audits', payout: '+20% Bonus + Dedicated Manager', color: '#0284c7', bg: '#e0f2fe' }
            ].map((tier, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: `1px solid ${tier.color}`, borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
                <span style={{ background: tier.bg, color: tier.color, padding: '4px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-block', marginBottom: '12px' }}>
                  {tier.level} TIER
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>{tier.title}</h3>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px' }}>{tier.tasks}</span>
                <b style={{ fontSize: '13px', color: tier.color, display: 'block' }}>{tier.payout}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auditor FAQ Section */}
      <section style={{ padding: '72px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ width: 'min(900px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ background: '#eff6ff', color: '#0b78ff', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              TASKER FAQS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px' }}>
              Frequently Asked Questions for Taskers
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditorFaqs.map((faq, idx) => (
              <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
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
                  <div style={{ padding: '16px 24px 20px', background: '#f8fafc', fontSize: '14px', color: '#475569', lineHeight: 1.6, borderTop: '1px solid #e2e8f0' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', color: '#ffffff', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 14px' }}>
            Ready to Start Earning Cash Everyday?
          </h2>
          <p style={{ fontSize: '16px', color: '#ffe4e6', maxWidth: '640px', margin: '0 auto 28px' }}>
            Join 50,000+ verified taskers across India and claim your first paid audit task in minutes.
          </p>
          <button
            onClick={openAuth}
            style={{
              background: '#ffffff',
              color: '#e11d48',
              border: 0,
              padding: '16px 40px',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            Create Free Auditor Account →
          </button>
        </div>
      </section>

      <PublicFooter />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole={authRole} />
    </div>
  );
}
