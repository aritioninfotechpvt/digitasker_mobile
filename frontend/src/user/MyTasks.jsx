import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { tasks as initialTasks } from '../data/dummy';
import { Card, Badge } from '../components/ui';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import api from '../services/api';

const defaultSampleTasks = [
  {
    id: 'sample-sub-1',
    task_code: 'SUB-6938',
    title: 'Google Rating & Review',
    brand: 'DigiLites Studio',
    category: 'Google Rating & Review',
    city: 'Chandigarh, NCR',
    duration: '25 minutes',
    reward: 30,
    image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
    status: 'Under Review',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    country: 'India',
    countryFlag: '🇮🇳'
  },
  {
    id: 'sample-prog-1',
    task_code: 'TSK-3869',
    title: 'Retail Store Mystery Audit',
    brand: 'Samsung',
    category: 'Mystery Audit',
    city: 'Chandigarh, NCR',
    duration: '25 minutes',
    reward: 350,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    status: 'In Progress',
    country: 'India',
    countryFlag: '🇮🇳'
  },
  {
    id: 'sample-app-1',
    task_code: 'SUB-1029',
    title: 'Social Media Like & Follow Campaign',
    brand: 'Lifestyle Brand',
    category: 'Social Media',
    city: 'Online Task',
    duration: '5 minutes',
    reward: 50,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    status: 'Approved',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    country: 'India',
    countryFlag: '🇮🇳'
  }
];

const loadAllUserTasks = (backendTasks = []) => {
  const userSubmissions = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
  const userBooked = JSON.parse(localStorage.getItem('digitasker_user_booked_tasks') || '[]');
  const customTasks = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]');

  // 1. User Submissions (Highest priority - status 'Under Review' or submitted state)
  const submittedItems = userSubmissions.map(s => ({
    id: s.id || s.submissionCode || Date.now(),
    task_code: s.task_code || s.submissionCode || `SUB-${s.id}`,
    title: s.title || 'Google Rating & Review',
    brand: s.brand || 'DigiLites Studio',
    category: s.category || 'Google Rating & Review',
    city: s.city || s.location || 'Chandigarh, NCR',
    duration: s.duration || '25 minutes',
    reward: parseFloat(s.reward) || 30,
    image: s.image || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
    status: s.status || 'Under Review',
    submittedAt: s.submittedAt || new Date().toISOString(),
    country: s.country || 'India',
    countryFlag: s.countryFlag || '🇮🇳'
  }));

  // 2. Booked Tasks (In Progress)
  const bookedItems = userBooked.map(b => ({
    id: b.id,
    task_code: b.task_code || `TSK-${b.id}`,
    title: b.title,
    brand: b.brand || 'DigiLites Studio',
    category: b.category || 'Google Rating & Review',
    city: b.city || 'Chandigarh, NCR',
    duration: b.duration || '25 minutes',
    reward: parseFloat(b.reward) || 30,
    image: b.image || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
    status: 'In Progress',
    country: 'India',
    countryFlag: '🇮🇳'
  }));

  // 3. Custom Platform Tasks
  const customItems = customTasks.map(ct => ({
    id: ct.id,
    task_code: ct.task_code || `TSK-${ct.id}`,
    title: ct.title,
    brand: ct.brand || 'DigiLites Studio',
    category: ct.category || 'Google Rating & Review',
    city: ct.location || 'Chandigarh, NCR',
    duration: ct.duration || '25 minutes',
    reward: parseFloat(ct.reward) || 30,
    image: ct.image || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
    status: 'In Progress',
    country: 'India',
    countryFlag: '🇮🇳'
  }));

  // 4. API Tasks from Backend
  const apiItems = (Array.isArray(backendTasks) ? backendTasks : []).map(t => ({
    id: t.id,
    task_code: t.task_code || `TSK-${t.id}`,
    title: t.title,
    brand: t.brand || 'Partner Brand',
    category: t.category || t.type || 'Field Audit',
    city: t.location || 'Chandigarh, NCR',
    duration: t.duration || '20 mins',
    reward: parseFloat(t.reward_per_task) || 350,
    image: t.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    status: 'In Progress',
    country: 'India',
    countryFlag: '🇮🇳'
  }));

  const combined = [...submittedItems];

  const addIfMissing = (item) => {
    if (!combined.some(c => String(c.id) === String(item.id) || c.title === item.title)) {
      combined.push(item);
    }
  };

  bookedItems.forEach(addIfMissing);
  customItems.forEach(addIfMissing);
  apiItems.forEach(addIfMissing);
  initialTasks.forEach(addIfMissing);
  defaultSampleTasks.forEach(addIfMissing);

  return combined;
};

export default function MyTasks() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => location.state?.tab || 'Under Review');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('reward');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [taskList, setTaskList] = useState(() => loadAllUserTasks([]));

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchFreshTasks = async () => {
      try {
        const res = await api.admin.getTasks();
        if (Array.isArray(res)) {
          setTaskList(loadAllUserTasks(res));
        } else {
          setTaskList(loadAllUserTasks([]));
        }
      } catch (err) {
        // Fallback gracefully to local storage submissions & custom tasks
        setTaskList(loadAllUserTasks([]));
      }
    };
    fetchFreshTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return taskList.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        t.title.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q))
      );

      let matchesTab = true;
      const st = (t.status || '').toLowerCase();
      if (activeTab === 'In Progress') {
        matchesTab = st === 'in progress' || st === 'available' || st === 'active';
      } else if (activeTab === 'Under Review') {
        matchesTab = st.includes('under review') || st.includes('pending') || st.includes('review') || st.includes('revision resubmitted') || st.includes('revision submitted');
      } else if (activeTab === 'Revisions') {
        matchesTab = st.includes('revision requested') || st.includes('needs revision') || st.includes('revision');
      } else if (activeTab === 'Completed') {
        matchesTab = st === 'approved' || st === 'completed';
      }

      return matchesSearch && matchesTab;
    });
  }, [taskList, searchQuery, activeTab]);

  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (sortBy === 'reward') {
      list.sort((a, b) => b.reward - a.reward);
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

  return (
    <AppLayout title='My Tasks'>
      <div className='row between' style={{ marginBottom: '16px' }}>
        <div className='tabs' style={{ marginBottom: 0 }}>
          {[
            { label: 'All', key: 'All' },
            { label: 'In Progress', key: 'In Progress' },
            { label: 'Under Review', key: 'Under Review' },
            { label: 'Completed', key: 'Completed' }
          ].map(tab => (
            <span
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            >
              {tab.label}
            </span>
          ))}
        </div>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12.5px', outline: 'none', fontWeight: 600 }}
        >
          <option value="reward">Sort: Highest Reward</option>
          <option value="title">Sort: Task Title (A-Z)</option>
        </select>
      </div>

      <div className='searchBox' style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px', marginBottom: '16px' }}>
        <Search size={16} color="#64748b" />
        <input 
          type="text" 
          placeholder="Search my tasks by title, brand, platform..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          style={{ border: 0, padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', fontSize: '13px' }}
        />
      </div>

      <div className='stack'>
        {paginatedTasks.map(t => {
          const isResubmitted = t.status === 'Revision Resubmitted' || t.status === 'Revision Submitted';
          const isRevision = !isResubmitted && (t.status === 'Revision Requested' || t.status === 'Needs Revision');
          const isUnderReview = !isRevision && !isResubmitted && (t.status === 'Under Review' || t.status === 'Pending Verification' || t.status === 'In Review' || t.status === 'Pending');
          const isApproved = t.status === 'Approved' || t.status === 'Completed';

          return (
            <Card key={t.id} className='listCard'>
              <img src={t.image || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80'} alt={t.title} />
              <div className='grow'>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge green">{t.countryFlag || '🌐'} {t.country || 'Global'}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: isApproved ? '#dcfce7' : isResubmitted ? '#dbeafe' : isRevision ? '#fee2e2' : isUnderReview ? '#fef3c7' : '#e0f2fe',
                    color: isApproved ? '#15803d' : isResubmitted ? '#1d4ed8' : isRevision ? '#dc2626' : isUnderReview ? '#b45309' : '#0369a1'
                  }}>
                    {isApproved ? '✓ Approved & Paid' : isResubmitted ? '🔄 Revision Resubmitted' : isRevision ? '⚠️ Revision Requested' : isUnderReview ? '⏳ Under QA Review' : t.status}
                  </span>
                </div>
                <h3>{t.title}</h3>
                <p>{t.brand} · {t.city || 'Chandigarh, NCR'} ({t.duration})</p>
                <div style={{ display: 'flex', gap: '6px', margin: '6px 0 0', flexWrap: 'wrap' }}>
                  <span style={{ background: '#f8fafc', color: '#475569', fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    ✓ Category: {t.category || 'Audit'}
                  </span>
                  {t.submittedAt && (
                    <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px' }}>
                      Submitted: {new Date(t.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <b className='money' style={{ fontSize: '14px' }}>₹{t.reward}</b>
                <Link to={`/user/tasks/${t.id}/complete`} className='primary smallBtn' style={{ background: isResubmitted ? '#1d4ed8' : isRevision ? '#ea580c' : isUnderReview ? '#64748b' : '#0066ff' }}>
                  {isApproved ? 'View Proof' : isResubmitted ? 'Resubmitted (Reviewing)' : isRevision ? 'Re-submit Evidence →' : isUnderReview ? 'Submitted (Reviewing)' : 'Continue Task'} <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          );
        })}

        {paginatedTasks.length === 0 && (
          <Card style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No tasks found matching your active tab or search query.
          </Card>
        )}
      </div>

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
