import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import AuthModal from '../components/AuthModal';

export default function ForBrands() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('client');
  const [activeFaq, setActiveFaq] = useState(null);

  const openAuth = (role = 'client') => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const brandFaqs = [
    {
      q: 'How fast can our retail audit campaign be launched nationwide?',
      a: 'Once your campaign parameters and location targets are defined, tasks go live on the DigiLites network within 2 hours. Geofenced taskers in target pincodes receive instant mobile alerts and can complete store audits on the same day.'
    },
    {
      q: 'How does DigiLites ensure audit photo proof is authentic and unmanipulated?',
      a: 'Every photo submission undergoes automated 3-tier validation: 1) Real-time GPS Geofencing (tasker must be inside store boundary), 2) EXIF Timestamping & Metadata lock (prevents gallery uploads or old photos), and 3) AI-powered duplicate & image manipulation check.'
    },
    {
      q: 'Can we specify customized questionnaire checklists and mandatory photo requirements?',
      a: 'Yes! Our intuitive Campaign Builder lets you define custom binary checks (Yes/No), multiple-choice questions, mandatory photo slots (e.g. storefront, main display shelf, promo poster), price entry fields, and bill receipt uploads.'
    },
    {
      q: 'What is the pricing structure for multi-city enterprise audits?',
      a: 'We offer flexible pay-per-verified-audit pricing as well as monthly enterprise subscription plans. You only pay for audits that meet 100% of your quality compliance standards. Contact our team for custom volume tiering.'
    },
    {
      q: 'What format do we receive the audit reports and analytics in?',
      a: 'You gain access to a real-time executive dashboard where you can filter live store results by city, chain, or auditor score. You can also export raw CSV data, Excel reports, and automated presentation-ready PDF summaries.'
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      <PublicHeader onOpenAuth={openAuth} />

      {/* Hero Section */}
      <section style={{ background: "linear-gradient(90deg, rgba(9,30,66,0.92) 0%, rgba(9,30,66,0.82) 100%), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat", color: '#ffffff', padding: '72px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(11,120,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', padding: '6px 20px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            ENTERPRISE BRAND INTELLIGENCE PLATFORM
          </span>
          
          <h1 style={{ fontSize: '44px', margin: '0 0 16px', fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.2 }}>
            Gain Real-Time Ground Visibility<br />
            <span style={{ color: '#ffbd36' }}>Across 1,000+ Cities Nationwide</span>
          </h1>

          <p style={{ fontSize: '16.5px', color: '#cbd5e1', maxWidth: '760px', margin: '0 auto 32px', lineHeight: 1.6, fontWeight: 400 }}>
            Monitor planogram compliance, track competitor pricing, evaluate store hygiene, and audit product availability through 50,000+ verified geofenced mystery auditors.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openAuth('client')}
              style={{
                background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)',
                color: '#ffffff',
                border: 0,
                padding: '16px 36px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(11,120,255,0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Partner With Us / Launch Campaign</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <button
              onClick={() => openAuth('client')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                padding: '16px 32px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-calendar-check" style={{ color: '#ffbd36' }}></i>
              <span>Schedule Live Demo</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '48px', background: 'rgba(255,255,255,0.06)', padding: '20px 24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <b style={{ fontSize: '26px', color: '#ffffff', display: 'block', fontWeight: 800 }}>50,000+</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>On-Demand Taskers</span>
            </div>
            <div>
              <b style={{ fontSize: '26px', color: '#ffbd36', display: 'block', fontWeight: 800 }}>&lt; 2 Hours</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>Campaign Activation</span>
            </div>
            <div>
              <b style={{ fontSize: '26px', color: '#38bdf8', display: 'block', fontWeight: 800 }}>100% EXIF</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>Geofenced Validation</span>
            </div>
            <div>
              <b style={{ fontSize: '26px', color: '#4ade80', display: 'block', fontWeight: 800 }}>1,000+</b>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>Trusted Brand Clients</span>
            </div>
          </div>

        </div>
      </section>

      {/* Enterprise Capabilities Grid (Image Cards Instead of Icons) */}
      <section style={{ padding: '72px 0 60px', background: '#f8fafc' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ background: '#dbeafe', color: '#0284c7', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              RETAIL SOLUTIONS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px', letterSpacing: '-0.6px' }}>
              Comprehensive Enterprise Audit Capabilities
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              From physical supermarket shelves to e-commerce product reviews, get verified proof of execution everywhere your brand sells.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            {[
              {
                img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
                tag: 'STORE INSPECTIONS',
                title: 'Planogram & Shelf Compliance',
                desc: 'Verify product placement, shelf space allocation, POP display compliance, and out-of-stock rates in retail outlets.'
              },
              {
                img: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=600&q=80',
                tag: 'MYSTERY SHOPPING',
                title: 'Customer Experience & Staff Audit',
                desc: 'Evaluate store staff recommendation rate, product knowledge, billing speed, customer hospitality, and store cleanliness.'
              },
              {
                img: 'https://images.unsplash.com/photo-1556742049-0a67e008d641?auto=format&fit=crop&w=600&q=80',
                tag: 'MARKET INTELLIGENCE',
                title: 'Price Parity & Competitor Check',
                desc: 'Track competitor pricing, seasonal discounts, bundling offers, and distributor margin variations in real time.'
              },
              {
                img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80',
                tag: 'PROOF SECURITY',
                title: 'Automated GPS & EXIF Geofencing',
                desc: 'Anti-fraud system verifies exact geofence location, camera metadata, timestamp, and device integrity for every submission.'
              },
              {
                img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
                tag: 'EXECUTIVE ANALYTICS',
                title: 'Real-Time Analytics & Report Builder',
                desc: 'Access live executive dashboards, generate city-wise compliance scores, and download presentation-ready PDF/Excel reports.'
              },
              {
                img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
                tag: 'MANAGED OPERATIONS',
                title: 'Dedicated Campaign Operations',
                desc: 'End-to-end campaign design, auditor training, quality control filtering, and custom API integration managed by our experts.'
              }
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '9.5px', fontWeight: 800, backdropFilter: 'blur(4px)', letterSpacing: '0.5px' }}>
                    {item.tag}
                  </span>
                </div>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a', lineHeight: 1.3 }}>{item.title}</h3>
                    <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Brands Launch Campaigns (4-Step Pipeline) */}
      <section style={{ padding: '72px 0', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              CAMPAIGN PIPELINE
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px', letterSpacing: '-0.6px' }}>
              How Brands Launch & Manage Audits in 4 Steps
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Launch multi-city store inspections in minutes without hiring expensive manual auditing teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { step: '01', title: 'Define Campaign & Locations', desc: 'Select target cities, pincodes, retail store chains, and audit sample size.', color: '#0b78ff' },
              { step: '02', title: 'Build Audit Criteria', desc: 'Set binary checks, mandatory photo requirements, pricing inputs, and bill receipt checks.', color: '#10b981' },
              { step: '03', title: 'AI Geofenced Dispatch', desc: 'Tasks are instantly routed to nearby verified taskers who visit stores and capture evidence.', color: '#f59e0b' },
              { step: '04', title: 'Live Dashboard & Insights', desc: 'Review validated photo proof, auditor ratings, and executive analytics reports in real-time.', color: '#8b5cf6' }
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', position: 'relative' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: item.color, background: '#ffffff', border: `1px solid ${item.color}`, padding: '3px 10px', borderRadius: '999px', display: 'inline-block', marginBottom: '14px' }}>
                  STEP {item.step}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Verification Engine Section */}
      <section style={{ padding: '72px 0', background: '#091e42', color: '#ffffff' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
                🛡️ ZERO-FRAUD GUARANTEE
              </span>
              <h2 style={{ fontSize: '34px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.25, letterSpacing: '-0.6px' }}>
                Automated 3-Tier Proof & Anti-Spoof Verification
              </h2>
              <p style={{ fontSize: '14.5px', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '28px' }}>
                Never waste budget on fake reports or stolen gallery images. Every audit submitted through DigiLites Studio undergoes rigorous automated verification before reaching your dashboard.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', display: 'grid', placeItems: 'center', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>
                    <i className="fa-solid fa-location-crosshairs"></i>
                  </div>
                  <div>
                    <b style={{ fontSize: '15px', display: 'block', color: '#ffffff', marginBottom: '2px' }}>GPS Geofencing Lock</b>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Auditor app requires live GPS location matching the physical store coordinates within 50 meters.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(250,204,21,0.2)', color: '#facc15', display: 'grid', placeItems: 'center', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </div>
                  <div>
                    <b style={{ fontSize: '15px', display: 'block', color: '#ffffff', marginBottom: '2px' }}>Camera Metadata & Timestamping</b>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Photos must be taken directly via camera inside the app — gallery uploads are strictly disabled.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(74,222,128,0.2)', color: '#4ade80', display: 'grid', placeItems: 'center', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>
                    <i className="fa-solid fa-brain"></i>
                  </div>
                  <div>
                    <b style={{ fontSize: '15px', display: 'block', color: '#ffffff', marginBottom: '2px' }}>AI Image Duplicate Check</b>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Machine vision algorithm detects recycled, stolen or manipulated photos across taskers.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup Card */}
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', color: '#0f172a', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <b style={{ fontSize: '15px', color: '#0f172a' }}>Live Campaign Verification Console</b>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 800 }}>
                  ● 99.4% Verified Accuracy
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ display: 'block', color: '#0f172a' }}>Reliance Smart Point - Mumbai</b>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>📍 Geofence Match (12m) · Timestamp 14:32</span>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '10px' }}>PASSED</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ display: 'block', color: '#0f172a' }}>Star Bazaar - Bengaluru</b>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>📍 Geofence Match (24m) · Timestamp 14:28</span>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '10px' }}>PASSED</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ display: 'block', color: '#0f172a' }}>DMart - Delhi NCR</b>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>📍 Geofence Match (8m) · Timestamp 14:15</span>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '10px' }}>PASSED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions & Use Cases (Image Cards Instead of Emojis) */}
      <section style={{ padding: '72px 0', background: '#f8fafc' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              INDUSTRIES WE SERVE
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px', letterSpacing: '-0.6px' }}>
              Tailored Audit Solutions for Every Sector
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Whether you manage a national FMCG brand or a multi-chain QSR restaurant, our ground intelligence network adapts to your business goals.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              {
                title: 'FMCG & Supermarkets',
                desc: 'Planogram checks, end-cap display verification, out-of-stock alerts, and competitor price tracking.',
                img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
              },
              {
                title: 'QSR & Restaurant Chains',
                desc: 'Hygiene & food safety checks, billing speed audit, mystery dining, and staff service scoring.',
                img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
              },
              {
                title: 'Consumer Durables & Electronics',
                desc: 'Demo counter availability, promoter recommendation rate, and warranty registration verification.',
                img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80'
              },
              {
                title: 'Banking, Telecom & Financials',
                desc: 'Branch branding audit, SIM activation agent checks, ATM uptime, and form compliance.',
                img: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=600&q=80'
              },
              {
                title: 'Pharmacies & Healthcare',
                desc: 'Medicine availability audit, cold storage compliance, pharmacist recommendation checks.',
                img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=600&q=80'
              },
              {
                title: 'E-Commerce & D2C Brands',
                desc: 'Product sample unboxing reviews, verified customer feedback, and delivery speed testing.',
                img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
              }
            ].map((ind, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '150px', overflow: 'hidden' }}>
                  <img src={ind.img} alt={ind.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '22px', flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>{ind.title}</h3>
                  <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand FAQ Section */}
      <section style={{ padding: '72px 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ width: 'min(900px, calc(100% - 40px))', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ background: '#eff6ff', color: '#0b78ff', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              ENTERPRISE FAQS
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0 8px' }}>
              Frequently Asked Questions for Brands
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {brandFaqs.map((faq, idx) => (
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

      {/* Bottom CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0b78ff 0%, #1763eb 100%)', color: '#ffffff', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 14px' }}>
            Ready to Gain 100% Ground Visibility?
          </h2>
          <p style={{ fontSize: '16px', color: '#dbeafe', maxWidth: '640px', margin: '0 auto 28px' }}>
            Join 1,000+ top retail brands and launch your first geotagged mystery audit campaign today.
          </p>
          <button
            onClick={() => openAuth('client')}
            style={{
              background: '#ffffff',
              color: '#0b78ff',
              border: 0,
              padding: '16px 40px',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            Create Brand Partner Account →
          </button>
        </div>
      </section>

      <PublicFooter />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole={authRole} />
    </div>
  );
}
