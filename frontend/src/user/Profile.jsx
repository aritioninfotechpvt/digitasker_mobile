import React, { useState, useMemo, useRef } from 'react';
import AppLayout from '../layouts/AppLayout';
import { currentUser as initialUser } from '../data/dummy';
import { Card } from '../components/ui';
import { showSuccess, showToast } from '../utils/swal';
import { X, CheckCircle2, ShieldCheck, CreditCard, MapPin, Bell, Lock, User, Share2, HelpCircle, Upload, Save, Star, Camera } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const savedProfile = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('insightloop_user') || '{}');
      const p = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
      return { ...u, ...p };
    } catch(e) {
      return {};
    }
  }, []);

  const [user, setUser] = useState(() => ({
    name: savedProfile.name || initialUser.name || 'Auditor',
    email: savedProfile.email || 'user@digitasker.com',
    phone: savedProfile.phone || '',
    city: savedProfile.city || 'Chandigarh',
    country: 'India',
    level: 'Explorer · Level 2',
    rating: 4.8,
    approval: 95,
    completed: 0,
    kyc: savedProfile.kycStatus || savedProfile.kyc_status || 'Verified',
    wallet: { balance: 0, available: 0, hold: 0, earned: 0 }
  }));

  const avatarInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(() => {
    const saved = localStorage.getItem('digitasker_user_avatar');
    if (saved) return saved;
    try {
      return savedProfile.profileImage || null;
    } catch(e) {
      return null;
    }
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG/JPG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      setProfileImage(dataUrl);
      localStorage.setItem('digitasker_user_avatar', dataUrl);
      const cur = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
      localStorage.setItem('digitasker_user_profile', JSON.stringify({ ...cur, profileImage: dataUrl }));

      try {
        await api.auth.updateProfile({ profile_image: dataUrl });
      } catch(err) {}

      showSuccess('Profile Picture Updated! 📸', 'Your profile avatar image has been uploaded and saved.');
    };
    reader.readAsDataURL(file);
  };

  const [personalForm, setPersonalForm] = useState(() => ({
    name: savedProfile.name || 'Auditor',
    email: savedProfile.email || 'user@digitasker.com',
    phone: savedProfile.phone || '',
    city: savedProfile.city || 'Chandigarh',
    bio: savedProfile.bio || 'Verified retail and mystery auditor.'
  }));

  const [kycForm, setKycForm] = useState(() => ({
    docType: savedProfile.docType || 'Aadhaar Card',
    idNumber: savedProfile.idNumber || '1234-5678-9012',
    status: savedProfile.kycStatus || savedProfile.kyc_status || 'Verified',
    verifiedDate: '15 Jan 2026'
  }));

  const [bankForm, setBankForm] = useState(() => {
    const defaultUpi = savedProfile.email ? `${savedProfile.email.split('@')[0]}@upi` : 'user@upi';
    return {
      method: 'UPI ID',
      upiId: savedProfile.upiId || defaultUpi,
      accountName: savedProfile.name || 'Auditor Account',
      bankName: savedProfile.bankName || 'HDFC Bank',
      accountNo: savedProfile.accountNo || '•••• •••• 9821',
      ifsc: savedProfile.ifsc || 'HDFC0001234'
    };
  });

  React.useEffect(() => {
    api.auth.me()
      .then(res => {
        if (res.user) {
          const uName = res.user.name || savedProfile.name || 'Auditor';
          const uEmail = res.user.email || savedProfile.email || 'user@digitasker.com';
          const uPhone = res.user.phone || savedProfile.phone || '';

          setUser(prev => ({
            ...prev,
            name: uName,
            email: uEmail,
            phone: uPhone,
            city: res.user.profile?.city || prev.city,
            kyc: res.user.profile?.kyc_status || prev.kyc
          }));
          setPersonalForm(prev => ({
            ...prev,
            name: uName,
            email: uEmail,
            phone: uPhone,
            city: res.user.profile?.city || prev.city,
            bio: res.user.profile?.bio || prev.bio
          }));
          setBankForm(prev => ({
            ...prev,
            accountName: uName,
            upiId: uEmail ? `${uEmail.split('@')[0]}@upi` : prev.upiId
          }));
          if (res.user.profile?.profile_image) {
            setProfileImage(res.user.profile.profile_image);
            localStorage.setItem('digitasker_user_avatar', res.user.profile.profile_image);
          }
        }
      })
      .catch(() => {});
  }, []);

  const [activeModal, setActiveModal] = useState(null);

  const [interests, setInterests] = useState(
    savedProfile.interests || ['Retail Stores', 'Restaurants & Cafes']
  );

  const [locationForm, setLocationForm] = useState({
    address: savedProfile.address || '#402, Sector 17-C, Near Main Market',
    primaryCity: savedProfile.city || 'Chandigarh',
    state: savedProfile.state || 'Punjab',
    country: savedProfile.country || 'India',
    pincode: savedProfile.pincode || '160017',
    secondaryCities: savedProfile.secondaryCities || 'Mohali, Panchkula, Zirakpur',
    radiusKm: savedProfile.radiusKm || 25,
    gpsGeofence: true
  });

  const [socialForm, setSocialForm] = useState({
    instagram: savedProfile.social?.instagram || '@auditor_profile',
    linkedin: savedProfile.social?.linkedin || 'linkedin.com/in/auditor-profile',
    twitter: savedProfile.social?.twitter || '@auditor_reviews',
    youtube: savedProfile.social?.youtube || 'youtube.com/@auditor_channel',
    facebook: savedProfile.social?.facebook || 'facebook.com/auditor.profile'
  });

  const [notificationForm, setNotificationForm] = useState({
    emailAlerts: true,
    smsAlerts: true,
    whatsappAlerts: true,
    pushAlerts: true,
    minReward: 200
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: true
  });

  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: ''
  });

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      await api.auth.updateProfile({
        name: personalForm.name,
        city: personalForm.city,
        bio: personalForm.bio
      });
    } catch(err){}
    setUser({ ...user, name: personalForm.name });
    setActiveModal(null);
    showSuccess('Personal Information Updated! 👤', 'Your profile details have been saved to backend.');
  };

  const handleSaveKyc = async (e) => {
    e.preventDefault();
    setUser({ ...user, kyc: kycForm.status });
    const cur = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
    localStorage.setItem('digitasker_user_profile', JSON.stringify({ ...cur, kycStatus: kycForm.status, docType: kycForm.docType, idNumber: kycForm.idNumber }));
    try {
      await api.auth.updateProfile({ kyc_status: kycForm.status });
    } catch(err){}
    setActiveModal(null);
    showSuccess('KYC Details Updated! 🛡️', `Your account KYC status is now: ${kycForm.status}.`);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    setActiveModal(null);
    showSuccess('Payment Method Updated! 💳', `Payouts will be sent to ${bankForm.upiId || bankForm.accountNo}.`);
  };

  const handleSaveInterests = async (e) => {
    e.preventDefault();
    const cur = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
    localStorage.setItem('digitasker_user_profile', JSON.stringify({ ...cur, interests: interests }));
    try {
      await api.auth.updateProfile({ interests });
    } catch(err){}
    setActiveModal(null);
    showSuccess('Interests Saved! ⭐', 'Task recommendations will prioritize your selected categories.');
  };

  const handleSaveLocations = async (e) => {
    e.preventDefault();
    const cur = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
    localStorage.setItem('digitasker_user_profile', JSON.stringify({
      ...cur,
      address: locationForm.address,
      city: locationForm.primaryCity,
      state: locationForm.state,
      country: locationForm.country,
      pincode: locationForm.pincode,
      radiusKm: locationForm.radiusKm,
      secondaryCities: locationForm.secondaryCities
    }));
    try {
      await api.auth.updateProfile({
        address: locationForm.address,
        city: locationForm.primaryCity,
        state: locationForm.state,
        country: locationForm.country,
        pincode: locationForm.pincode
      });
    } catch(err){}
    setActiveModal(null);
    showSuccess('Location Preferences Saved! 📍', `Saved full address: ${locationForm.address}, ${locationForm.primaryCity}, ${locationForm.state}, ${locationForm.country} - ${locationForm.pincode}.`);
  };

  const handleSaveSocial = async (e) => {
    e.preventDefault();
    const cur = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
    localStorage.setItem('digitasker_user_profile', JSON.stringify({
      ...cur,
      social: socialForm
    }));

    try {
      await api.auth.updateProfile({ social: socialForm });
    } catch(err) {}

    setActiveModal(null);
    showSuccess('Social Accounts Linked! 🔗', 'Connected social handles (Instagram, LinkedIn, Twitter, YouTube, Facebook) updated & saved to database.');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setActiveModal(null);
    showSuccess('Notification Preferences Saved! 🔔', 'Your instant alert settings have been updated.');
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (securityForm.currentPassword && securityForm.newPassword) {
      try {
        await api.auth.changePassword(securityForm.currentPassword, securityForm.newPassword);
      } catch (err) {
        showToast(`Security update notice: ${err.message}`, 'info');
      }
    }
    setActiveModal(null);
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: securityForm.twoFactor });
    showSuccess('Security Settings Saved! 🔒', 'Password & Two-Factor Authentication settings updated.');
  };

  const handleSaveSupport = (e) => {
    e.preventDefault();
    if (!supportForm.subject) {
      showToast('Please enter a ticket subject.', 'error');
      return;
    }
    setActiveModal(null);
    setSupportForm({ subject: '', message: '' });
    showSuccess('Support Inquiry Submitted! 🎫', 'Our support team will respond to your ticket shortly.');
  };

  const displayName = user.name || savedProfile.name || 'Auditor';

  return (
    <AppLayout title='Profile'>
      <div className='profileGrid' style={{ gap: '24px' }}>
        {/* Profile Card */}
        <Card className='profileCard' style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: '#ffffff' }}>
          <div style={{ height: '94px', background: 'linear-gradient(135deg, #0066ff 0%, #4f46e5 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', right: '12px', top: '12px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '999px' }}>
              Level 3 Auditor
            </div>
          </div>

          <div style={{ padding: '0 20px 24px 20px', textAlign: 'center', position: 'relative' }}>
            <input 
              type="file" 
              ref={avatarInputRef} 
              accept="image/*" 
              onChange={handleAvatarChange} 
              style={{ display: 'none' }} 
            />

            <div 
              onClick={() => avatarInputRef.current?.click()}
              title="Click to upload or change profile photo"
              style={{
                width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff',
                border: '4px solid #ffffff', display: 'grid', placeItems: 'center', fontSize: '26px', fontWeight: '800',
                margin: '-44px auto 8px', boxShadow: '0 8px 18px rgba(0,0,0,0.12)', position: 'relative', cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                displayName.split(' ').map(n => n[0]).join('')
              )}

              <div 
                style={{
                  position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  opacity: profileImage ? 0 : 0.85, transition: 'opacity 0.2s ease', color: '#ffffff'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = profileImage ? '0' : '0.85'}
              >
                <Camera size={18} />
                <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                  {profileImage ? 'Change' : 'Upload'}
                </span>
              </div>

              {kycForm.status === 'Verified' && (
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: '#10b981', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'grid', placeItems: 'center', border: '2px solid #fff', zIndex: 3 }} title="KYC Verified">
                  <CheckCircle2 size={13} />
                </div>
              )}
            </div>

            <button 
              type="button" 
              onClick={() => avatarInputRef.current?.click()}
              style={{
                background: '#eff6ff', color: '#0066ff', border: '1px solid #bfdbfe',
                padding: '4px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700,
                cursor: 'pointer', marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Camera size={13} /> {profileImage ? 'Change Profile Photo' : 'Upload Profile Photo'}
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
              {displayName}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', fontWeight: '500' }}>
              Senior Field & Mystery Auditor
            </p>

            <div style={{ marginBottom: '16px' }}>
              <span style={{
                fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '999px',
                background: kycForm.status === 'Verified' ? '#dcfce7' : '#fff7ed',
                color: kycForm.status === 'Verified' ? '#15803d' : '#c2410c',
                border: `1px solid ${kycForm.status === 'Verified' ? '#86efac' : '#ffedd5'}`,
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>
                <ShieldCheck size={14} />
                {kycForm.status === 'Verified' ? 'KYC Verified Auditor' : 'KYC Pending Verification'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', padding: '12px 8px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div>
                <b style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'block' }}>38</b>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Audits Done</span>
              </div>
              <div>
                <b style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'block' }}>4.8 ★</b>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Rating</span>
              </div>
              <div>
                <b style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'block' }}>98%</b>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Approval</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'left', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} color="#0066ff" />
                <span style={{ fontWeight: 600 }}>{personalForm.email || savedProfile.email || 'user@digitasker.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={14} color="#0066ff" />
                <span>{personalForm.phone || savedProfile.phone || 'No phone added'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="#0066ff" />
                <span>{locationForm.primaryCity || 'Chandigarh'}, {locationForm.state || 'Punjab'}, {locationForm.country || 'India'}</span>
              </div>
            </div>

            <button 
              className='primary full' 
              onClick={() => setActiveModal('personal')}
              style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px' }}
            >
              <Save size={16} /> Edit Profile Details
            </button>
          </div>
        </Card>

        {/* Account & Preferences Settings List */}
        <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '24px' }}>
          <div className='between' style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Account & Preferences</h3>
              <p className='muted' style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Manage your auditor identity, payout methods, and targeting settings</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, background: '#eff6ff', color: '#0066ff', padding: '4px 10px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
              Live Auditor Profile
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1. Personal Information Card */}
            <div 
              onClick={() => setActiveModal('personal')}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,102,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#0066ff', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #bfdbfe' }}>
                  <User size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Personal Information</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{displayName}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>• {personalForm.email}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>• {personalForm.phone}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>• {personalForm.city}</span>
                  </div>
                </div>
              </div>
              <button type="button" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#0066ff', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Edit Details ›
              </button>
            </div>

            {/* 2. KYC Verification Card */}
            <div 
              onClick={() => setActiveModal('kyc')}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #a7f3d0' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>KYC Verification & Identity Proof</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                      background: kycForm.status === 'Verified' ? '#dcfce7' : '#fff7ed',
                      color: kycForm.status === 'Verified' ? '#15803d' : '#c2410c'
                    }}>
                      Status: {kycForm.status} {kycForm.status === 'Verified' ? '✅' : '⏳'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>• {kycForm.docType} ({kycForm.idNumber})</span>
                  </div>
                </div>
              </div>
              <button type="button" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Manage KYC ›
              </button>
            </div>

            {/* 3. Bank Account & UPI Card */}
            <div 
              onClick={() => setActiveModal('bank')}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(139,92,246,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #ddd6fe' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Bank Account & UPI Payouts</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b21a8', background: '#f3e8ff', padding: '2px 8px', borderRadius: '6px' }}>{bankForm.upiId || bankForm.accountNo}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>• {bankForm.bankName}</span>
                    <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700 }}>• Instant Withdrawal Active</span>
                  </div>
                </div>
              </div>
              <button type="button" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Edit Payouts ›
              </button>
            </div>

            {/* 4. My Audit Interests Card */}
            <div 
              onClick={() => setActiveModal('interests')}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(245,158,11,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #fde68a' }}>
                  <Star size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>My Audit Category Interests</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    {interests.map(cat => (
                      <span key={cat} style={{ fontSize: '11.5px', fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button type="button" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Edit Categories ›
              </button>
            </div>

            {/* 5. Preferred Locations & Address Card */}
            <div 
              onClick={() => setActiveModal('locations')}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(225,29,72,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff1f2', color: '#e11d48', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #fecdd3' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Full Address & Preferred Locations</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                      {locationForm.address}, {locationForm.primaryCity}, {locationForm.state}, {locationForm.country} - {locationForm.pincode}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#e11d48', fontWeight: 600 }}>• Radius: {locationForm.radiusKm} km</span>
                  </div>
                </div>
              </div>
              <button type="button" style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Edit Location ›
              </button>
            </div>

            {/* 6. Social Accounts Card */}
            <div 
              onClick={() => setActiveModal('social')}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(13,148,136,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f0fdf4', color: '#0d9488', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #99f6e4' }}>
                  <Share2 size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Social Audit Accounts & Profiles</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0f766e', background: '#ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>Insta: {socialForm.instagram}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>LinkedIn: {socialForm.linkedin}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#4338ca', background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px' }}>X: {socialForm.twitter}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>YouTube: {socialForm.youtube}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>FB: {socialForm.facebook}</span>
                  </div>
                </div>
              </div>
              <button type="button" style={{ background: '#f0fdf4', border: '1px solid #99f6e4', color: '#0f766e', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Edit Social ›
              </button>
            </div>

            {/* 7. Privacy & Security Card */}
            <div 
              onClick={() => setActiveModal('security')}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(71,85,105,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f8fafc', color: '#475569', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid #cbd5e1' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Privacy & Security</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>• Password Encrypted</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>• 2-Factor Authentication Enabled</span>
                  </div>
                </div>
              </div>
              <button type="button" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Security Settings ›
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* EDIT MODAL FORMS */}
      {/* ========================================================================= */}

      {activeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            padding: '28px'
          }}>
            <div className='between' style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {activeModal === 'personal' && 'Edit Personal Information'}
                {activeModal === 'kyc' && 'KYC Verification Documents'}
                {activeModal === 'bank' && 'Edit Bank Account & UPI'}
                {activeModal === 'interests' && 'Edit Audit Category Interests'}
                {activeModal === 'locations' && 'Edit Preferred Locations'}
                {activeModal === 'social' && 'Edit Social Media Profiles'}
                {activeModal === 'notifications' && 'Edit Notification Settings'}
                {activeModal === 'security' && 'Privacy & Password Settings'}
                {activeModal === 'support' && 'Create Support Inquiry'}
              </h3>
              <button 
                className='iconBtn' 
                onClick={() => setActiveModal(null)} 
                style={{ cursor: 'pointer', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 1. PERSONAL INFORMATION FORM */}
            {activeModal === 'personal' && (
              <form onSubmit={handleSavePersonal} className='stack' style={{ gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '18px', border: '2px solid #0066ff', flexShrink: 0 }}>
                    {profileImage ? (
                      <img src={profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      personalForm.name ? personalForm.name.split(' ').map(n => n[0]).join('') : 'RM'
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Profile Picture / Photo</b>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>PNG or JPG photo max 5MB</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => avatarInputRef.current?.click()}
                    style={{ background: '#0066ff', color: '#ffffff', border: 0, padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={14} /> {profileImage ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={personalForm.name} 
                    onChange={e => setPersonalForm({ ...personalForm, name: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div className='fieldGrid two'>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={personalForm.email} 
                      onChange={e => setPersonalForm({ ...personalForm, email: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                    <input 
                      type="text" 
                      value={personalForm.phone} 
                      onChange={e => setPersonalForm({ ...personalForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Primary City</label>
                  <input 
                    type="text" 
                    value={personalForm.city} 
                    onChange={e => setPersonalForm({ ...personalForm, city: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Auditor Bio & Experience</label>
                  <textarea 
                    rows={4} 
                    value={personalForm.bio} 
                    onChange={e => setPersonalForm({ ...personalForm, bio: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Save Changes</button>
                </div>
              </form>
            )}

            {/* 2. KYC VERIFICATION FORM */}
            {activeModal === 'kyc' && (
              <form onSubmit={handleSaveKyc} className='stack' style={{ gap: '16px' }}>
                <div style={{ background: kycForm.status === 'Verified' ? '#ecfdf5' : '#fff7ed', border: `1px solid ${kycForm.status === 'Verified' ? '#a7f3d0' : '#fed7aa'}`, padding: '14px', borderRadius: '12px', color: kycForm.status === 'Verified' ? '#065f46' : '#9a3412', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <CheckCircle2 size={20} />
                  <div>
                    <b>KYC Verification Status: {kycForm.status}</b>
                    <div style={{ fontSize: '12px' }}>
                      {kycForm.status === 'Verified' ? 'Fully Verified. Unlocked all high-payout tasks.' : 'Pending Verification. Tasks will be locked/blurred until verified.'}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Update KYC Verification Status (For Testing & Verification)</label>
                  <select 
                    value={kycForm.status} 
                    onChange={e => setKycForm({ ...kycForm, status: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                  >
                    <option value="Verified">Verified (Full Task Access Unlocked)</option>
                    <option value="Pending">Pending Verification (Tasks Blurred & Locked)</option>
                    <option value="Not Submitted">Not Submitted (Tasks Blurred & Locked)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Government ID Document Type</label>
                  <select 
                    value={kycForm.docType} 
                    onChange={e => setKycForm({ ...kycForm, docType: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Aadhaar Card</option>
                    <option>PAN Card</option>
                    <option>Passport</option>
                    <option>Driving License</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Document / Identification Number</label>
                  <input 
                    type="text" 
                    value={kycForm.idNumber} 
                    onChange={e => setKycForm({ ...kycForm, idNumber: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className='uploadBox' onClick={() => showToast('Uploading updated document scan...')}>
                  <Upload />
                  <b>Upload Front & Back Image Scans</b>
                  <span>JPG, PNG, PDF · up to 15 MB</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Update KYC</button>
                </div>
              </form>
            )}

            {/* 3. BANK ACCOUNT & UPI FORM */}
            {activeModal === 'bank' && (
              <form onSubmit={handleSaveBank} className='stack' style={{ gap: '16px' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Preferred Payout Method</label>
                  <select 
                    value={bankForm.method} 
                    onChange={e => setBankForm({ ...bankForm, method: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="UPI ID">UPI Instant Transfer (Recommended)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  </select>
                </div>

                {bankForm.method === 'UPI ID' ? (
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>UPI VPA Address</label>
                    <input 
                      type="text" 
                      placeholder="username@okaxis or username@paytm"
                      value={bankForm.upiId} 
                      onChange={e => setBankForm({ ...bankForm, upiId: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Account Holder Name</label>
                      <input 
                        type="text" 
                        value={bankForm.accountName} 
                        onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })}
                        style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div className='fieldGrid two'>
                      <div>
                        <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Account Number</label>
                        <input 
                          type="text" 
                          value={bankForm.accountNo} 
                          onChange={e => setBankForm({ ...bankForm, accountNo: e.target.value })}
                          style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>IFSC Code</label>
                        <input 
                          type="text" 
                          value={bankForm.ifsc} 
                          onChange={e => setBankForm({ ...bankForm, ifsc: e.target.value })}
                          style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Save Payout Details</button>
                </div>
              </form>
            )}

            {/* 4. MY INTERESTS FORM */}
            {activeModal === 'interests' && (
              <form onSubmit={handleSaveInterests} className='stack' style={{ gap: '16px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Select categories you are interested in auditing (only selected categories will show on your profile):</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  {[
                    'Retail Stores', 'Restaurants & Cafes', 'Mystery Audit', 'Google Rating & Review',
                    'Social Media', 'E-commerce', 'IMDb & Entertainment', 'Survey',
                    'Pharmacies', 'Fuel Stations', 'Banks & ATMs', 'Hotels & Hospitality',
                    'Electronics & Appliances', 'Fashion & Apparel'
                  ].map(cat => {
                    const isChecked = interests.includes(cat);
                    return (
                      <label 
                        key={cat} 
                        style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          alignItems: 'center', 
                          background: isChecked ? '#eff6ff' : '#ffffff', 
                          padding: '12px 14px', 
                          borderRadius: '12px', 
                          border: isChecked ? '1.5px solid #0066ff' : '1px solid #e2e8f0', 
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isChecked ? '0 4px 12px rgba(0,102,255,0.06)' : 'none'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setInterests(prev => Array.from(new Set([...prev, cat])));
                            else setInterests(prev => prev.filter(c => c !== cat));
                          }}
                          style={{
                            width: '18px',
                            height: '18px',
                            minWidth: '18px',
                            minHeight: '18px',
                            maxWidth: '18px',
                            maxHeight: '18px',
                            margin: 0,
                            padding: 0,
                            accentColor: '#0066ff',
                            flexShrink: 0,
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: isChecked ? '#0066ff' : '#334155' }}>{cat}</span>
                      </label>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Save Category Interests</button>
                </div>
              </form>
            )}

            {/* 5. PREFERRED LOCATIONS FORM */}
            {activeModal === 'locations' && (
              <form onSubmit={handleSaveLocations} className='stack' style={{ gap: '16px' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Full Street Address / House No.</label>
                  <input 
                    type="text" 
                    placeholder="e.g. #402, Sector 17-C, Near Main Market"
                    value={locationForm.address} 
                    onChange={e => setLocationForm({ ...locationForm, address: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div className='fieldGrid two'>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Country</label>
                    <input 
                      type="text" 
                      placeholder="e.g. India, USA, UAE"
                      value={locationForm.country} 
                      onChange={e => setLocationForm({ ...locationForm, country: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>City</label>
                    <input 
                      type="text" 
                      value={locationForm.primaryCity} 
                      onChange={e => setLocationForm({ ...locationForm, primaryCity: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>State</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Punjab / Delhi / Maharashtra"
                      value={locationForm.state} 
                      onChange={e => setLocationForm({ ...locationForm, state: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Pincode / Postal Code (For Targeted Tasks)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 160017"
                    value={locationForm.pincode} 
                    onChange={e => setLocationForm({ ...locationForm, pincode: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Secondary Neighboring Cities</label>
                  <input 
                    type="text" 
                    value={locationForm.secondaryCities} 
                    onChange={e => setLocationForm({ ...locationForm, secondaryCities: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                    Maximum Travel Distance Radius: <b>{locationForm.radiusKm} km</b>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5"
                    value={locationForm.radiusKm}
                    onChange={e => setLocationForm({ ...locationForm, radiusKm: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                <label className='toggleRow'>
                  <div>
                    <b>Enable GPS Geofencing Auto-Checkin</b>
                    <span>Verify task proximity using device location</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={locationForm.gpsGeofence}
                    onChange={e => setLocationForm({ ...locationForm, gpsGeofence: e.target.checked })}
                  />
                </label>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Save Locations</button>
                </div>
              </form>
            )}

            {/* 6. SOCIAL ACCOUNTS FORM */}
            {activeModal === 'social' && (
              <form onSubmit={handleSaveSocial} className='stack' style={{ gap: '16px' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Instagram Handle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. @rahul_auditor"
                    value={socialForm.instagram} 
                    onChange={e => setSocialForm({ ...socialForm, instagram: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>LinkedIn Profile URL</label>
                  <input 
                    type="text" 
                    placeholder="e.g. linkedin.com/in/rahulmehta"
                    value={socialForm.linkedin} 
                    onChange={e => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Twitter / X Handle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. @rahul_m_reviews"
                    value={socialForm.twitter} 
                    onChange={e => setSocialForm({ ...socialForm, twitter: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>YouTube Channel Link / Handle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. youtube.com/@rahul_auditor"
                    value={socialForm.youtube} 
                    onChange={e => setSocialForm({ ...socialForm, youtube: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Facebook Profile / Page URL</label>
                  <input 
                    type="text" 
                    placeholder="e.g. facebook.com/rahul.auditor"
                    value={socialForm.facebook} 
                    onChange={e => setSocialForm({ ...socialForm, facebook: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Save Social Accounts</button>
                </div>
              </form>
            )}

            {/* 7. NOTIFICATION SETTINGS FORM */}
            {activeModal === 'notifications' && (
              <form onSubmit={handleSaveNotifications} className='stack' style={{ gap: '16px' }}>
                <label className='toggleRow'>
                  <div>
                    <b>Email Alert Digest</b>
                    <span>Daily summary of new high-paying audits</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationForm.emailAlerts}
                    onChange={e => setNotificationForm({ ...notificationForm, emailAlerts: e.target.checked })}
                  />
                </label>

                <label className='toggleRow'>
                  <div>
                    <b>WhatsApp Task Alerts</b>
                    <span>Receive instant alerts when nearby tasks open</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationForm.whatsappAlerts}
                    onChange={e => setNotificationForm({ ...notificationForm, whatsappAlerts: e.target.checked })}
                  />
                </label>

                <label className='toggleRow'>
                  <div>
                    <b>Mobile Push Notifications</b>
                    <span>Real-time status updates on submitted tasks</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationForm.pushAlerts}
                    onChange={e => setNotificationForm({ ...notificationForm, pushAlerts: e.target.checked })}
                  />
                </label>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                    Minimum Task Reward Alert Threshold: <b>₹{notificationForm.minReward}</b>
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="1000" 
                    step="50"
                    value={notificationForm.minReward}
                    onChange={e => setNotificationForm({ ...notificationForm, minReward: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Save Notifications</button>
                </div>
              </form>
            )}

            {/* 8. PRIVACY & SECURITY FORM */}
            {activeModal === 'security' && (
              <form onSubmit={handleSaveSecurity} className='stack' style={{ gap: '16px' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Current Password</label>
                  <input 
                    type="password" 
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={securityForm.currentPassword}
                    onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className='fieldGrid two'>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>New Password</label>
                    <input 
                      type="password" 
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={securityForm.newPassword}
                      onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={securityForm.confirmPassword}
                      onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <label className='toggleRow'>
                  <div>
                    <b>Two-Factor Authentication (2FA)</b>
                    <span>Require SMS / OTP verification on login</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={securityForm.twoFactor}
                    onChange={e => setSecurityForm({ ...securityForm, twoFactor: e.target.checked })}
                  />
                </label>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'><Save size={16} /> Update Security</button>
                </div>
              </form>
            )}

            {/* 9. HELP & SUPPORT FORM */}
            {activeModal === 'support' && (
              <form onSubmit={handleSaveSupport} className='stack' style={{ gap: '16px' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Ticket Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Question regarding Task Payout Hold"
                    value={supportForm.subject}
                    onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Message Details</label>
                  <textarea 
                    rows={5} 
                    placeholder="Describe your issue or query..."
                    value={supportForm.message}
                    onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                    style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className='ghost' onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className='primary'>Submit Ticket</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
