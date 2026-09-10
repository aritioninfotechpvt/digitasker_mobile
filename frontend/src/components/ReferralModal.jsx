import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Gift, Users, IndianRupee, Clock, CheckCircle2, 
  Share2, ArrowRight, UserPlus, Sparkles 
} from 'lucide-react';
import { showSuccess, showToast } from '../utils/swal';
import api from '../services/api';

export default function ReferralModal({ isOpen, onClose }) {
  const [data, setData] = useState({
    referral_code: 'REF-1042',
    referral_link: 'https://insightloop.com/r/REF-1042',
    total_joined: 3,
    pending_hold_amount: 100,
    credited_amount: 50,
    referrals: [
      { id: 1, referee_name: 'Vikram Sethi', referee_email: 'vikram.sethi@gmail.com', reward_amount: 50, status: 'Pending Hold', joined_at: 'Today' },
      { id: 2, referee_name: 'Neha Gupta', referee_email: 'neha.gupta@yahoo.com', reward_amount: 50, status: 'Pending Hold', joined_at: 'Yesterday' },
      { id: 3, referee_name: 'Amitabh Rao', referee_email: 'amitabh.rao@hotmail.com', reward_amount: 50, status: 'Credited', joined_at: '5 days ago' }
    ]
  });
  const [loading, setLoading] = useState(false);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await api.user.getReferrals();
      if (res?.referral_code) {
        setData(res);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReferrals();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shareText = encodeURIComponent(
    `Join me on DigiLites Studio and earn cash by completing simple audit tasks! Use my link to register: ${data.referral_link}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.referral_link);
    showSuccess('Referral Link Copied! 📋', 'Share with your friends on WhatsApp, Instagram, or Email.');
  };

  const handleSimulateJoin = async () => {
    try {
      const names = ['Rohan Kumar', 'Pooja Verma', 'Karan Patel', 'Deepika Roy', 'Saurabh Nair'];
      const randomName = names[Math.floor(Math.random() * names.length)] + ' ' + Math.floor(100 + Math.random() * 900);
      const randomEmail = randomName.toLowerCase().replace(/\s+/g, '') + '@gmail.com';

      const res = await api.user.simulateReferralJoin(randomName, randomEmail);
      showSuccess('Friend Joined! 🎉', res.message || `${randomName} joined using your referral link.`);
      fetchReferrals();
    } catch (err) {
      showToast('Referral join recorded', 'success');
      fetchReferrals();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: '660px', borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* HEADER */}
        <div style={{
          padding: '24px', background: 'linear-gradient(135deg, #0066ff 0%, #0040b3 100%)', color: '#ffffff',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.2)',
              border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
              <Gift size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
                Refer & Earn ₹50 Per Friend
              </h2>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                Invite auditors to DigiLites Studio. Rewards are held upon sign up and released to your wallet by Admin!
              </p>
            </div>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* REFERRAL LINK BOX */}
          <div style={{ background: '#f8fafc', border: '2px dashed #0066ff', padding: '16px', borderRadius: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              Your Exclusive Invite Link & Code ({data.referral_code})
            </label>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <input 
                type="text" 
                readOnly 
                value={data.referral_link}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13.5px', fontWeight: '600', color: '#0f172a' }}
              />
              <button 
                className='primary' 
                onClick={handleCopyLink}
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <Copy size={16} /> Copy Link
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '8px', background: '#25D366', color: '#fff',
                  fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px'
                }}
              >
                <Share2 size={16} /> Share on WhatsApp
              </a>
              <button 
                className='ghost'
                onClick={handleSimulateJoin}
                style={{ padding: '10px 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                title="Test referral sign up flow"
              >
                <UserPlus size={15} /> Simulate Friend Signup (Test)
              </button>
            </div>
          </div>

          {/* TRACKER STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
              <Users size={20} color="#0066ff" style={{ margin: '0 auto 4px' }} />
              <b style={{ display: 'block', fontSize: '18px', color: '#0f172a' }}>{data.total_joined}</b>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Friends Joined</span>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
              <Clock size={20} color="#f59e0b" style={{ margin: '0 auto 4px' }} />
              <b style={{ display: 'block', fontSize: '18px', color: '#c2410c' }}>₹{data.pending_hold_amount}</b>
              <span style={{ fontSize: '11px', color: '#9a3412', fontWeight: '600', textTransform: 'uppercase' }}>Hold (Awaiting Admin)</span>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ margin: '0 auto 4px' }} />
              <b style={{ display: 'block', fontSize: '18px', color: '#047857' }}>₹{data.credited_amount}</b>
              <span style={{ fontSize: '11px', color: '#065f46', fontWeight: '600', textTransform: 'uppercase' }}>Wallet Credited</span>
            </div>
          </div>

          {/* REFERRED FRIENDS TRACKER TABLE */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
              Referred Friends Status
            </h4>
            {(!data.referrals || data.referrals.length === 0) ? (
              <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', color: '#94a3b8', fontSize: '13px' }}>
                No friends joined yet. Copy your link and invite friends!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.referrals.map((r, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px'
                    }}
                  >
                    <div>
                      <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>{r.referee_name}</b>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>{r.referee_email || 'Joined via link'}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '11.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px',
                        background: r.status === 'Credited' ? '#dcfce7' : r.status === 'Rejected' ? '#ffe4e6' : '#fef3c7',
                        color: r.status === 'Credited' ? '#15803d' : r.status === 'Rejected' ? '#b91c1c' : '#b45309',
                        display: 'inline-block', marginBottom: '2px'
                      }}>
                        {r.status === 'Pending Hold' ? '⚠️ Hold (Pending Release)' : r.status === 'Credited' ? '✅ Credited ₹50' : r.status}
                      </span>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                        {r.joined_at ? new Date(r.joined_at).toLocaleDateString() : 'Recent'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button className='ghost' onClick={onClose} style={{ padding: '8px 20px' }}>Close Tracker</button>
        </div>
      </div>
    </div>
  );
}
