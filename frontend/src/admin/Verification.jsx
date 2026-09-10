import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { submissions as initialSubmissions } from '../data/dummy';
import { Card, Badge } from '../components/ui';
import { Search, Filter, CheckCircle2, RotateCcw, XCircle, ArrowUpRight, Eye } from 'lucide-react';
import { showSuccess, showConfirm, showPrompt, showToast } from '../utils/swal';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import api from '../services/api';
import { addUserNotification } from '../utils/notifications';

export default function Verification() {
  const navigate = useNavigate();
  const [submissionsList, setSubmissionsList] = useState([]);

  const loadSubmissions = () => {
    const localUserSubmissions = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const notesMap = JSON.parse(localStorage.getItem('digitasker_admin_revision_notes') || '{}');
    
    const mappedLocal = localUserSubmissions.map(s => {
      const subId = s.submissionCode || `SUB-${s.id}`;
      const revNote = notesMap[subId] || notesMap[s.id] || s.revisionNote || (s.status?.toLowerCase().includes('revision') ? 'Please re-upload clearer evidence screenshot as requested by QC Auditor.' : '');
      return {
        id: subId,
        raw_id: s.id,
        task: s.title || 'Audit Task',
        user: s.user || 'User Account (Auditor)',
        city: s.city || 'Chandigarh, NCR',
        risk: s.risk || 'Low',
        status: s.status === 'Under Review' ? 'Pending QC' : (s.status || 'Pending QC'),
        submitted: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        reward: s.reward || 300,
        evidence: s.evidence || {},
        answers: s.answers || {},
        image: s.image,
        revisionNote: revNote
      };
    });

    const defaultSamples = [
      {
        id: 'SUB-4178',
        raw_id: 4178,
        task: 'Digilites Studio · Google Rating & Review',
        user: 'User Account (Auditor)',
        city: 'Chandigarh, NCR',
        risk: 'Low',
        status: 'Revision Requested',
        revisionNote: notesMap['SUB-4178'] || notesMap[4178] || 'Review screenshot missing profile handle name. Please re-upload photo showing your 5-star Google review and handle.',
        submitted: new Date().toLocaleDateString(),
        reward: 30,
        evidence: {},
        answers: {}
      },
      {
        id: 'SUB-2455',
        raw_id: 2455,
        task: 'Mumbai Premium Mall Staff Courtesy Audit',
        user: 'Rahul Mehta',
        city: 'Mumbai Metro',
        risk: 'Low',
        status: 'Pending QC',
        revisionNote: notesMap['SUB-2455'] || notesMap[2455] || '',
        submitted: new Date(Date.now() - 86400000).toLocaleDateString(),
        reward: 350,
        evidence: {},
        answers: {}
      },
      {
        id: 'SUB-8921',
        raw_id: 8921,
        task: 'Samsung Store Display & POS Checklist',
        user: 'Priya Sharma',
        city: 'Delhi NCR',
        risk: 'Medium',
        status: 'Revision Requested',
        revisionNote: notesMap['SUB-8921'] || notesMap[8921] || 'Store invoice receipt photo is dark and unreadable. Please attach a clear, illuminated tax invoice copy.',
        submitted: new Date(Date.now() - 172800000).toLocaleDateString(),
        reward: 500,
        evidence: {},
        answers: {}
      }
    ];

    api.admin.getQCQueue()
      .then(res => {
        let apiMapped = [];
        if (res.submissions && res.submissions.length > 0) {
          apiMapped = res.submissions.map(s => {
            const subId = s.submission_code || `SUB-${s.id}`;
            return {
              id: subId,
              raw_id: s.id,
              task: s.task?.title || 'Mystery Audit',
              user: s.user?.name || s.user_name || 'Auditor',
              city: s.vendor?.coverage_area || 'Chandigarh',
              risk: parseFloat(s.score) >= 90 ? 'Low' : 'Medium',
              status: s.qc_status || s.first_decision || 'Pending QC',
              revisionNote: notesMap[subId] || notesMap[s.id] || '',
              submitted: new Date(s.created_at).toLocaleDateString(),
              reward: 350
            };
          });
        }
        
        const combined = [...mappedLocal];
        apiMapped.forEach(a => {
          if (!combined.some(c => c.id === a.id)) combined.push(a);
        });
        defaultSamples.forEach(d => {
          if (!combined.some(c => c.id === d.id)) combined.push(d);
        });

        setSubmissionsList(combined.length > 0 ? combined : defaultSamples);
      })
      .catch(() => {
        const combined = [...mappedLocal];
        defaultSamples.forEach(d => {
          if (!combined.some(c => c.id === d.id)) combined.push(d);
        });
        setSubmissionsList(combined);
      });
  };

  React.useEffect(() => {
    loadSubmissions();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'Revision' | 'Disputed'
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState('submitted');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const updateLocalStorageSubmissionStatus = (submissionId, newStatus, revisionNote = '') => {
    const userSubs = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const notesMap = JSON.parse(localStorage.getItem('digitasker_admin_revision_notes') || '{}');

    if (revisionNote) {
      notesMap[submissionId] = revisionNote;
      localStorage.setItem('digitasker_admin_revision_notes', JSON.stringify(notesMap));
    }

    const updated = userSubs.map(u => {
      if (u.submissionCode === submissionId || String(u.id) === String(submissionId) || `SUB-${u.id}` === submissionId) {
        return { 
          ...u, 
          status: newStatus,
          ...(revisionNote ? { revisionNote } : {})
        };
      }
      return u;
    });
    localStorage.setItem('digitasker_user_submissions', JSON.stringify(updated));
  };

  const handleApprove = async (s) => {
    const confirmed = await showConfirm(
      `Approve Submission ${s.id}?`,
      `This will credit ₹${s.reward} to ${s.user} wallet and mark task completed.`
    );
    if (confirmed) {
      if (s.raw_id) {
        try { await api.admin.reviewQC(s.raw_id, 'Approved', 'Approved by QC Admin'); } catch(e){}
      }
      updateLocalStorageSubmissionStatus(s.id, 'Approved');
      setSubmissionsList(submissionsList.map(item => item.id === s.id ? { ...item, status: 'Approved' } : item));
      showSuccess('Submission Approved! ✅', `₹${s.reward} credited to ${s.user} wallet.`);
    }
  };

  const handleRevision = async (s) => {
    const reason = await showPrompt('Request Revision', 'Specify what the auditor needs to resubmit:', 'Please re-upload a clearer receipt photo');
    if (reason) {
      updateLocalStorageSubmissionStatus(s.id, 'Revision Requested', reason);
      addUserNotification({ submissionId: s.id, taskTitle: s.task, reason });
      setSubmissionsList(submissionsList.map(item => item.id === s.id ? { ...item, status: 'Revision Requested', revisionNote: reason } : item));
      try { await api.admin.reviewQC(s.raw_id || s.id, 'Revision Requested', reason); } catch(e){}
      showSuccess('Revision Requested', `Auditor notified: "${reason}"`);
    }
  };

  const handleReject = async (s) => {
    const reason = await showPrompt('Reject Submission', 'Reason for rejection:', 'Store location mismatch');
    if (reason) {
      updateLocalStorageSubmissionStatus(s.id, 'Rejected');
      setSubmissionsList(submissionsList.map(item => item.id === s.id ? { ...item, status: 'Rejected' } : item));
      showToast(`Submission ${s.id} rejected.`);
    }
  };

  const filteredSubmissions = useMemo(() => {
    let result = submissionsList.filter(s => {
      const matchesSearch = 
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase());

      const statusLower = (s.status || '').toLowerCase();
      let matchesTab = activeTab === 'All';
      if (activeTab === 'Pending') {
        matchesTab = statusLower.includes('pending') || statusLower.includes('under review') || statusLower.includes('qc') || statusLower.includes('resubmitted');
      } else if (activeTab === 'Revision') {
        matchesTab = statusLower.includes('revision');
      } else if (activeTab === 'Disputed') {
        matchesTab = statusLower.includes('dispute') || statusLower.includes('reject');
      }

      const matchesRisk = riskFilter === 'All' || s.risk.toLowerCase() === riskFilter.toLowerCase();

      return matchesSearch && matchesTab && matchesRisk;
    });

    result.sort((a, b) => {
      if (sortBy === 'reward') return b.reward - a.reward;
      if (sortBy === 'risk') return a.risk.localeCompare(b.risk);
      return 0; // default submitted order
    });

    return result;
  }, [submissionsList, searchQuery, activeTab, riskFilter, sortBy]);

  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage, pageSize]);

  return (
    <AppLayout role='admin' title='Submission Verification'>
      {/* Top Tabs */}
      <div className='tabs' style={{ marginBottom: '16px' }}>
        {['All', 'Pending', 'Revision', 'Disputed'].map(tab => (
          <b 
            key={tab} 
            className={activeTab === tab ? 'active' : ''}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}
          >
            {tab} ({tab === 'All' ? submissionsList.length : submissionsList.filter(s => s.status.toLowerCase().includes(tab.toLowerCase())).length})
          </b>
        ))}
      </div>

      {/* Toolbar */}
      <div className="tableToolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="searchBox" style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px' }}>
          <Search size={16} color="#64748b" />
          <input 
            placeholder="Search submission ID, auditor, task..." 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 0, outline: 'none', width: '100%', padding: '8px 0', fontSize: '13px' }}
          />
        </div>

        <select 
          value={riskFilter} 
          onChange={e => { setRiskFilter(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}
        >
          <option value="All">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>

        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}
        >
          <option value="submitted">Sort: Latest</option>
          <option value="reward">Sort: Highest Reward</option>
          <option value="risk">Sort: Risk Level</option>
        </select>
      </div>

      {/* Submissions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paginatedSubmissions.length === 0 ? (
          <Card style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <p>No submissions match your filters.</p>
          </Card>
        ) : (
          paginatedSubmissions.map(s => (
            <Card className='verifyCard' key={s.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <Badge tone={s.risk === 'Low' ? 'green' : s.risk === 'Medium' ? 'orange' : 'red'}>{s.risk} Risk</Badge>
                  <Badge tone={s.status === 'Approved' ? 'green' : s.status === 'Rejected' ? 'red' : s.status === 'Revision Resubmitted' ? 'purple' : 'orange'}>{s.status}</Badge>
                </div>
                <h3 style={{ margin: '4px 0', fontSize: '13.5px' }}>{s.id} · {s.task}</h3>
                <p className="muted" style={{ margin: 0, fontSize: '12.5px' }}>{s.user} · {s.city} · Submitted {s.submitted}</p>
                
                <div className='evidenceThumbs' style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  {['📷 Front Store', '📷 Interior', '📄 Invoice', '🎥 Video'].map((thumb, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
                      {thumb}
                    </span>
                  ))}
                </div>

                {(s.revisionNote || s.status?.toLowerCase().includes('revision')) && (
                  <div style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginTop: '10px',
                    fontSize: '12px',
                    color: '#9a3412',
                    lineHeight: '1.4'
                  }}>
                    <b>💬 Admin Revision Note Sent to Auditor:</b> "{s.revisionNote || 'Please re-upload a clearer screenshot/invoice showing your profile handle and date.'}"
                  </div>
                )}
              </div>

              <div className='verifyActions' style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <b className='money' style={{ fontSize: '14px', color: '#059669' }}>₹{s.reward}</b>
                <button className='ghost' onClick={() => navigate(`/admin/verification/${s.id}`, { state: { submission: s } })} title="Detailed Review">
                  <Eye size={15} /> Inspect
                </button>
                <button className='ghost' onClick={() => handleRevision(s)}>
                  Revision
                </button>
                <button className='danger' onClick={() => handleReject(s)} style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                  Reject
                </button>
                <button className='primary' onClick={() => handleApprove(s)}>
                  Approve
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={Math.ceil(filteredSubmissions.length / pageSize)}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalItems={filteredSubmissions.length}
      />
    </AppLayout>
  );
}
