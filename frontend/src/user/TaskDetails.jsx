import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge } from '../components/ui';
import { MapPin, Clock3, Users, CheckCircle2, ShieldCheck, Globe, ThumbsUp, ShoppingCart, Image, Video, FileText, Link as LinkIcon, Star, ExternalLink, Calendar, Lock, Sparkles } from 'lucide-react';
import { showSuccess, showConfirm, showToast } from '../utils/swal';
import api from '../services/api';
import { currentUser } from '../data/dummy';

const defaultCategoryImages = {
  'Mystery Audit': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'Field Audit': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
  'Google Rating & Review': 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
  'Social Media': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
  'E-commerce': 'https://images.unsplash.com/photo-1556742049-0a670fc8077a?auto=format&fit=crop&w=800&q=80',
  'IMDb & Entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'Survey': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
};

const getDefaultEvidence = (cat) => {
  if (cat === 'Google Rating & Review') {
    return [
      { name: 'Google Review & Rating Screenshot', requirement: 'Required', type: 'photo' },
      { name: 'Reviewer Profile Name / Link', requirement: 'Required', type: 'text' },
      { name: 'Posted Review Text Copy', requirement: 'Required', type: 'text' },
      { name: 'GPS Location Check-in', requirement: 'Auto capture', type: 'location' }
    ];
  } else if (cat === 'Social Media') {
    return [
      { name: 'Screenshot of Like & Follow', requirement: 'Required', type: 'photo' },
      { name: 'User Profile URL', requirement: 'Required', type: 'link' },
      { name: 'Comment / Review Text', requirement: 'Required', type: 'text' },
      { name: 'Screen Recording', requirement: 'Optional', type: 'video' }
    ];
  } else if (cat === 'E-commerce' || cat === 'E-Commerce') {
    return [
      { name: 'Order ID & Invoice Screenshot', requirement: 'Required', type: 'document' },
      { name: 'Verified Review Screenshot', requirement: 'Required', type: 'photo' },
      { name: 'Star Rating Confirmation', requirement: 'Required', type: 'photo' },
      { name: 'Product Unboxing Photo', requirement: 'Optional', type: 'photo' }
    ];
  } else if (cat === 'IMDb & Entertainment') {
    return [
      { name: 'Rating & Review Screenshot', requirement: 'Required', type: 'photo' },
      { name: 'Profile Handle / URL', requirement: 'Required', type: 'text' }
    ];
  } else if (cat === 'Survey') {
    return [
      { name: 'Survey Completion Screenshot', requirement: 'Required', type: 'photo' },
      { name: 'Feedback Response Summary', requirement: 'Required', type: 'text' }
    ];
  } else {
    return [
      { name: 'Store front photo', requirement: 'Required', type: 'photo' },
      { name: 'Interior photo', requirement: 'Required', type: 'photo' },
      { name: 'Bill / Invoice', requirement: 'Required', type: 'document' },
      { name: '30 sec video', requirement: 'Required', type: 'video' },
      { name: 'Location proof', requirement: 'Auto capture', type: 'location' }
    ];
  }
};

const extractEvidenceList = (item) => {
  if (!item) return [];
  if (Array.isArray(item.evidenceList) && item.evidenceList.length > 0) {
    return item.evidenceList.filter(e => e.enabled !== false).map(e => typeof e === 'string' ? { name: e, requirement: 'Required', type: 'photo' } : e);
  }
  if (item.instructions) {
    try {
      const parsed = JSON.parse(item.instructions);
      if (parsed?.evidenceList && Array.isArray(parsed.evidenceList) && parsed.evidenceList.length > 0) {
        return parsed.evidenceList.filter(e => e.enabled !== false).map(e => typeof e === 'string' ? { name: e, requirement: 'Required', type: 'photo' } : e);
      }
    } catch(e) {}
  }
  if (Array.isArray(item.requirements) && item.requirements.length > 0) {
    return item.requirements.map(r => typeof r === 'string' ? { name: r, requirement: 'Required', type: 'photo' } : r);
  }
  return getDefaultEvidence(item.category || item.type || 'Mystery Audit');
};

const defaultFallbackTask = {
  id: '1',
  title: 'Retail Mystery Audit & Rating',
  brand: 'DigiLites Studio',
  category: 'Mystery Audit',
  country: 'India',
  countryFlag: '🇮🇳',
  platform: 'Physical / Digital',
  actionType: 'Audit & Review',
  city: 'Chandigarh, NCR',
  distance: '1.2 km',
  duration: '20 mins',
  slots: 50,
  reward: 350,
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  image: defaultCategoryImages['Mystery Audit'],
  eligibility: ['Country: India 🇮🇳', 'KYC Verified Level 2+'],
  evidenceList: getDefaultEvidence('Mystery Audit')
};

import KycBanner from '../components/KycBanner';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load User Profile & KYC Verification Status State
  const [kycStatusState, setKycStatusState] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
      return p.kycStatus || currentUser.kyc || 'Pending';
    } catch(e) {
      return currentUser.kyc || 'Pending';
    }
  });

  const isKycVerified = kycStatusState === 'Verified';

  // Load Client Branding Profile
  const clientBranding = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('digitasker_client_branding') || '{}');
    } catch(e) {
      return {};
    }
  }, []);

  const [task, setTask] = useState(() => {
    const customTasks = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]');
    const found = customTasks.find(x => String(x.id) === String(id) || x.task_code === id);
    if (found) {
      const cat = found.category || 'Google Rating & Review';
      return {
        id: found.id,
        title: found.title,
        brand: found.brand || clientBranding.companyName || 'DigiLites Studio',
        category: cat,
        country: 'India',
        countryFlag: '🇮🇳',
        platform: cat.includes('Google') ? 'Google Maps / Online' : cat === 'Social Media' ? 'Social Media App' : 'Physical / Digital',
        actionType: cat,
        city: 'Chandigarh, NCR',
        distance: '1.2 km',
        duration: found.duration || '25 mins',
        slots: found.slots || 60,
        reward: parseFloat(found.reward) || 300,
        startDate: found.startDate || '2026-09-01',
        endDate: found.endDate || '2026-09-30',
        image: found.image || defaultCategoryImages[cat] || defaultCategoryImages['Mystery Audit'],
        eligibility: ['Country: India 🇮🇳', 'KYC Verified Level 2+'],
        evidenceList: extractEvidenceList(found)
      };
    }
    return null;
  });

  useEffect(() => {
    const loadTask = async () => {
      try {
        const res = await api.admin.getTasks();
        if (Array.isArray(res)) {
          const found = res.find(x => String(x.id) === String(id) || x.task_code === id);
          if (found) {
            const cat = found.category || found.type || 'Field Audit';
            setTask({
              id: found.id,
              title: found.title,
              brand: found.brand || clientBranding.companyName || 'Verified Brand',
              category: cat,
              country: 'India',
              countryFlag: '🇮🇳',
              platform: cat.includes('Google') ? 'Google Maps / Online' : cat === 'Social Media' ? 'Social Media App' : 'Physical / Digital',
              actionType: cat,
              city: found.location || 'Pan-India',
              distance: '1.5 km',
              duration: found.duration || '20 mins',
              slots: (found.quota || found.target_quota || 50) - (found.completed_count || 0),
              reward: parseFloat(found.reward_per_task) || 350,
              startDate: found.startDate || '2026-09-01',
              endDate: found.endDate || '2026-09-30',
              image: found.image || defaultCategoryImages[cat] || defaultCategoryImages['Mystery Audit'],
              eligibility: ['Country: India 🇮🇳', 'KYC Verified'],
              evidenceList: extractEvidenceList(found)
            });
          }
        }
      } catch (err) {
        console.warn('Task details fetch notice:', err.message);
      }
    };
    loadTask();
  }, [id, clientBranding]);

  const t = task || defaultFallbackTask;

  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedSlot, setSelectedSlot] = useState('10 Sep · Today');

  const handleBookTask = () => {
    if (!isKycVerified) {
      showConfirm(
        'KYC Verification Required 🔒',
        'Your KYC status is currently pending. Please complete your KYC verification (Aadhaar / PAN) in your profile to unblur and book tasks.'
      ).then(confirmed => {
        if (confirmed) navigate('/user/profile');
      });
      return;
    }

    const bookedTask = {
      id: t.id,
      task_code: t.task_code || `TSK-${t.id}`,
      title: t.title,
      brand: t.brand || 'DigiLites Partner',
      category: t.category || 'Google Rating & Review',
      city: t.city || 'Chandigarh, NCR',
      duration: t.duration || '25 mins',
      reward: parseFloat(t.reward) || 300,
      image: t.image || defaultCategoryImages[t.category] || defaultCategoryImages['Mystery Audit'],
      status: 'In Progress',
      bookedAt: new Date().toISOString(),
      country: t.country || 'India',
      countryFlag: t.countryFlag || '🇮🇳'
    };

    const currentBooked = JSON.parse(localStorage.getItem('digitasker_user_booked_tasks') || '[]');
    const updatedBooked = [bookedTask, ...currentBooked.filter(b => String(b.id) !== String(bookedTask.id) && b.title !== bookedTask.title)];
    localStorage.setItem('digitasker_user_booked_tasks', JSON.stringify(updatedBooked));

    showSuccess(
      'Task Slot Reserved! 🎉',
      `You have successfully booked "${t.title}" (${t.countryFlag || '🌐'} ${t.country || 'Global'}). Proceed to complete task evidence.`
    );
    navigate(`/user/tasks/${t.id}/complete`);
  };

  const handleViewClient = () => {
    showSuccess(
      `${t.brand} Partner Profile`,
      `Verified Brand Partner · Rating 4.9/5 · Target Geography: ${t.country || 'Global'}. Website: ${clientBranding.websiteUrl || 'https://digitasker.com'}`
    );
  };

  const evidenceItems = t.evidenceList || extractEvidenceList(t);
  const eligibilityList = t.eligibility || ['Country: India 🇮🇳', 'KYC Verified'];

  const companyName = clientBranding.companyName || t.brand || 'DigiLites Studio';
  const companyLogo = clientBranding.companyLogo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80';
  const websiteUrl = clientBranding.websiteUrl || 'https://digitasker.com';
  const aboutCompany = clientBranding.aboutCompany || 'Leading brand analytics and retail mystery audit studio delivering real-time field data & verified reviews across India.';

  return (
    <AppLayout title='Task Details'>
      {/* KYC Warning Banner */}
      {!isKycVerified && (
        <KycBanner 
          kycStatus={kycStatusState} 
          onStatusChange={(newStatus) => setKycStatusState(newStatus)}
        />
      )}

      <div className='detailGrid'>
        <Card>
          <div className='taskHero'>
            <img 
              src={t.image || defaultCategoryImages[t.category] || defaultCategoryImages['Mystery Audit']} 
              alt={t.title || 'Task'} 
              style={{ filter: !isKycVerified ? 'blur(6px)' : 'none' }}
            />
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span className="badge green">{t.countryFlag || '🌐'} Country: {t.country || 'Global'}</span>
                <Badge tone="purple">{t.platform || 'Online'}</Badge>
                <Badge>{t.category || 'Audit'}</Badge>
              </div>

              <h2 style={{ filter: !isKycVerified ? 'blur(4px)' : 'none' }}>{t.title || 'Task'}</h2>
              <p style={{ color: '#0066ff', fontWeight: '700', fontSize: '15px', margin: '4px 0 10px' }}>
                {t.brand} · {t.actionType || t.category}
              </p>

              <div className='meta big'>
                <Globe size={16} />{t.country || 'Global'} ({t.city || 'Pan-India'})
                <Clock3 size={16} />{t.duration || '20 mins'}
                <Users size={16} />{t.slots ?? 50} slots left
              </div>

              {/* Task Timing & Expiry Badges */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px', fontSize: '13px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={15} color="#0066ff" /> Task Starts: <b>{t.startDate || '01 Sep 2026'}</b>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                  <Clock3 size={15} color="#059669" /> Expires: <b>{t.endDate || '30 Sep 2026'}</b>
                </span>
              </div>

              <h2 className='money' style={{ marginTop: '12px', filter: !isKycVerified ? 'blur(4px)' : 'none' }}>
                ₹{t.reward || 350} {t.reimbursement ? `+ ₹${t.reimbursement} Cashback` : ''}
              </h2>
            </div>
          </div>

          <div className='tabs' style={{ cursor: 'pointer' }}>
            {['Overview', 'Eligibility & Rules', 'Required Submissions', 'Location / Platform'].map(tab => (
              <span
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontWeight: activeTab === tab ? '800' : '600',
                  color: activeTab === tab ? '#0066ff' : '#64748b',
                  borderBottom: activeTab === tab ? '2px solid #0066ff' : 'none',
                  paddingBottom: '8px'
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          {activeTab === 'Overview' && (
            <>
              <h3>Task Description</h3>
              <p style={{ lineHeight: '1.6', color: '#334155' }}>
                Complete this <b>{t.category}</b> task for <b>{t.brand}</b>. Ensure you satisfy all eligibility criteria and upload requested proof before completing your slot.
              </p>

              <h3>Eligibility Criteria</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {eligibilityList.map(req => (
                  <span key={req} style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '13px' }}>
                    ✓ {req}
                  </span>
                ))}
              </div>

              <h3>Required Evidence Submissions ({evidenceItems.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {evidenceItems.map((ev, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0066ff' }}>✓</span> {ev.name}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: ev.requirement === 'Required' ? '#fee2e2' : ev.requirement === 'Auto capture' ? '#e0f2fe' : '#f1f5f9',
                      color: ev.requirement === 'Required' ? '#dc2626' : ev.requirement === 'Auto capture' ? '#0369a1' : '#475569'
                    }}>
                      {ev.requirement || 'Required'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'Eligibility & Rules' && (
            <div style={{ padding: '12px 0', lineHeight: '1.7' }}>
              <h4 style={{ marginBottom: '10px', color: '#0f172a' }}>Strict Eligibility & Compliance Rules</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155' }}>
                <li><b>Target Country:</b> {t.countryFlag || '🌐'} {t.country || 'Global'}</li>
                <li><b>Required Auditor Level:</b> KYC Verified Level 2+</li>
                <li><b>Device / Platform:</b> {t.platform || 'Online App'}</li>
                <li><b>Geofence / Location:</b> {t.distance || 'GPS Check-in Required'}</li>
              </ul>
            </div>
          )}

          {activeTab === 'Required Submissions' && (
            <div style={{ padding: '12px 0' }}>
              <h4 style={{ marginBottom: '14px', color: '#0f172a' }}>Evidence Upload Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {evidenceItems.map((ev, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
                    <div style={{ background: '#eff6ff', color: '#0066ff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      {ev.type === 'photo' ? '📷' : ev.type === 'video' ? '🎥' : ev.type === 'document' ? '📄' : ev.type === 'text' ? '📝' : ev.type === 'link' ? '🔗' : '📍'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <b style={{ fontSize: '14px', color: '#0f172a' }}>{ev.name}</b>
                      <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                        Must be clear, unedited original evidence ({ev.requirement || 'Required'}).
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: ev.requirement === 'Required' ? '#fee2e2' : '#f1f5f9', color: ev.requirement === 'Required' ? '#dc2626' : '#334155' }}>
                      {ev.requirement || 'Required'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Location / Platform' && (
            <div style={{ padding: '12px 0' }}>
              <h4 style={{ marginBottom: '10px', color: '#0f172a' }}>Platform / Location Details</h4>
              <p><b>Country:</b> {t.countryFlag || '🌐'} {t.country || 'Global'}</p>
              <p><b>Target Destination:</b> {t.city || 'Chandigarh'} ({t.distance || '1.2 km'})</p>
              <p><b>Platform:</b> {t.platform}</p>
            </div>
          )}

          <h3 style={{ marginTop: '20px' }}>Available Booking Slots</h3>
          <div className='slots'>
            {['10 Sep · Today', '11 Sep · Thu', '12 Sep · Fri', '13 Sep · Sat'].map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  setSelectedSlot(slot);
                  showToast(`Selected slot: ${slot}`);
                }}
                style={{
                  background: selectedSlot === slot ? '#0066ff' : '#ffffff',
                  color: selectedSlot === slot ? '#ffffff' : '#0f172a',
                  borderColor: selectedSlot === slot ? '#0066ff' : '#cbd5e1'
                }}
              >
                {slot}
              </button>
            ))}
          </div>

          <button 
            className='primary lg full' 
            onClick={handleBookTask} 
            style={{ marginTop: '16px', background: !isKycVerified ? '#94a3b8' : undefined }}
          >
            {!isKycVerified ? '🔒 Complete KYC to Book Task' : `Book & Start Task (${t.countryFlag || '🌐'} ${t.country || 'Global'})`}
          </button>
        </Card>

        <div>
          <Card>
            <h3>Target Platform / Location</h3>
            <div className='mapMock'>
              📍 <b>{t.brand}</b>
              <span>{t.platform} · {t.city}</span>
              <small>{t.countryFlag || '🌐'} {t.country || 'Global'}</small>
            </div>
          </Card>

          {/* Client Branding & Profile Card */}
          <Card style={{ marginTop: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>About the Brand & Company</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <img 
                src={companyLogo} 
                alt={companyName} 
                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }} 
              />
              <div>
                <b style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{companyName}</b>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>✓ Verified Partner Brand</span>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 14px' }}>
              {aboutCompany}
            </p>

            <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noreferrer" 
              className='ghost full' 
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0066ff' }}
            >
              <ExternalLink size={14} /> Visit Official Website ↗
            </a>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
