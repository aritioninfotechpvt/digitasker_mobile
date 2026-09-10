import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import AuthModal from '../components/AuthModal';

export default function AboutUs() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('vendor');

  const openAuth = (role = 'vendor') => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      <PublicHeader onOpenAuth={openAuth} />

      {/* Hero Banner */}
      <section style={{ background: "linear-gradient(90deg, rgba(13,32,60,0.92) 0%, rgba(13,32,60,0.78) 100%), url('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat", color: '#ffffff', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.12)', color: '#38bdf8', padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ABOUT DIGILITES STUDIO
          </span>
          <h1 style={{ fontSize: '42px', margin: '16px 0 12px', fontWeight: 800 }}>
            Building Brands That Stand Out Through Real-Time Intelligence
          </h1>
          <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            DigiLites Studio connects national retail brands, FMCG conglomerates, and regional businesses with over 50,000 verified field taskers for instant store audits, compliance tracking, and market research.
          </p>
        </div>
      </section>

      {/* Stats Strip */}
      <section style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '36px 0' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
          <div>
            <b style={{ fontSize: '32px', color: '#0b78ff', display: 'block' }}>50,000+</b>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Verified Field Taskers</span>
          </div>
          <div>
            <b style={{ fontSize: '32px', color: '#10b981', display: 'block' }}>1,000+</b>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Brand Partners</span>
          </div>
          <div>
            <b style={{ fontSize: '32px', color: '#f59e0b', display: 'block' }}>100,000+</b>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Audits Completed</span>
          </div>
          <div>
            <b style={{ fontSize: '32px', color: '#8b5cf6', display: 'block' }}>99.4%</b>
            <span style={{ fontSize: '13px', color: '#64748b' }}>GPS Verification Accuracy</span>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '60px 0' }}>
        <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 16px' }}>Our Mission</h2>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '20px' }}>
              We believe that on-ground visibility shouldn't take weeks of manual reporting. Our platform empowers everyday shoppers and mystery taskers to capture real-time photo proof, stock counts, and store observations, transforming them into actionable analytics for brand decision-makers.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', flex: 1 }}>
                <b style={{ display: 'block', color: '#0b78ff', fontSize: '16px', marginBottom: '6px' }}>Real Impact</b>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Empowering thousands of taskers with flexible micro-earnings.</span>
              </div>
              <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '12px', flex: 1 }}>
                <b style={{ display: 'block', color: '#10b981', fontSize: '16px', marginBottom: '6px' }}>Total Transparency</b>
                <span style={{ fontSize: '13px', color: '#64748b' }}>EXIF photo validation & automated GPS geofencing.</span>
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="DigiLites Team"
              style={{ width: '100%', borderRadius: '20px', boxShadow: '0 14px 40px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
      </section>

      <PublicFooter />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialRole={authRole} />
    </div>
  );
}
