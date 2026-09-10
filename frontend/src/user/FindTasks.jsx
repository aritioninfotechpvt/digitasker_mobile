import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Stat, Card, SectionTitle, Badge } from '../components/ui';
import { ClipboardList, Search, Filter, ArrowUpDown, MapPin, IndianRupee, Clock, ChevronLeft, ChevronRight, Lock, ShieldAlert, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { tasks as initialTasks, currentUser } from '../data/dummy';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import api from '../services/api';
import { showConfirm, showToast } from '../utils/swal';

import KycBanner from '../components/KycBanner';

export default function FindTasks() {
  const navigate = useNavigate();
  const [taskList, setTaskList] = useState([]);

  // Load User Profile & KYC Status State
  const [kycStatusState, setKycStatusState] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
      return p.kycStatus || currentUser.kyc || 'Pending';
    } catch(e) {
      return currentUser.kyc || 'Pending';
    }
  });

  const userProfile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
    } catch(e) {
      return {};
    }
  }, []);

  const isKycVerified = kycStatusState === 'Verified';

  React.useEffect(() => {
    const customTasks = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]').map(t => ({
      id: t.id,
      title: t.title,
      brand: t.brand || 'Partner Brand',
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
      image: t.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      eligibility: ['Country: India 🇮🇳', 'KYC Verified'],
      startDate: t.startDate || '2026-09-01',
      endDate: t.endDate || '2026-09-30',
      targetPincode: t.targetPincode || 'All',
      targetState: t.targetState || 'All',
      targetInterest: t.targetInterest || 'All'
    }));

    api.user.getFindTasks()
      .then(res => {
        const apiList = Array.isArray(res) ? res : res.tasks || [];
        const fetchedTasks = apiList.map(t => ({
          id: t.id,
          title: t.title,
          brand: t.brand || 'Partner Brand',
          category: t.category || t.type || 'Field Audit',
          country: 'India',
          countryFlag: '🇮🇳',
          platform: 'Physical Outlet',
          actionType: t.category || t.type || 'Audit',
          city: t.location || 'Pan-India',
          distance: '1.2 km',
          reward: parseFloat(t.reward_per_task) || 350,
          duration: t.duration || '20 mins',
          slots: (t.quota || t.target_quota || 50) - (t.completed_count || 0),
          status: 'Available',
          image: t.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          eligibility: ['Country: India 🇮🇳', 'KYC Verified'],
          startDate: t.startDate || '2026-09-01',
          endDate: t.endDate || '2026-09-30',
          targetPincode: t.targetPincode || 'All',
          targetState: t.targetState || 'All',
          targetInterest: t.targetInterest || 'All'
        }));

        const combined = [...fetchedTasks];
        customTasks.forEach(ct => {
          if (!combined.some(ft => String(ft.id) === String(ct.id))) {
            combined.push(ct);
          }
        });
        setTaskList(combined.length > 0 ? combined : customTasks);
      })
      .catch(() => {
        setTaskList(customTasks);
      });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [targetFilter, setTargetFilter] = useState('All'); // 'All' | 'Matched'
  const [sortBy, setSortBy] = useState('reward');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const categories = ['All', 'Mystery Audit', 'Social Media', 'E-commerce', 'Google Rating & Review', 'IMDb & Movie Rating', 'Survey'];

  // Check if task matches user location/interests
  const isTaskMatched = (task) => {
    const userPin = (userProfile.pincode || '').toLowerCase();
    const userState = (userProfile.state || '').toLowerCase();
    const userCountry = (userProfile.country || 'India').toLowerCase();
    const userInterests = (userProfile.interests || []).map(i => i.toLowerCase());

    const checkMatch = (valArrOrStr, targetUserVal) => {
      if (!valArrOrStr) return true;
      if (!targetUserVal) return true;
      if (Array.isArray(valArrOrStr)) {
        if (valArrOrStr.length === 0 || valArrOrStr.some(v => String(v).startsWith('All'))) return true;
        return valArrOrStr.some(v => String(v).toLowerCase().includes(targetUserVal));
      }
      if (typeof valArrOrStr === 'string') {
        if (valArrOrStr.startsWith('All')) return true;
        return valArrOrStr.toLowerCase().includes(targetUserVal);
      }
      return true;
    };

    const countryMatch = checkMatch(task.targetCountries || task.targetCountry, userCountry);
    const stateMatch = checkMatch(task.targetStates || task.targetState, userState);
    const pinMatch = checkMatch(task.targetPincodes || task.targetPincode, userPin);

    const interestArr = task.targetInterests || task.targetInterest;
    let interestMatch = true;
    if (interestArr) {
      if (Array.isArray(interestArr)) {
        if (!interestArr.some(i => String(i).startsWith('All'))) {
          interestMatch = interestArr.some(i => userInterests.includes(String(i).toLowerCase()) || userInterests.includes(String(task.category).toLowerCase()));
        }
      } else if (typeof interestArr === 'string' && !interestArr.startsWith('All')) {
        interestMatch = interestArr.toLowerCase().includes(String(task.category).toLowerCase());
      }
    }

    return (countryMatch && stateMatch && pinMatch) || interestMatch;
  };

  const filteredTasks = useMemo(() => {
    return taskList.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        t.title.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        (t.platform && t.platform.toLowerCase().includes(q)) ||
        (t.city && t.city.toLowerCase().includes(q))
      );

      const matchesCat = categoryFilter === 'All' || 
        t.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesTarget = targetFilter === 'All' || isTaskMatched(t);

      return matchesSearch && matchesCat && matchesTarget;
    });
  }, [taskList, searchQuery, categoryFilter, targetFilter, userProfile]);

  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (sortBy === 'reward') {
      list.sort((a, b) => b.reward - a.reward);
    } else if (sortBy === 'slots') {
      list.sort((a, b) => b.slots - a.slots);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filteredTasks, sortBy]);

  const totalPages = Math.ceil(sortedTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTasks.slice(start, start + pageSize);
  }, [sortedTasks, currentPage, pageSize]);

  const handleTaskClick = (e, taskId) => {
    if (!isKycVerified) {
      e.preventDefault();
      showConfirm(
        'KYC Verification Required 🔒',
        'Your KYC status is currently pending. Please complete your KYC verification (Aadhaar / PAN) in your profile to unblur and accept tasks.'
      ).then(confirmed => {
        if (confirmed) navigate('/user/profile');
      });
    }
  };

  return (
    <AppLayout title='Find Available Tasks & Audits'>
      {/* Non-KYC Alert Banner */}
      {!isKycVerified && (
        <KycBanner 
          kycStatus={kycStatusState} 
          onStatusChange={(newStatus) => setKycStatusState(newStatus)}
        />
      )}

      {/* Matching & Category Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div className='tabs' style={{ margin: 0 }}>
          {categories.map(c => (
            <span 
              key={c} 
              className={categoryFilter === c ? 'active' : ''} 
              onClick={() => { setCategoryFilter(c); setCurrentPage(1); }}
            >
              {c}
            </span>
          ))}
        </div>

        {/* Location & Interest Targeted Filter Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={targetFilter === 'All' ? 'primary' : 'ghost'} 
            onClick={() => setTargetFilter('All')}
            style={{ fontSize: '12.5px', padding: '6px 14px', borderRadius: '8px' }}
          >
            Show All Tasks
          </button>
          <button 
            className={targetFilter === 'Matched' ? 'primary' : 'ghost'} 
            onClick={() => setTargetFilter('Matched')}
            style={{ fontSize: '12.5px', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} color="#f59e0b" /> Matched for My Address & Interests
          </button>
        </div>
      </div>

      {/* Advanced Toolbar */}
      <div className='advancedToolbar' style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div className='searchBox' style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search task title, brand, platform (e.g. Samsung, Instagram, Amazon, Flipkart)..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 0, padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', fontSize: '13.5px' }}
          />
        </div>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', outline: 'none', fontWeight: 600 }}
        >
          <option value="reward">Sort: Reward (High to Low)</option>
          <option value="slots">Sort: Slots Available</option>
          <option value="title">Sort: Title (A-Z)</option>
        </select>
      </div>

      {/* Tasks Grid */}
      <div className='taskGrid'>
        {paginatedTasks.map(t => {
          const isMatched = isTaskMatched(t);
          const today = new Date().toISOString().slice(0, 10);
          const isExpired = t.endDate && t.endDate < today;

          return (
            <Card key={t.id} className='taskCard' style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Image Container with Blur if unverified */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={t.image} 
                  alt={t.title} 
                  style={{ 
                    filter: !isKycVerified ? 'blur(6px)' : 'none', 
                    transition: 'filter 0.3s ease' 
                  }} 
                />
                {!isKycVerified && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', padding: '10px', textAlign: 'center'
                  }}>
                    <Lock size={24} style={{ marginBottom: '4px' }} />
                    <b style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KYC Locked</b>
                  </div>
                )}
                {isMatched && (
                  <div style={{
                    position: 'absolute', top: '10px', left: '10px', background: '#0284c7', color: '#fff',
                    padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Sparkles size={12}/> Targeted Match
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

                {/* Start & Expiry Timing Pills */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: '8px 0', fontSize: '11.5px', color: '#64748b' }}>
                  <Calendar size={13} color="#64748b" />
                  <span>Starts: <b>{t.startDate || '01 Sep'}</b></span>
                  <span>•</span>
                  <span style={{ color: isExpired ? '#e11d48' : '#059669', fontWeight: 600 }}>
                    {isExpired ? '🔴 Expired' : `⌛ Expires: ${t.endDate || '30 Sep'}`}
                  </span>
                </div>

                {/* Eligibility Requirements Badges */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '8px 0 12px' }}>
                  {t.eligibility?.map(req => (
                    <span 
                      key={req} 
                      style={{ 
                        background: '#f1f5f9', 
                        color: '#334155', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        padding: '3px 8px', 
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      ✓ {req}
                    </span>
                  ))}
                </div>

                <div className='meta'>{t.slots} slots left</div>
                
                <Link 
                  className='primary full center' 
                  to={`/user/tasks/${t.id}`}
                  onClick={(e) => handleTaskClick(e, t.id)}
                  style={{ background: !isKycVerified ? '#94a3b8' : undefined }}
                >
                  {!isKycVerified ? '🔒 Complete KYC to View Task' : 'View Task & Requirements'}
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {paginatedTasks.length === 0 && (
        <Card style={{ padding: '32px', textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
          No tasks found matching your search or location/interest filters.
        </Card>
      )}

      {/* Pagination Bar */}
      <div style={{ marginTop: '20px' }}>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedTasks.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </AppLayout>
  );
}
