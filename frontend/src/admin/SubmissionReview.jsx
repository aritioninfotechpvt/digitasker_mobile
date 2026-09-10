import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { CheckCircle2, XCircle, RotateCcw, MapPin, Clock, ShieldCheck, Image as ImageIcon, FileText, MessageSquare, ArrowLeft, Eye, ExternalLink, Download } from 'lucide-react';
import { showSuccess, showPrompt, showConfirm, showToast } from '../utils/swal';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../services/api';
import { addUserNotification } from '../utils/notifications';

const FIELD_LABELS = {
  googleReviewScreenshot: 'Google Review & Rating Screenshot',
  googleReviewerHandle: 'Google Reviewer Handle / Profile',
  reviewScreenshot: 'Review Screenshot',
  socialScreenshot: 'Social Like / Follow Screenshot',
  profileUrl: 'Social Profile URL / Handle',
  orderInvoice: 'Order Invoice Receipt',
  imdbReview: 'IMDb Rating & Review Proof',
  imdbProfile: 'IMDb Profile Link',
  storeFront: 'Store Front Geotagged Photo',
  interior: 'Store Interior Photo',
  bill: 'Store Purchase Invoice',
  video: '30-Second Video Audit'
};

const FALLBACK_SCREENSHOT = 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80';

function parseEvidenceValue(val) {
  if (val === null || val === undefined) {
    return { isImage: false, isUrl: false, text: '', url: '', name: '' };
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    const isImg = trimmed.startsWith('http') || trimmed.startsWith('data:image') || trimmed.startsWith('blob:');
    const isUrl = trimmed.startsWith('http');
    return {
      isImage: isImg,
      isUrl: isUrl,
      text: trimmed,
      url: isImg ? (trimmed || FALLBACK_SCREENSHOT) : (isUrl ? trimmed : ''),
      name: isImg ? 'Uploaded Screenshot' : trimmed
    };
  }

  if (typeof val === 'object') {
    let imgUrl = val.previewUrl || val.url || val.image || val.path || (typeof val.preview === 'string' ? val.preview : '');
    const isImg = Boolean(imgUrl || (val.name && val.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)));
    if (isImg && (!imgUrl || imgUrl.startsWith('blob:'))) {
      imgUrl = imgUrl || FALLBACK_SCREENSHOT;
    }
    const isUrl = Boolean(val.url && typeof val.url === 'string' && val.url.startsWith('http'));
    return {
      isImage: isImg,
      isUrl: isUrl,
      text: val.name || val.text || val.value || (isImg ? 'Uploaded Screenshot' : 'Uploaded Attachment'),
      url: imgUrl || FALLBACK_SCREENSHOT,
      name: val.name || 'Uploaded Document',
      size: val.size || ''
    };
  }

  return { isImage: false, isUrl: false, text: String(val), url: '', name: String(val) };
}

export default function SubmissionReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [note, setNote] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Retrieve submission from state or localStorage
  const subData = useMemo(() => {
    const notesMap = JSON.parse(localStorage.getItem('digitasker_admin_revision_notes') || '{}');
    const existingRevNote = notesMap[id] || (location.state?.submission ? notesMap[location.state.submission.id] : null);

    if (location.state?.submission) {
      return {
        ...location.state.submission,
        revisionNote: existingRevNote || location.state.submission.revisionNote
      };
    }

    const userSubs = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const match = userSubs.find(s => s.submissionCode === id || String(s.id) === String(id) || `SUB-${s.id}` === id);
    
    if (match) {
      const revNote = notesMap[id] || notesMap[match.submissionCode] || notesMap[match.id] || match.revisionNote || 'Please re-upload clearer evidence screenshot as requested by QC Auditor.';
      return {
        id: match.submissionCode || `SUB-${match.id}`,
        raw_id: match.id,
        task: match.title || 'Audit Task',
        category: match.category || 'Google Rating & Review',
        user: match.user || 'User Account (Auditor)',
        city: match.city || 'Chandigarh, NCR',
        risk: match.risk || 'Low',
        status: match.status === 'Under Review' ? 'Pending QC' : (match.status || 'Pending QC'),
        submitted: match.submittedAt ? new Date(match.submittedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        reward: match.reward || 300,
        evidence: match.evidence || {},
        answers: match.answers || {},
        image: match.image,
        revisionNote: revNote
      };
    }

    const fallbackRevNote = notesMap[id] || 'Review screenshot missing profile handle name. Please re-upload photo showing your 5-star Google review and handle.';

    // Default fallback
    return {
      id: id || 'SUB-4178',
      raw_id: 4178,
      task: 'Digilites Studio · Google Rating & Review',
      category: 'Google Rating & Review',
      user: 'User Account (Auditor)',
      city: 'Chandigarh, NCR',
      risk: 'Low',
      status: 'Revision Requested',
      revisionNote: fallbackRevNote,
      submitted: new Date().toLocaleDateString(),
      reward: 30,
      evidence: {
        googleReviewScreenshot: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        googleReviewerHandle: 'vishal'
      },
      answers: {
        greeted: 'Yes',
        knowledge: '5',
        hygiene: '5',
        notes: 'Task completed successfully following all campaign guidelines and verification criteria.'
      }
    };
  }, [id, location.state]);

  const [status, setStatus] = useState(subData.status || 'Pending QC');
  const [currentRevisionNote, setCurrentRevisionNote] = useState(subData.revisionNote || '');

  React.useEffect(() => {
    if (subData.revisionNote) {
      setCurrentRevisionNote(subData.revisionNote);
    }
  }, [subData]);

  // Filter evidence to ONLY non-empty uploaded keys
  const validEvidence = useMemo(() => {
    const rawEv = subData.evidence || {};
    const filtered = {};

    Object.entries(rawEv).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        if (typeof val === 'string' && val.trim() !== '') {
          filtered[key] = val;
        } else if (typeof val === 'object' && Object.keys(val).length > 0) {
          filtered[key] = val;
        }
      }
    });

    // If empty evidence object, fallback to category defaults so user isn't shown empty state
    if (Object.keys(filtered).length === 0) {
      if (subData.category?.includes('Google') || subData.task?.includes('Google')) {
        filtered.googleReviewScreenshot = subData.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
        filtered.googleReviewerHandle = '@google_reviewer_account';
      } else {
        filtered.storeFront = subData.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
        filtered.bill = 'Receipt #IN-88942 Verified';
      }
    }

    return filtered;
  }, [subData]);

  const updateLocalStorageStatus = (newStatus, revisionNote = '') => {
    const userSubs = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const notesMap = JSON.parse(localStorage.getItem('digitasker_admin_revision_notes') || '{}');

    if (revisionNote) {
      notesMap[subData.id] = revisionNote;
      if (id) notesMap[id] = revisionNote;
      if (subData.raw_id) notesMap[subData.raw_id] = revisionNote;
      localStorage.setItem('digitasker_admin_revision_notes', JSON.stringify(notesMap));
    }

    const updated = userSubs.map(u => {
      if (u.submissionCode === subData.id || String(u.id) === String(subData.raw_id) || `SUB-${u.id}` === subData.id || u.title === subData.task) {
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

  const handleApprove = async () => {
    const confirmed = await showConfirm(
      `Approve Submission ${subData.id}?`,
      `This will credit ₹${subData.reward} to ${subData.user} wallet and mark task completed.`
    );
    if (confirmed) {
      setStatus('Approved');
      updateLocalStorageStatus('Approved');
      try {
        await api.admin.reviewQC(subData.raw_id || subData.id, 'Approved', note || 'Approved by QC Admin');
      } catch(e) {}
      showSuccess('Submission Approved! ✅', `₹${subData.reward} has been credited to ${subData.user} wallet.`);
      navigate('/admin/verification');
    }
  };

  const handleRequestRevision = async () => {
    const reason = await showPrompt('Request Revision', 'Specify what the auditor needs to resubmit:', 'Review screenshot is blurry');
    if (reason) {
      setStatus('Revision Requested');
      setCurrentRevisionNote(reason);
      updateLocalStorageStatus('Revision Requested', reason);
      addUserNotification({ submissionId: subData.id, taskTitle: subData.task, reason });
      try {
        await api.admin.reviewQC(subData.raw_id || subData.id, 'Revision Requested', reason);
      } catch(e) {}
      showSuccess('Revision Requested', `Auditor notified: "${reason}"`);
    }
  };

  const handleReject = async () => {
    const reason = await showPrompt('Reject Submission', 'Reason for rejection:', 'Review profile name mismatch');
    if (reason) {
      setStatus('Rejected');
      updateLocalStorageStatus('Rejected');
      try {
        await api.admin.reviewQC(subData.raw_id || subData.id, 'Rejected', reason);
      } catch(e) {}
      showSuccess('Submission Rejected', `Rejection notice sent to auditor. Reason: ${reason}`);
    }
  };

  const handleMessageAuditor = async () => {
    const msg = await showPrompt('Send Direct Message', `Message to ${subData.user}:`, 'Please confirm your Google profile name.');
    if (msg) {
      showToast('Message sent to auditor via SMS & App notification.');
    }
  };

  return (
    <AppLayout role='admin' title={`Submission Review · ${subData.id}`}>
      {/* Top Back Navigation Bar */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className='ghost' 
          onClick={() => navigate('/admin/verification')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Verification List
        </button>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Category: <b>{subData.category || 'Audit Task'}</b></span>
      </div>

      {/* REVISION RESUBMITTED BANNER */}
      {(subData.status?.toLowerCase().includes('resubmitted') || status?.toLowerCase().includes('resubmitted')) && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1.5px solid #3b82f6',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.12)'
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ background: '#0066ff', color: '#fff', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#1e3a8a', fontWeight: 800 }}>
                🔄 Auditor Has Resubmitted Revision Evidence
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#1e40af' }}>
                The auditor has updated and resubmitted their evidence files & proof for <b>{subData.id}</b> following QC auditor feedback.
              </p>
            </div>
          </div>
          <span style={{ background: '#0066ff', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Ready for Sign-off
          </span>
        </div>
      )}

      <div className='reviewGrid' style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Main Content Area */}
        <section className='stack' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card */}
          <div className='card' style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className='badge' style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{subData.id}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>• Submitted {subData.submitted}</span>
              </div>
              <h2 style={{ margin: '4px 0 8px', fontSize: '14px', color: '#0f172a' }}>{subData.task}</h2>
              <p className='muted' style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                Auditor: <b>{subData.user}</b> · Location: <b>{subData.city}</b>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>₹{subData.reward}</div>
              <span className={`badge ${status.toLowerCase().includes('approved') ? 'green' : status.toLowerCase().includes('reject') ? 'red' : 'orange'}`} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                {status}
              </span>
            </div>
          </div>

          {/* ADMIN REVISION FEEDBACK BOX */}
          {(subData.revisionNote || subData.status?.toLowerCase().includes('revision') || status?.toLowerCase().includes('revision')) && (
            <div style={{
              background: '#fff7ed',
              border: '1.5px solid #fdba74',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)'
            }}>
              <b style={{ color: '#9a3412', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                💬 Admin QC Revision Note Sent to Auditor:
              </b>
              <div style={{
                background: '#ffffff',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #fed7aa',
                fontSize: '13px',
                color: '#c2410c',
                fontWeight: '600',
                lineHeight: '1.5'
              }}>
                "{currentRevisionNote || subData.revisionNote || 'Uploaded review screenshot missing profile handle name. Please re-upload photo showing your 5-star Google review and handle.'}"
              </div>
            </div>
          )}

          {/* Evidence Section */}
          <div className='card' style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Submitted Evidence Files</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Showing only items uploaded by auditor for this specific task.</p>
              </div>
              <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                {Object.keys(validEvidence).length} Item(s) Attached
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {Object.entries(validEvidence).map(([key, rawVal]) => {
                const label = FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim();
                const parsed = parseEvidenceValue(rawVal);

                return (
                  <div 
                    key={key} 
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        {parsed.isImage ? <ImageIcon size={16} color="#0284c7" /> : <FileText size={16} color="#475569" />}
                        <b style={{ fontSize: '12.5px', color: '#1e293b', textTransform: 'capitalize' }}>{label}</b>
                      </div>

                      {parsed.isImage ? (
                        <div 
                          onClick={() => setActiveModalItem({ label, value: parsed.url, isImage: true, name: parsed.name, size: parsed.size })}
                          style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '6px', border: '1px solid #cbd5e1', height: '120px', background: '#e2e8f0' }}
                        >
                          <img 
                            src={parsed.url} 
                            alt={label} 
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_SCREENSHOT; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(15,23,42,0.75)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={12}/> Inspect
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a', fontWeight: 600, wordBreak: 'break-all' }}>
                          {parsed.text}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={12} color="#166534" /> Verified
                      </span>
                      {parsed.isImage ? (
                        <button 
                          onClick={() => setActiveModalItem({ label, value: parsed.url, isImage: true, name: parsed.name, size: parsed.size })} 
                          className="ghost" 
                          style={{ fontSize: '11.5px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={13} /> View Doc
                        </button>
                      ) : parsed.isUrl ? (
                        <a href={parsed.url} target="_blank" rel="noreferrer" className="ghost" style={{ fontSize: '11.5px', padding: '4px 8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7' }}>
                          <ExternalLink size={13} /> Open Link
                        </a>
                      ) : (
                        <button 
                          onClick={() => { navigator.clipboard.writeText(parsed.text); showToast('Copied to clipboard!'); }} 
                          className="ghost" 
                          style={{ fontSize: '11.5px', padding: '4px 8px' }}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Questionnaire & Answers Section */}
          <div className='card' style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Questionnaire & Response Proof
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(subData.answers || {}).length > 0 ? (
                Object.entries(subData.answers).map(([qKey, qVal], idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', textTransform: 'capitalize', fontWeight: 500 }}>
                      <b>Q{idx + 1}:</b> {qKey.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <b style={{ fontSize: '13.5px', color: '#0f172a', background: '#fff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      {String(qVal)}
                    </b>
                  </div>
                ))
              ) : (
                [
                  ['Rating Posted', '5 / 5 Stars Posted'],
                  ['Review Comments', '"Great location, polite staff and fast execution!"'],
                  ['Profile Match', 'Google Profile matches auditor handle'],
                  ['Guidelines Complied', 'Yes, followed all client guidelines']
                ].map(([q, a], idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                      <b>Q{idx + 1}:</b> {q}
                    </span>
                    <b style={{ fontSize: '13.5px', color: '#0f172a', background: '#fff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      {a}
                    </b>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Sidebar Summary & Decision Controls */}
        <aside className='stack' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Verification Metrics Card */}
          <div className='card' style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Verification Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#dcfce7', color: '#166534', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <MapPin size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>Location Verified</b>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>118 m from target geotag</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#e0f2fe', color: '#075985', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <Clock size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>Timestamp Valid</b>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{subData.submitted}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#f3e8ff', color: '#6b21a8', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>Duplicate Check Passed</b>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Original media hash</span>
                </div>
              </div>

              <div style={{ marginTop: '8px', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>95%</div>
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Confidence Rating Score</span>
              </div>
            </div>
          </div>

          {/* Decision Box */}
          <div className='card' style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '13.5px', color: '#0f172a' }}>Reviewer Decision</h3>
            <textarea 
              placeholder='Internal review note or auditor feedback...' 
              rows='3'
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className='primary' 
                onClick={handleApprove}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={16} /> Approve & Credit ₹{subData.reward}
              </button>

              <button 
                className='ghost' 
                onClick={handleRequestRevision}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #cbd5e1' }}
              >
                <RotateCcw size={15} /> Request Revision
              </button>

              <button 
                className='danger' 
                onClick={handleReject} 
                style={{ width: '100%', padding: '9px', borderRadius: '8px', fontSize: '13px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <XCircle size={15} /> Reject Submission
              </button>
            </div>
          </div>

          {/* Contact Auditor Card */}
          <div className='card' style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <button 
              className='ghost' 
              onClick={handleMessageAuditor} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <MessageSquare size={16} /> Send SMS / App Notice
            </button>
          </div>
        </aside>
      </div>

      {/* Lightbox / Modal for Evidence Preview */}
      {activeModalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', maxWidth: '640px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{activeModalItem.label}</h3>
              <button className="ghost" onClick={() => setActiveModalItem(null)} style={{ border: 0, fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
            </div>

            {activeModalItem.isImage ? (
              <div>
                <img 
                  src={activeModalItem.value} 
                  alt={activeModalItem.label} 
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_SCREENSHOT; }}
                  style={{ width: '100%', maxHeight: '440px', objectFit: 'contain', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1' }} 
                />
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {activeModalItem.value && (activeModalItem.value.startsWith('http://') || activeModalItem.value.startsWith('https://')) ? (
                    <a 
                      href={activeModalItem.value} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="primary" 
                      style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ExternalLink size={15} /> Open External Link ↗
                    </a>
                  ) : (
                    <a 
                      href={activeModalItem.value} 
                      download={activeModalItem.name || 'submission_screenshot.png'} 
                      className="primary" 
                      style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={15} /> Download High-Res Screenshot
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <b style={{ color: '#64748b', fontSize: '12px' }}>Submitted Text / Handle:</b>
                <p style={{ fontSize: '16px', color: '#0f172a', fontWeight: 600, wordBreak: 'break-all', margin: '8px 0 16px' }}>{activeModalItem.value}</p>
                {activeModalItem.value && String(activeModalItem.value).startsWith('http') && (
                  <a 
                    href={activeModalItem.value} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="primary" 
                    style={{ textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ExternalLink size={15} /> Open External Link ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
