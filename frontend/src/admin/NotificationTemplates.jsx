import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge } from '../components/ui';
import { Bell, Mail, MessageCircle, Smartphone, Edit3, Send } from 'lucide-react';
import { notificationTemplates as initialTemplates } from '../data/dummy';
import RichTextEditor from '../components/RichTextEditor';
import { showSuccess, showToast, showPrompt } from '../utils/swal';

export default function NotificationTemplates() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplates[0]);

  const [subject, setSubject] = useState('Your submission has been approved 🎉');
  const [bodyHtml, setBodyHtml] = useState(
    '<h3>Submission Approved!</h3><p>Hi <b>{{user_name}}</b>,</p><p>Your audit for <b>{{task_name}}</b> has been approved. <b>₹{{reward}}</b> has been credited to your wallet balance.</p>'
  );

  const handleEditTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    setSubject(`Notification: ${tmpl.name}`);
    setBodyHtml(`<h3>${tmpl.name}</h3><p>Hi <b>{{user_name}}</b>,</p><p>This is your automated notification regarding <b>${tmpl.event}</b>.</p>`);
    showToast(`Editing ${tmpl.name}`);
  };

  const handleSendTest = async () => {
    const targetEmail = await showPrompt('Send Test Notification', 'Enter recipient email address or mobile number', 'auditor@example.com');
    if (targetEmail) {
      showSuccess(
        'Test Message Sent! 📲',
        `Test notification "${subject}" dispatched to ${targetEmail} via Email, WhatsApp & Push.`
      );
    }
  };

  const handleSaveTemplate = () => {
    showSuccess(
      'Template Saved! 💾',
      `Notification template "${selectedTemplate.name}" updated successfully.`
    );
  };

  return (
    <AppLayout role='admin' title='Notification Templates'>
      <div className='twoCol'>
        <Card>
          <div className='between'>
            <div>
              <h2>Event Templates</h2>
              <p className='muted'>Email, SMS, WhatsApp, push and in-app messages.</p>
            </div>
            <button className='primary' onClick={() => showToast('New template creation modal opened')}>
              New Template
            </button>
          </div>

          {templates.map(t => (
            <div className='templateRow' key={t.event}>
              <div className='noticeIcon purple'><Bell size={17} /></div>
              <div className='grow'>
                <b>{t.name}</b>
                <span>{t.event}</span>
                <div className='row gap8 topMini'>
                  {t.channels.map(c => <Badge key={c}>{c}</Badge>)}
                </div>
              </div>
              <button className='iconBtn' onClick={() => handleEditTemplate(t)} title="Edit Template">
                <Edit3 size={16} />
              </button>
            </div>
          ))}
        </Card>

        <Card className='stickyCard'>
          <h3>Template Editor (CKEditor Enabled)</h3>
          
          <label className='field'>
            <span>Template Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} />
          </label>

          <label className='field'>
            <span>Message Content & Variables</span>
            <RichTextEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              placeholder="Design email/notification template with HTML tags and {{variables}}..."
            />
          </label>

          <div className='channelPills' style={{ margin: '12px 0' }}>
            <Badge><Mail size={13} /> Email</Badge>
            <Badge><MessageCircle size={13} /> WhatsApp</Badge>
            <Badge><Smartphone size={13} /> Push</Badge>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className='ghost full' onClick={handleSendTest}>
              <Send size={16} /> Send Test
            </button>
            <button className='primary full' onClick={handleSaveTemplate}>
              Save Template
            </button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
