import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Bell, CheckCircle2, Wallet, AlertCircle, MapPin, Check, AlertTriangle } from 'lucide-react';
import { showToast } from '../utils/swal';
import { useNavigate } from 'react-router-dom';
import { getPendingRevisions } from '../utils/notifications';

export default function Notifications() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);

  const loadNotifications = () => {
    const cached = JSON.parse(localStorage.getItem('digitasker_user_notifications') || '[]');
    const pendingRevisions = getPendingRevisions();

    const revNotifs = pendingRevisions.map(p => ({
      id: `rev-${p.subId}`,
      title: `⚠️ QC Revision Requested: ${p.subId}`,
      desc: `Admin QC Feedback: "${p.note}". Click to re-submit updated evidence.`,
      time: 'Action Required',
      unread: true,
      color: 'red',
      icon: AlertTriangle,
      link: `/user/tasks/${p.id}/complete`
    }));

    const combined = [...revNotifs];
    cached.forEach(c => {
      if (!combined.some(item => item.id === c.id)) combined.push(c);
    });

    const defaultSamples = [
      { id: 1, title: 'New Task Assignment', desc: 'Samsung Retail Audit TSK-301 assigned to your region.', time: '10 mins ago', unread: true, color: 'blue', icon: Bell },
      { id: 2, title: 'Payout Approved 💸', desc: '₹2,000 processed for direct transfer to your UPI.', time: '1 hour ago', unread: true, color: 'green', icon: Wallet },
      { id: 3, title: 'Level 3 KYC Verified 🛡️', desc: 'Identity documents verified. Daily withdrawal limit ₹50,000.', time: 'Yesterday', unread: false, color: 'purple', icon: CheckCircle2 }
    ];

    defaultSamples.forEach(d => {
      if (!combined.some(item => item.id === d.id)) combined.push(d);
    });

    setNotes(combined);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAll = () => {
    const updated = notes.map(n => ({ ...n, unread: false }));
    setNotes(updated);
    localStorage.setItem('digitasker_user_notifications', JSON.stringify(updated));
    showToast('All notifications marked as read');
  };

  const handleToggleRead = (id, e) => {
    e.stopPropagation();
    const updated = notes.map(n => n.id === id ? { ...n, unread: !n.unread } : n);
    setNotes(updated);
    localStorage.setItem('digitasker_user_notifications', JSON.stringify(updated));
  };

  return (
    <AppLayout role='user' title='Notifications'>
      <div className='card'>
        <div className='sectionTitle'>
          <h2>Recent activity</h2>
          {notes.length > 0 && (
            <button className='linkBtn' onClick={handleMarkAll}>Mark all as read</button>
          )}
        </div>

        <div className='notificationList'>
          {notes.length === 0 ? (
            <div style={{ padding: '40px 10px', textAlign: 'center', color: '#64748b' }}>
              <Bell size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No notifications right now.</p>
              <small style={{ fontSize: '12px', color: '#94a3b8' }}>You're all caught up! Task updates and payout alerts will appear here.</small>
            </div>
          ) : (
            notes.map(n => {
              const Icon = n.icon || Bell;
              return (
                <div 
                  className={`notificationItem ${n.unread ? 'unread' : ''}`} 
                  key={n.id}
                  onClick={() => {
                    if (n.link) navigate(n.link);
                  }}
                  style={{ cursor: n.link ? 'pointer' : 'default' }}
                >
                  <div className={`noticeIcon ${n.color || 'blue'}`}>
                    <Icon size={18} />
                  </div>
                  <div className='grow'>
                    <b>{n.title}</b>
                    <p>{n.desc}</p>
                    <span>{n.time}</span>
                  </div>
                  <button 
                    className='iconBtn' 
                    onClick={(e) => handleToggleRead(n.id, e)}
                    title={n.unread ? 'Mark as read' : 'Mark as unread'}
                  >
                    <Check size={15} color={n.unread ? '#0066ff' : '#94a3b8'} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
