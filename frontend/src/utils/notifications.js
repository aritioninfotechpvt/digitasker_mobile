export function addUserNotification({ submissionId, taskTitle, reason }) {
  const existingNotifs = JSON.parse(localStorage.getItem('digitasker_user_notifications') || '[]');
  const newNotif = {
    id: `rev-notif-${submissionId}-${Date.now()}`,
    submissionId: submissionId,
    title: `QC Revision Requested: ${submissionId}`,
    desc: `Admin Feedback: "${reason}". Click to re-submit evidence.`,
    text: `Admin Feedback: "${reason}". Click to re-submit evidence.`,
    time: 'Action Required',
    unread: true,
    color: 'orange',
    link: `/user/tasks/${submissionId}/complete`
  };

  const filtered = existingNotifs.filter(n => n.submissionId !== submissionId);
  const updated = [newNotif, ...filtered];
  localStorage.setItem('digitasker_user_notifications', JSON.stringify(updated));
  
  try {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('digitasker_notif_update'));
  } catch (e) {}
}

export function getPendingRevisions() {
  const userSubs = JSON.parse(localStorage.getItem('digitasker_user_submissions') || '[]');
  const notesMap = JSON.parse(localStorage.getItem('digitasker_admin_revision_notes') || '{}');
  
  const pending = userSubs
    .filter(s => s.status === 'Revision Requested' || s.status === 'Needs Revision')
    .map(s => {
      const subId = s.submissionCode || `SUB-${s.id}`;
      return {
        id: s.id || subId,
        subId: subId,
        taskTitle: s.title || 'Audit Task',
        note: notesMap[subId] || notesMap[s.id] || s.revisionNote || 'Please re-upload clearer evidence screenshot as requested by QC Auditor.'
      };
    });

  const is4178Handled = userSubs.some(s => (s.submissionCode === 'SUB-4178' || String(s.id) === '4178') && (s.status === 'Revision Resubmitted' || s.status === 'Approved'));
  if (!is4178Handled && !pending.some(p => p.subId === 'SUB-4178')) {
    pending.unshift({
      id: 'SUB-4178',
      subId: 'SUB-4178',
      taskTitle: 'Digilites Studio · Google Rating & Review',
      note: notesMap['SUB-4178'] || notesMap[4178] || 'Review screenshot missing profile handle name. Please re-upload photo showing your 5-star Google review and handle.'
    });
  }

  return pending;
}
