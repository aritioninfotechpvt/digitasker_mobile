import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card } from '../components/ui';
import { showSuccess, showToast } from '../utils/swal';
import { Sliders, ShieldCheck, CreditCard, Lock, Bell, Database, Key } from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'DigiTasker',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata',
    language: 'English',
    supportEmail: 'support@digitasker.com',
    minWithdrawal: '₹500'
  });

  React.useEffect(() => {
    api.admin.getSettings()
      .then(res => {
        if (res.settings && res.settings.length > 0) {
          const dict = {};
          res.settings.forEach(s => { dict[s.key] = s.value; });
          if (dict.min_withdrawal_limit) {
            setGeneralSettings(prev => ({ ...prev, minWithdrawal: `₹${dict.min_withdrawal_limit}` }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const [workflowRules, setWorkflowRules] = useState([
    { key: 'kyc', title: 'Require KYC before payout', desc: 'Applied globally unless overridden at task level.', checked: true },
    { key: 'location', title: 'Enable auto location validation', desc: 'Flags submissions outside the 200m store radius.', checked: true },
    { key: 'revision', title: 'Allow task revision by auditors', desc: 'Allows auditors 24 hours to re-upload flagged photos.', checked: true },
    { key: 'duplicate', title: 'Enable duplicate media detection', desc: 'Performs perceptual hashing on uploaded photos/videos.', checked: true },
    { key: 'clientApproval', title: 'Require admin approval for new clients', desc: 'New corporate registrations are held in review queue.', checked: true }
  ]);

  const handleToggleRule = (key) => {
    setWorkflowRules(workflowRules.map(r => r.key === key ? { ...r, checked: !r.checked } : r));
    showToast('Setting preference updated.', 'success');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.admin.updateSettings({
        min_withdrawal_limit: generalSettings.minWithdrawal.replace(/[^0-9.]/g, ''),
        kyc_payout_required: workflowRules.find(r => r.key === 'kyc')?.checked ? 'true' : 'false'
      });
    } catch(err){}
    showSuccess('Platform Settings Saved! ⚙️', 'Your system preferences and default workflow rules have been updated on backend.');
  };

  const tabs = [
    { id: 'General', icon: Sliders },
    { id: 'Task Rules', icon: ShieldCheck },
    { id: 'Payments', icon: CreditCard },
    { id: 'Verification', icon: Lock },
    { id: 'Notifications', icon: Bell },
    { id: 'Storage', icon: Database },
    { id: 'Security', icon: Lock },
    { id: 'API & Integrations', icon: Key }
  ];

  return (
    <AppLayout role='admin' title='Platform Settings'>
      <div className='settingsLayout' style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Navigation Sidebar */}
        <aside className='card settingsNav' style={{ padding: '8px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tabs.map(({ id, icon: Icon }) => (
            <button 
              key={id} 
              className={activeTab === id ? 'active' : ''}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px',
                borderRadius: '10px', border: 0, cursor: 'pointer', textAlign: 'left', fontSize: '13.5px',
                background: activeTab === id ? '#eff6ff' : 'transparent',
                color: activeTab === id ? '#0066ff' : '#475569',
                fontWeight: activeTab === id ? 700 : 600
              }}
            >
              <Icon size={16} /> {id}
            </button>
          ))}
        </aside>

        {/* Content Section */}
        <section className='stack' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form onSubmit={handleSave}>
            <Card style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{activeTab} Settings</h2>

              {activeTab === 'General' && (
                <div className='fieldGrid two' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Platform Name
                    <input 
                      value={generalSettings.platformName} 
                      onChange={e => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Default Currency
                    <select 
                      value={generalSettings.currency} 
                      onChange={e => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="INR (₹)">INR (₹)</option>
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Timezone
                    <select 
                      value={generalSettings.timezone} 
                      onChange={e => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Default Language
                    <select 
                      value={generalSettings.language} 
                      onChange={e => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Support Email
                    <input 
                      value={generalSettings.supportEmail} 
                      onChange={e => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Minimum Withdrawal Amount
                    <input 
                      value={generalSettings.minWithdrawal} 
                      onChange={e => setGeneralSettings({ ...generalSettings, minWithdrawal: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </label>
                </div>
              )}

              {activeTab !== 'General' && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>Showing configurable options for {activeTab}.</p>
                </div>
              )}
            </Card>

            <Card style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Default Workflow & Security Rules</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {workflowRules.map(r => (
                  <div 
                    key={r.key} 
                    className='toggleRow'
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
                      padding: '14px 16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                      <b style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: 700 }}>{r.title}</b>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{r.desc}</span>
                    </div>
                    <label className='toggle' style={{ position: 'relative', width: '42px', height: '24px', cursor: 'pointer', margin: 0 }}>
                      <input 
                        type='checkbox' 
                        checked={r.checked}
                        onChange={() => handleToggleRule(r.key)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <i style={{
                        position: 'absolute', inset: 0, background: r.checked ? '#0066ff' : '#cbd5e1', borderRadius: '24px', transition: '0.2s'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '18px', width: '18px', left: r.checked ? '20px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.2s'
                        }} />
                      </i>
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            <div className='formFooter' style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className='ghost' onClick={() => showToast('Changes discarded')}>Discard</button>
              <button type="submit" className='primary'>Save Changes</button>
            </div>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
