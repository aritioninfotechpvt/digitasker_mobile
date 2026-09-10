import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Stat, Card, SectionTitle, Badge } from '../components/ui';
import { ClipboardList, Clock3, ShieldCheck, Wallet as W, Globe, MapPin, Lock, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showConfirm } from '../utils/swal';
import api from '../services/api';
import { currentUser } from '../data/dummy';
import KycBanner from '../components/KycBanner';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('insightloop_user');
    return cached ? JSON.parse(cached) : { name: 'Auditor' };
  });

  const [kycStatusState, setKycStatusState] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
      return p.kycStatus || currentUser.kyc || 'Pending';
    } catch(e) {
      return currentUser.kyc || 'Pending';
    }
  });

  const isKycVerified = kycStatusState === 'Verified';

  const [taskList, setTaskList] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    in_progress: 0,
    under_review: 0,
    balance: '₹0'
  });

  useEffect(() => {
    const customTasks = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]').map(t => ({
      id: t.id,
      title: t.title,
      brand: t.brand || 'DigiLites Partner',
      category: t.category || 'Field Audit',
      country: 'India',
      countryFlag: '🇮🇳',
      platform: 'Physical / Digital',
      actionType: t.category || 'Audit',
      city: t.city || 'Chandigarh, NCR',
      distance: '1.2 km',
      reward: parseFloat(t.reward) || 350,
      duration: t.duration || '20 mins',
      slots: parseInt(t.slots) || 50,
      status: 'Available',
      startDate: t.startDate || '2026-09-01',
      endDate: t.endDate || '2026-09-30',
      image: t.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      eligibility: ['Country: India 🇮🇳', 'KYC Verified']
    }));

    api.user.getDashboard()
      .then(res => {
        if (res.user) setUser(res.user);
        if (res.wallet) setStats(prev => ({ ...prev, balance: `₹${res.wallet.balance}` }));

        const apiTasks = (res.active_tasks || []).map(t => ({
          id: t.id,
          title: t.title,
          brand: t.brand || 'Verified Brand',
          category: t.category || t.type || 'Field Audit',
          country: 'India',
          countryFlag: '🇮🇳',
          platform: 'Physical Outlet',
          actionType: t.category || t.type || 'Audit',
          city: t.location || 'Pan-India',
          distance: '1.5 km',
          reward: parseFloat(t.reward_per_task) || 0,
          duration: t.duration || '20 mins',
          slots: (t.target_quota || 1) - (t.completed_count || 0),
          status: 'Available',
          startDate: t.startDate || '2026-09-01',
          endDate: t.endDate || '2026-09-30',
          image: t.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          eligibility: ['Country: India 🇮🇳', 'KYC Verified']
        }));

        const combined = [...apiTasks];
        customTasks.forEach(ct => {
          if (!combined.some(at => String(at.id) === String(ct.id))) {
            combined.push(ct);
          }
        });

        setTaskList(combined.length > 0 ? combined : customTasks);
        setStats(prev => ({
          ...prev,
          available: combined.length || res.stats?.available || 0,
          in_progress: res.stats?.in_progress || 0,
          under_review: res.stats?.under_review || 0
        }));
      })
      .catch(() => {
        setTaskList(customTasks);
        setStats(prev => ({ ...prev, available: customTasks.length }));
      });
  }, []);

  const handleSpecialPromo = () => {
    showSuccess('Special Weekend Tasks Active!', 'Earn 1.5x rewards on retail and restaurant audits completed this weekend.');
    navigate('/user/find-tasks');
  };

  const handleTaskClick = (e, taskId) => {
    if (!isKycVerified) {
      e.preventDefault();
      showConfirm(
        'KYC Verification Required 🔒',
        'Your KYC status is currently pending. Please complete your KYC verification in your profile to unblur and view tasks.'
      ).then(confirmed => {
        if (confirmed) navigate('/user/profile');
      });
    }
  };

  return (
    <AppLayout title={`Good Morning, ${(user.name || 'Auditor').split(' ')[0]} 👋`}>
      {/* Non-KYC Alert Banner */}
      {!isKycVerified && (
        <KycBanner 
          kycStatus={kycStatusState} 
          onStatusChange={(newStatus) => setKycStatusState(newStatus)}
        />
      )}

      <div className='statsGrid'>
        <Stat label='Available Tasks' value={stats.available.toString()} icon={<ClipboardList />} />
        <Stat label='In Progress' value={stats.in_progress.toString()} icon={<Clock3 />} />
        <Stat label='Under Review' value={stats.under_review.toString()} icon={<ShieldCheck />} />
        <Stat label='Wallet Balance' value={stats.balance} icon={<W />} />
      </div>

      <Card className='promo'>
        <span>🔥 <b>Special Weekend Tasks!</b> Higher rewards on retail audits this weekend.</span>
        <button className="whiteBtn" onClick={handleSpecialPromo}>View Tasks</button>
      </Card>

      <SectionTitle 
        title='Recommended Tasks' 
        action='View all' 
        onActionClick={() => navigate('/user/find-tasks')}
      />

      <div className='taskGrid'>
        {taskList.length === 0 ? (
          <Card style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <ClipboardList size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No active tasks recommended right now.</p>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Click "View all" to search available campaigns and mystery shopping opportunities.</small>
          </Card>
        ) : (
          taskList.map(t => (
            <Card key={t.id} className='taskCard' style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={t.image} 
                  alt={t.title} 
                  style={{ filter: !isKycVerified ? 'blur(6px)' : 'none', transition: 'filter 0.3s ease' }} 
                />
                {!isKycVerified && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', padding: '10px', textAlign: 'center'
                  }}>
                    <Lock size={22} style={{ marginBottom: '4px' }} />
                    <b style={{ fontSize: '12px', textTransform: 'uppercase' }}>KYC Locked</b>
                  </div>
                )}
              </div>

              <div className='taskBody'>
                <div className='row between' style={{ marginBottom: '8px' }}>
                  <span className="badge green">{t.countryFlag || '🌐'} {t.country || 'Global'}</span>
                  <Badge tone="purple">{t.platform || 'Online'}</Badge>
                </div>

                <div className='row between'>
                  <Badge>{t.category}</Badge>
                  <b className='money' style={{ filter: !isKycVerified ? 'blur(4px)' : 'none' }}>
                    ₹{t.reward}
                  </b>
                </div>

                <h3 style={{ filter: !isKycVerified ? 'blur(4px)' : 'none' }}>{t.title}</h3>
                <p style={{ color: '#0066ff', fontWeight: '700', fontSize: '13px', margin: '4px 0 8px' }}>
                  {t.brand} · {t.actionType || t.category}
                </p>

                <div className='meta' style={{ filter: !isKycVerified ? 'blur(3px)' : 'none' }}>
                  <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {t.city} · {t.duration}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: '8px 0', fontSize: '11.5px', color: '#64748b' }}>
                  <Calendar size={13} color="#64748b" />
                  <span>Expires: <b>{t.endDate || '30 Sep'}</b></span>
                </div>

                <div className='meta'>{t.slots} slots left</div>
                
                <Link 
                  className='primary full center' 
                  to={`/user/tasks/${t.id}`}
                  onClick={(e) => handleTaskClick(e, t.id)}
                  style={{ background: !isKycVerified ? '#94a3b8' : undefined }}
                >
                  {!isKycVerified ? '🔒 Complete KYC to View' : 'View Task & Requirements'}
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
