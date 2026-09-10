import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { UploadCloud, MapPin, CheckCircle2, Image, Video, FileText, ArrowRight, ArrowLeft, Star, ThumbsUp, ShoppingCart, Link as LinkIcon, X } from 'lucide-react';
import { showSuccess, showError, showConfirm, showToast } from '../utils/swal';
import RichTextEditor from '../components/RichTextEditor';
import { tasks } from '../data/dummy';

function UploadCard({ title, hint, accept = "image/*", icon: Icon, value, onChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          name: file.name,
          size: fileSizeStr,
          type: file.type,
          previewUrl: event.target?.result || URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    } else {
      onChange({
        name: file.name,
        size: fileSizeStr,
        type: file.type,
        previewUrl: null
      });
    }
    showToast(`${title} uploaded (${file.name})`, 'success');
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`${title} removed`, 'info');
  };

  return (
    <div className='uploadEvidence' style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: value ? '#f0fdf4' : '#f8fafc', border: value ? '1.5px solid #10b981' : '1px solid #e2e8f0', borderRadius: '14px', transition: 'all 0.15s ease' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        accept={accept} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {value?.previewUrl ? (
        <img src={value.previewUrl} alt={title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #a7f3d0' }} />
      ) : (
        <div className='uploadIcon' style={{ background: value ? '#dcfce7' : '#eff6ff', color: value ? '#10b981' : '#0066ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
      )}

      <div className='grow' style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{title}</b>
        {value ? (
          <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
            📄 {value.name} · {value.size}
          </span>
        ) : (
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>{hint}</span>
        )}
      </div>

      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className='uploadedTag' style={{ background: '#dcfce7', color: '#15803d', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Uploaded
          </div>
          <button 
            type="button" 
            onClick={handleRemove}
            style={{ background: '#fee2e2', color: '#ef4444', border: 0, padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <X size={13} /> Remove
          </button>
        </div>
      ) : (
        <button 
          type="button" 
          className='primary' 
          onClick={() => fileInputRef.current?.click()}
          style={{ background: '#0066ff', color: '#fff', border: 0, padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UploadCloud size={15} /> Select File
        </button>
      )}
    </div>
  );
}

function LinkCard({ title, hint, placeholder, value, onChange }) {
  return (
    <div className='uploadEvidence' style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: value ? '#f0fdf4' : '#f8fafc', border: value ? '1.5px solid #10b981' : '1px solid #e2e8f0', borderRadius: '14px' }}>
      <div className='uploadIcon' style={{ background: value ? '#dcfce7' : '#eff6ff', color: value ? '#10b981' : '#0066ff', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LinkIcon size={20} />
      </div>

      <div className='grow' style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{title}</b>
        <input 
          type="text" 
          placeholder={placeholder} 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none', background: '#ffffff' }}
        />
      </div>

      {value ? (
        <div className='uploadedTag' style={{ background: '#dcfce7', color: '#15803d', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={14} /> Verified
        </div>
      ) : null}
    </div>
  );
}

export default function CompleteTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const defaultFallbackTask = {
    id: id || '1',
    title: 'Google Rating & Review',
    brand: 'DigiLites Studio',
    category: 'Google Rating & Review',
    country: 'India',
    countryFlag: '🇮🇳',
    platform: 'Google Maps / Online',
    duration: '25 mins',
    slots: 50,
    reward: 30,
    image: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80'
  };

  // Retrieve task assigned by Admin based on Route ID
  const [task, setTask] = useState(() => {
    const userBooked = JSON.parse(localStorage.getItem('digitasker_user_booked_tasks') || '[]');
    const foundBooked = userBooked.find(x => String(x.id) === String(id) || x.task_code === id);
    if (foundBooked) return foundBooked;

    const customTasks = JSON.parse(localStorage.getItem('digitasker_custom_tasks') || '[]');
    const foundCustom = customTasks.find(x => String(x.id) === String(id) || x.task_code === id);
    if (foundCustom) return foundCustom;

    return tasks.find(x => String(x.id) === String(id) || x.task_code === id) || null;
  });

  useEffect(() => {
    const loadTaskFromApi = async () => {
      try {
        const res = await api.admin.getTasks();
        if (Array.isArray(res)) {
          const found = res.find(x => String(x.id) === String(id) || x.task_code === id);
          if (found) {
            setTask({
              id: found.id,
              task_code: found.task_code || `TSK-${found.id}`,
              title: found.title,
              brand: found.brand || 'Partner Brand',
              category: found.category || found.type || 'Mystery Audit',
              city: found.location || 'Chandigarh, NCR',
              duration: found.duration || '20 mins',
              reward: parseFloat(found.reward_per_task) || 350,
              image: found.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
              status: 'In Progress',
              country: 'India',
              countryFlag: '🇮🇳'
            });
          }
        }
      } catch (err) {
        console.warn('CompleteTask fetch notice:', err.message);
      }
    };
    loadTaskFromApi();
  }, [id]);

  const t = task || defaultFallbackTask;
  const taskCategory = t?.category || 'Mystery Audit';

  // Upload States - Initialized unuploaded (null) so user can pick real files
  const [uploads, setUploads] = useState({
    storeFront: null,
    interior: null,
    bill: null,
    video: null,
    socialScreenshot: null,
    profileUrl: '',
    orderInvoice: null,
    reviewScreenshot: null,
    imdbReview: null,
    imdbProfile: '',
    googleReviewScreenshot: null,
    googleReviewerHandle: ''
  });

  // Questionnaire state
  const [answers, setAnswers] = useState({
    greeted: 'Yes',
    knowledge: '5',
    hygiene: '5',
    notes: 'Task completed successfully following all campaign guidelines and verification criteria.'
  });

  const [existingSubmission, setExistingSubmission] = useState(() => {
    const userSubmissions = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const match = userSubmissions.find(s => String(s.id) === String(id) || s.task_code === id || (task && s.title === task.title));
    if (match && (match.status === 'Revision Requested' || match.status === 'Needs Revision')) {
      return null;
    }
    return match;
  });

  const activeRevisionNote = React.useMemo(() => {
    const notesMap = JSON.parse(localStorage.getItem('digitasker_admin_revision_notes') || '{}');
    const userSubmissions = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
    const match = userSubmissions.find(s => String(s.id) === String(id) || s.task_code === id || (task && s.title === task.title));
    
    const subCode = match?.submissionCode || id;
    const noteFromMap = notesMap[subCode] || notesMap[id] || (match ? notesMap[match.id] : null);
    const noteFromSub = match?.revisionNote;
    const isRevision = match?.status?.toLowerCase().includes('revision') || t?.status?.toLowerCase().includes('revision');

    if (noteFromMap || noteFromSub || isRevision) {
      return noteFromMap || noteFromSub || 'Please re-upload clearer evidence screenshot showing your profile handle as requested by QC Auditor.';
    }
    return null;
  }, [id, task, t]);

  const validateStep = (stepIndex) => {
    if (stepIndex === 0) {
      if (taskCategory === 'Google Rating & Review' || taskCategory.includes('Google')) {
        if (!uploads.googleReviewScreenshot) {
          showError('Missing Review Screenshot', 'Please select and upload your Google review & 5-star rating screenshot.');
          return false;
        }
        if (!uploads.googleReviewerHandle || !uploads.googleReviewerHandle.trim()) {
          showError('Missing Reviewer Handle', 'Please enter your Google profile name or handle.');
          return false;
        }
      } else if (taskCategory === 'Social Media') {
        if (!uploads.socialScreenshot) {
          showError('Missing Screenshot', 'Please select and upload your Like/Follow screenshot.');
          return false;
        }
        if (!uploads.profileUrl || !uploads.profileUrl.trim()) {
          showError('Missing Profile Link', 'Please enter your social profile handle or link.');
          return false;
        }
      } else if (taskCategory === 'E-commerce') {
        if (!uploads.orderInvoice) {
          showError('Missing Order Invoice', 'Please select and upload your order invoice receipt.');
          return false;
        }
        if (!uploads.reviewScreenshot) {
          showError('Missing Review Screenshot', 'Please select and upload your 5-star review screenshot.');
          return false;
        }
      } else if (taskCategory === 'IMDb & Entertainment') {
        if (!uploads.imdbReview) {
          showError('Missing IMDb Review', 'Please upload your IMDb rating & review screenshot.');
          return false;
        }
        if (!uploads.imdbProfile || !uploads.imdbProfile.trim()) {
          showError('Missing IMDb Link', 'Please enter your IMDb profile URL.');
          return false;
        }
      } else {
        // Mystery Audit / Field Audit
        if (!uploads.storeFront) {
          showError('Missing Store Front Photo', 'Please select and upload the store front photo.');
          return false;
        }
        if (!uploads.interior) {
          showError('Missing Interior Photo', 'Please select and upload the interior photo.');
          return false;
        }
        if (!uploads.bill) {
          showError('Missing Purchase Receipt', 'Please select and upload the purchase bill/receipt.');
          return false;
        }
      }
      return true;
    }

    if (stepIndex === 1) {
      const cleanNotes = answers.notes ? answers.notes.replace(/<[^>]*>/g, '').trim() : '';
      if (cleanNotes.length < 5) {
        showError('Incomplete Feedback', 'Please provide detailed task survey feedback notes before proceeding.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep > currentStep) {
      for (let s = currentStep; s < targetStep; s++) {
        if (!validateStep(s)) return;
      }
    }
    setCurrentStep(targetStep);
  };

  const handleSubmitAudit = async () => {
    if (!validateStep(0) || !validateStep(1)) return;

    const isRevision = existingSubmission?.status?.toLowerCase().includes('revision') || t?.status?.toLowerCase().includes('revision');

    const confirmed = await showConfirm(
      isRevision ? 'Submit Revision Evidence? 🔄' : 'Submit Task Evidence?',
      isRevision 
        ? 'Your updated evidence files and responses will be resubmitted for QA review.'
        : 'Your submitted evidence files and survey responses will be sent for QA verification.'
    );
    if (confirmed) {
      const subCode = existingSubmission?.submissionCode || `SUB-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanEvidence = {};
      Object.entries(uploads).forEach(([key, val]) => {
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          cleanEvidence[key] = val;
        }
      });

      const submission = {
        id: t.id || Date.now(),
        task_code: t.task_code || `TSK-${t.id || Math.floor(1000 + Math.random() * 9000)}`,
        submissionCode: subCode,
        title: t.title || 'Task Submission',
        brand: t.brand || 'DigiLites Partner',
        category: taskCategory,
        city: t.city || t.location || 'Chandigarh, NCR',
        duration: t.duration || '20 mins',
        reward: parseFloat(t.reward) || parseFloat(t.reward_per_task) || 300,
        image: t.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        status: isRevision ? 'Revision Resubmitted' : 'Under Review',
        submittedAt: new Date().toISOString(),
        evidence: cleanEvidence,
        answers: answers,
        country: t.country || 'India',
        countryFlag: t.countryFlag || '🇮🇳'
      };

      // 1. Immediately update localStorage under digitasker_user_submissions
      const existingSubmissions = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
      const updatedSubmissions = [submission, ...existingSubmissions.filter(s => String(s.id) !== String(submission.id) && s.title !== submission.title && s.submissionCode !== submission.submissionCode)];
      localStorage.setItem('digitasker_user_submissions', JSON.stringify(updatedSubmissions));

      // 2. Remove task from digitasker_user_booked_tasks
      const bookedTasks = JSON.parse(localStorage.getItem('digitasker_user_booked_tasks') || '[]');
      const remainingBooked = bookedTasks.filter(b => String(b.id) !== String(t.id) && b.title !== t.title);
      localStorage.setItem('digitasker_user_booked_tasks', JSON.stringify(remainingBooked));

      // 3. Call backend API if possible
      try {
        await api.user.submitTask(t.id || 1, JSON.stringify(uploads), 30.7333, 76.7794);
      } catch (err) {
        console.warn('Backend submission notice:', err.message);
      }

      await showSuccess(
        isRevision ? 'Revision Evidence Submitted! 🔄' : 'Task Evidence Submitted! 🎉',
        `Your ${taskCategory} submission ${subCode} has been resubmitted for QA review. Payout will be credited upon QA sign-off.`
      );
      navigate('/user/my-tasks', { state: { tab: 'Under Review' } });
    }
  };

  return (
    <AppLayout role='user' title='Complete Task & Submit Evidence'>
      {existingSubmission ? (
        <div style={{ maxWidth: '800px', margin: '20px auto' }}>
          <div className='card' style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} />
            </div>
            <span className="badge green" style={{ fontSize: '13px', padding: '6px 14px', marginBottom: '10px', display: 'inline-block' }}>
              ⏳ {existingSubmission.submissionCode || `SUB-${existingSubmission.id}`} · Status: {existingSubmission.status || 'Under Review'}
            </span>
            <h2 style={{ margin: '10px 0 6px', fontSize: '14px', color: '#0f172a' }}>
              Task Evidence Already Submitted
            </h2>
            <p style={{ color: '#0066ff', fontWeight: '700', fontSize: '13.5px', margin: '0 0 12px' }}>
              {existingSubmission.title} ({existingSubmission.brand || t.brand})
            </p>
            <p style={{ color: '#64748b', maxWidth: '540px', margin: '0 auto 20px', lineHeight: '1.6', fontSize: '13px' }}>
              Your evidence files and questionnaire responses have been received and sent for QA verification. Payout of <b>₹{existingSubmission.reward || t.reward || 30}</b> will be credited to your wallet upon QA sign-off.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button className='primary' onClick={() => navigate('/user/my-tasks')} style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                View My Tasks Status <ArrowRight size={15} />
              </button>
              <button className='ghost' onClick={() => setExistingSubmission(null)} style={{ padding: '10px 20px', fontSize: '13px' }}>
                Update / Re-upload Evidence
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 8px', color: '#334155', fontSize: '13.5px' }}>Submission Summary:</h4>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>• <b>Submission ID:</b> {existingSubmission.submissionCode || `SUB-${existingSubmission.id}`}</p>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>• <b>Submitted At:</b> {existingSubmission.submittedAt ? new Date(existingSubmission.submittedAt).toLocaleString() : 'Just now'}</p>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>• <b>QA Decision:</b> Pending QA Verification</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Flow Steps Header */}
          <div className='taskFlowSteps'>
            {['Upload Evidence', 'Task Survey / Details', 'Review & Submit'].map((s, i) => (
              <div 
                className={i === currentStep ? 'active' : ''} 
                key={s}
                onClick={() => handleStepClick(i)}
                style={{ cursor: 'pointer' }}
              >
                <span>{i + 1}</span>
                <b>{s}</b>
              </div>
            ))}
          </div>

          <div className='builderGrid'>
            <section className='stack'>
              <div className='card'>
                <div className='between'>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span className="badge green">{t?.countryFlag || '🌐'} {t?.country || 'Global'}</span>
                      <span className="badge purple">{t?.platform || 'Online'}</span>
                      <span className="badge blue">Category: {taskCategory}</span>
                    </div>
                <h2>{t?.title || 'Task'}</h2>
                <p className='muted'>Brand: <b>{t?.brand || 'DigiLites Partner'}</b> · Assigned Category: <b>{taskCategory}</b></p>
              </div>
              <span className='money' style={{ fontSize: '14px' }}>
                <b>₹{t?.reward || 300} {t?.reimbursement ? `+ ₹${t.reimbursement} Cashback` : ''}</b>
              </span>
            </div>
          </div>

          {/* ACTIVE REVISION NOTE BANNER */}
          {activeRevisionNote && (
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '14px'
            }}>
              <b style={{ color: '#9a3412', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                💬 QA Auditor Revision Request Feedback:
              </b>
              <div style={{
                background: '#ffffff',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #fed7aa',
                fontSize: '12px',
                color: '#c2410c',
                fontWeight: '600',
                lineHeight: '1.4'
              }}>
                "{activeRevisionNote}"
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#9a3412' }}>
                Please re-upload your updated proof/screenshot below and click <b>Submit Evidence 🎉</b>.
              </p>
            </div>
          )}

          {/* STEP 0: DYNAMIC EVIDENCE UPLOADS BASED ON CATEGORY */}
          {currentStep === 0 && (
            <div className='card'>
              <h3 style={{ marginBottom: '16px' }}>Upload Evidence for {taskCategory}</h3>
              
              <div className='uploadEvidenceGrid' style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 0. GOOGLE RATING & REVIEW EVIDENCE */}
                {(taskCategory === 'Google Rating & Review' || taskCategory.includes('Google')) && (
                  <>
                    <UploadCard 
                      title="Google Maps Review & Rating Screenshot"
                      hint="PNG/JPG · Must show your 5-star rating & review text on Google Maps"
                      accept="image/*"
                      icon={Star}
                      value={uploads.googleReviewScreenshot}
                      onChange={(val) => setUploads({ ...uploads, googleReviewScreenshot: val })}
                    />
                    <LinkCard 
                      title="Google Reviewer Profile Name / Account Handle"
                      hint="Verification name or link"
                      placeholder="e.g. Rahul Mehta (Local Guide Level 5)"
                      value={uploads.googleReviewerHandle}
                      onChange={(val) => setUploads({ ...uploads, googleReviewerHandle: val })}
                    />
                  </>
                )}
                {/* 1. SOCIAL MEDIA EVIDENCE */}
                {taskCategory === 'Social Media' && (
                  <>
                    <UploadCard 
                      title="Like, Follow & Subscribe Screenshot"
                      hint="PNG/JPG · Must show your handle"
                      accept="image/*"
                      icon={Image}
                      value={uploads.socialScreenshot}
                      onChange={(val) => setUploads({ ...uploads, socialScreenshot: val })}
                    />
                    <LinkCard 
                      title="Your Profile URL / Handle"
                      hint="Verification link"
                      placeholder="e.g. https://instagram.com/rahul_mehta"
                      value={uploads.profileUrl}
                      onChange={(val) => setUploads({ ...uploads, profileUrl: val })}
                    />
                  </>
                )}

                {/* 2. E-COMMERCE EVIDENCE */}
                {taskCategory === 'E-commerce' && (
                  <>
                    <UploadCard 
                      title="Amazon / Flipkart Order Invoice"
                      hint="PDF or Receipt Image · Max 10 MB"
                      accept="image/*,.pdf"
                      icon={FileText}
                      value={uploads.orderInvoice}
                      onChange={(val) => setUploads({ ...uploads, orderInvoice: val })}
                    />
                    <UploadCard 
                      title="Verified 5-Star Review Screenshot"
                      hint="Must show rating & review text"
                      accept="image/*"
                      icon={Star}
                      value={uploads.reviewScreenshot}
                      onChange={(val) => setUploads({ ...uploads, reviewScreenshot: val })}
                    />
                  </>
                )}

                {/* 3. IMDB & ENTERTAINMENT EVIDENCE */}
                {taskCategory === 'IMDb & Entertainment' && (
                  <>
                    <UploadCard 
                      title="IMDb 10-Star Rating Screenshot"
                      hint="Published review screenshot"
                      accept="image/*"
                      icon={Star}
                      value={uploads.imdbReview}
                      onChange={(val) => setUploads({ ...uploads, imdbReview: val })}
                    />
                    <LinkCard 
                      title="IMDb User Profile Link"
                      hint="Account verification link"
                      placeholder="e.g. https://imdb.com/user/ur129485"
                      value={uploads.imdbProfile}
                      onChange={(val) => setUploads({ ...uploads, imdbProfile: val })}
                    />
                  </>
                )}

                {/* 4. MYSTERY AUDIT EVIDENCE */}
                {taskCategory === 'Mystery Audit' && (
                  <>
                    <UploadCard 
                      title="Store Front Photo"
                      hint="JPG/PNG · Max 10 MB"
                      accept="image/*"
                      icon={Image}
                      value={uploads.storeFront}
                      onChange={(val) => setUploads({ ...uploads, storeFront: val })}
                    />
                    <UploadCard 
                      title="Interior Photo"
                      hint="JPG/PNG · Max 10 MB"
                      accept="image/*"
                      icon={Image}
                      value={uploads.interior}
                      onChange={(val) => setUploads({ ...uploads, interior: val })}
                    />
                    <UploadCard 
                      title="Bill / Invoice"
                      hint="Image or PDF · Max 10 MB"
                      accept="image/*,.pdf"
                      icon={FileText}
                      value={uploads.bill}
                      onChange={(val) => setUploads({ ...uploads, bill: val })}
                    />
                    <UploadCard 
                      title="30 sec Video"
                      hint="MP4/MOV · Max 100 MB"
                      accept="video/*"
                      icon={Video}
                      value={uploads.video}
                      onChange={(val) => setUploads({ ...uploads, video: val })}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: QUESTIONNAIRE & CKEDITOR COMMENTS */}
          {currentStep === 1 && (
            <div className='card stack'>
              <h3>Task Survey & Feedback ({taskCategory})</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                    1. Quality Rating (1 to 5 Stars)
                  </label>
                  <select 
                    value={answers.knowledge} 
                    onChange={e => setAnswers({ ...answers, knowledge: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
                    <option value="3">⭐⭐⭐ (3 - Average)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                    2. Task Notes & Feedback (CKEditor Enabled)
                  </label>
                  <RichTextEditor
                    value={answers.notes}
                    onChange={(val) => setAnswers({ ...answers, notes: val })}
                    placeholder="Enter detailed feedback, profile handles, or purchase confirmation notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW & SUBMIT */}
          {currentStep === 2 && (
            <div className='card stack'>
              <h3>Review Submission for {taskCategory}</h3>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p><b>Category:</b> {taskCategory}</p>
                <p><b>Evidence Status:</b> All required evidence files attached</p>
                <p><b>Rating Given:</b> {answers.knowledge}/5 Stars</p>
                <p><b>Auditor Notes:</b></p>
                <div dangerouslySetInnerHTML={{ __html: answers.notes }} style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
            </div>
          )}

          {/* Location / Verification Proof Card */}
          {taskCategory === 'Mystery Audit' && (
            <div className='card'>
              <h3>Location proof</h3>
              <div className='locationProof'>
                <div className='mapMock'>
                  <MapPin />
                  <b>Your current location</b>
                  <span>30.7333, 76.7794</span>
                </div>
                <div>
                  <span className='badge green'>Location verified</span>
                  <h3>You are within 118 metres</h3>
                  <p className='muted'>Task location: Barbeque Nation, Sector 17, Chandigarh</p>
                  <button className='ghost' onClick={() => showToast('GPS Location Refreshed! 118m accurate.')}>
                    Refresh Location
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='formFooter' style={{ gap: '12px' }}>
            {currentStep > 0 && (
              <button className='ghost' onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button className='ghost' onClick={() => showToast('Draft saved successfully!')}>
              Save Draft
            </button>
            {currentStep < 2 ? (
              <button className='primary' onClick={handleNext}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className='primary' onClick={handleSubmitAudit}>
                Submit Evidence 🎉
              </button>
            )}
          </div>
        </section>

        <aside className='card stickyCard'>
          <h3>Requirements Checklist</h3>
          {[
            [`${taskCategory} Evidence`, true],
            ['Account Verification', true],
            ['Questionnaire Survey', currentStep >= 1],
            ['Compliance Signoff', currentStep >= 2]
          ].map(([x, isDone], i) => (
            <div className='checkRow' key={x}>
              <span className={isDone ? 'done' : ''}>
                {isDone ? <CheckCircle2 size={14} /> : i + 1}
              </span>
              {x}
            </div>
          ))}
          <hr />
          <p className='muted'>Guaranteed payout upon QA approval</p>
        </aside>
      </div>
      </>
      )}
    </AppLayout>
  );
}
