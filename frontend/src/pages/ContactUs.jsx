import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import AuthModal from '../components/AuthModal';
import { showSuccess, showToast } from '../utils/swal';

export default function ContactUs() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('vendor');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Brand Partnership', message: '' });

  const openAuth = (role = 'vendor') => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in your name, email, and message.', 'error');
      return;
    }
    showSuccess('Message Sent!', `Thank you ${form.name}. Our enterprise team will contact you within 2 business hours.`);
    setForm({ name: '', email: '', phone: '', subject: 'Brand Partnership', message: '' });
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      <PublicHeader onOpenAuth={openAuth} />

      <section style={{ background: "linear-gradient(90deg, rgba(13,32,60,0.92) 0%, rgba(13,32,60,0.78) 100%), url('https://images.unsplash.com/photo-1556742049-0a67daf4005a?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat", color: '#ffffff', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.12)', color: '#38bdf8', padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            GET IN TOUCH
          </span>
          <h1 style={{ fontSize: '42px', margin: '16px 0 12px', fontWeight: 800 }}>
            We'd Love to Hear From You
          </h1>
          <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '650px', margin: '0 auto' }}>
            Have questions about launching an audit campaign, auditor payouts, or custom enterprise solutions? Contact our team.
          </p>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
          {/* Info Cards */}
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 20px' }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '14px' }}>
                <i className="fa-solid fa-envelope" style={{ fontSize: '22px', color: '#0b78ff', marginTop: '2px' }}></i>
                <div>
                  <b style={{ display: 'block', fontSize: '15px' }}>Email Support</b>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>support@digilitestudio.com</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '14px' }}>
                <i className="fa-solid fa-phone" style={{ fontSize: '22px', color: '#10b981', marginTop: '2px' }}></i>
                <div>
                  <b style={{ display: 'block', fontSize: '15px' }}>Direct Phone / Support</b>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>+91 7360002233 (Mon - Sat, 9 AM - 7 PM)</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '14px' }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: '22px', color: '#f59e0b', marginTop: '2px' }}></i>
                <div>
                  <b style={{ display: 'block', fontSize: '15px' }}>Corporate Headquarters</b>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>DigiLites Studio Technologies, Cyber City, Phase III, Gurugram, Haryana 122002</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 20px' }}>Send Us A Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Full Name *</label>
                <input
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Phone Number</label>
                  <input
                    placeholder="+91 7360002233"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                >
                  <option>Brand Partnership / Enterprise Inquiry</option>
                  <option>Field Auditor Payout Support</option>
                  <option>Vendor Panel Onboarding</option>
                  <option>Other General Inquiry</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Message *</label>
                <textarea
                  rows="4"
                  placeholder="Tell us about your campaign needs or question..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit' }}
                ></textarea>
              </div>
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg,#0b78ff,#1763eb)', color: '#fff', padding: '14px', border: 0, borderRadius: '10px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 18px rgba(11,120,255,0.25)' }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <PublicFooter />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole={authRole} />
    </div>
  );
}
