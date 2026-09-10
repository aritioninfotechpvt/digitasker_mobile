import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, SectionTitle } from '../components/ui';
import { 
  Building2, ShieldCheck, Key, Bell, Save, Check, Copy, RefreshCw, Layers, Lock, 
  User, Camera, Eye, EyeOff, Upload, Phone, Mail
} from 'lucide-react';
import { showSuccess, showToast, showConfirm } from '../utils/swal';

export default function ClientSettings() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'organization' | 'campaigns' | 'api' | 'notifications'
  
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('insightloop_user');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }, []);

  const savedSettings = useMemo(() => {
    try {
      const stored = localStorage.getItem('digitasker_custom_client_settings');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }, []);

  // Profile Upload & Details State
  const [managerName, setManagerName] = useState(savedSettings.managerName || user.name || '');
  const [jobTitle, setJobTitle] = useState(savedSettings.jobTitle || '');
  const [email, setEmail] = useState(savedSettings.email || user.email || '');
  const [phone, setPhone] = useState(savedSettings.phone || user.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(savedSettings.avatar || null);

  // Security & Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [enable2FA, setEnable2FA] = useState(savedSettings.enable2FA ?? true);

  // Organization Form State
  const [companyName, setCompanyName] = useState(savedSettings.companyName || user.company || 'DigiLites Studio');
  const [industry, setIndustry] = useState(savedSettings.industry || 'Market Research & Brand Intelligence');
  const [gstin, setGstin] = useState(savedSettings.gstin || '');
  const [billingEmail, setBillingEmail] = useState(savedSettings.billingEmail || user.email || '');
  const [defaultCurrency, setDefaultCurrency] = useState(savedSettings.defaultCurrency || 'INR (₹)');
  const [websiteUrl, setWebsiteUrl] = useState(savedSettings.websiteUrl || 'https://digitasker.com');
  const [aboutCompany, setAboutCompany] = useState(savedSettings.aboutCompany || 'Leading brand analytics and retail mystery audit studio delivering real-time field data & verified reviews across India.');
  const [companyLogo, setCompanyLogo] = useState(savedSettings.companyLogo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80');

  // Campaign Rules State
  const [autoQCThreshold, setAutoQCThreshold] = useState(savedSettings.autoQCThreshold || '85');
  const [requirePhotoVerification, setRequirePhotoVerification] = useState(savedSettings.requirePhotoVerification ?? true);
  const [requireGpsTag, setRequireGpsTag] = useState(savedSettings.requireGpsTag ?? true);
  const [enableDisputeEscalation, setEnableDisputeEscalation] = useState(savedSettings.enableDisputeEscalation ?? true);

  // API State
  const [apiKey] = useState(savedSettings.apiKey || '');
  const [webhookUrl, setWebhookUrl] = useState(savedSettings.webhookUrl || '');

  const persistSettings = (newPartial) => {
    const updated = { ...savedSettings, ...newPartial };
    localStorage.setItem('digitasker_custom_client_settings', JSON.stringify(updated));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        persistSettings({ avatar: reader.result });
        showToast('Profile photo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    persistSettings({ managerName, jobTitle, email, phone, avatar: avatarPreview });
    showSuccess('Profile Updated! 👤', 'Your account manager details and profile avatar have been saved.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showSuccess('Password Changed Successfully! 🔒', 'Your account password has been updated. Please use your new password next time you log in.');
  };

  const handleSaveOrganization = (e) => {
    e.preventDefault();
    persistSettings({ companyName, industry, gstin, billingEmail, defaultCurrency, websiteUrl, aboutCompany, companyLogo });
    localStorage.setItem('digitasker_client_branding', JSON.stringify({
      companyName,
      websiteUrl,
      aboutCompany,
      companyLogo
    }));
    showSuccess('Organization Profile Saved', 'Company branding, website link, logo, and about details updated successfully.');
  };

  const handleSaveCampaignRules = (e) => {
    e.preventDefault();
    persistSettings({ autoQCThreshold, requirePhotoVerification, requireGpsTag, enableDisputeEscalation });
    showSuccess('Campaign Defaults Updated', 'Global audit verification rules applied to upcoming campaigns.');
  };

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard?.writeText(apiKey);
      showToast('API Key copied to clipboard!', 'success');
    } else {
      showToast('No API key generated yet.', 'info');
    }
  };

  const initials = useMemo(() => {
    const source = managerName || user.name || 'Client';
    return source.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'CL';
  }, [managerName, user.name]);

  return (
    <AppLayout role="client" title="Client Settings & Security">
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Navigation Tabs */}
        <Card style={{ padding: '12px' }}>
          <div className="stack" style={{ gap: '4px' }}>
            <button 
              className={activeTab === 'profile' ? 'primary' : 'ghost'} 
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} /> Profile & Avatar
            </button>

            <button 
              className={activeTab === 'security' ? 'primary' : 'ghost'} 
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={16} /> Change Password
            </button>

            <button 
              className={activeTab === 'organization' ? 'primary' : 'ghost'} 
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('organization')}
            >
              <Building2 size={16} /> Organization Profile
            </button>

            <button 
              className={activeTab === 'campaigns' ? 'primary' : 'ghost'} 
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('campaigns')}
            >
              <Layers size={16} /> Campaign Rules
            </button>

            <button 
              className={activeTab === 'api' ? 'primary' : 'ghost'} 
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('api')}
            >
              <Key size={16} /> API & Webhooks
            </button>

            <button 
              className={activeTab === 'notifications' ? 'primary' : 'ghost'} 
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={16} /> Notifications
            </button>
          </div>
        </Card>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <Card>
              <SectionTitle title="Account Profile & Manager Details" />
              <form onSubmit={handleSaveProfile} className="stack" style={{ gap: '16px' }}>
                {/* Photo Upload Box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0066ff' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #0066ff, #6366f1)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 800 }}>
                        {initials}
                      </div>
                    )}
                    <label 
                      htmlFor="avatarInput" 
                      style={{ 
                        position: 'absolute', bottom: 0, right: 0, background: '#0066ff', color: 'white', 
                        borderRadius: '50%', width: '28px', height: '28px', display: 'grid', placeItems: 'center', 
                        cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' 
                      }}
                      title="Upload new photo"
                    >
                      <Camera size={14} />
                    </label>
                    <input id="avatarInput" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                  </div>

                  <div>
                    <b style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>Profile Photo & Avatar</b>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', margin: '2px 0 8px' }}>
                      PNG, JPG, or GIF up to 5MB. Visible on client dashboard & audit reports.
                    </span>
                    <label htmlFor="avatarInput" className="ghostDark" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 12px', cursor: 'pointer', fontSize: '12px' }}>
                      <Upload size={14} /> Upload New Photo
                    </label>
                  </div>
                </div>

                <div className="fieldGrid two">
                  <label>
                    Account Manager Name
                    <input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} />
                  </label>

                  <label>
                    Job Title / Designation
                    <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                  </label>
                </div>

                <div className="fieldGrid two">
                  <label>
                    Work Email Address
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </label>

                  <label>
                    Contact Mobile Number
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
                  </label>
                </div>

                <div className="formFooter">
                  <button className="primary" type="submit">
                    <Save size={15} /> Save Profile Details
                  </button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <SectionTitle title="Security & Password Settings" />
              <form onSubmit={handleChangePassword} className="stack" style={{ gap: '16px' }}>
                <label>
                  Current Password
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showCurrentPass ? 'text' : 'password'} 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)} 
                      placeholder="Enter current account password"
                      style={{ paddingRight: '40px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 0, background: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <div className="fieldGrid two">
                  <label>
                    New Password
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showNewPass ? 'text' : 'password'} 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder="At least 6 characters"
                        style={{ paddingRight: '40px' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 0, background: 'none', color: '#64748b', cursor: 'pointer' }}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <label>
                    Confirm New Password
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="Re-enter new password"
                    />
                  </label>
                </div>

                <div className="toggleRow" onClick={() => setEnable2FA(!enable2FA)}>
                  <div>
                    <b>Two-Factor Authentication (2FA)</b>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Require an OTP SMS code when logging in from new devices.</span>
                  </div>
                  <label className="toggle" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={enable2FA} onChange={e => setEnable2FA(e.target.checked)} />
                    <i />
                  </label>
                </div>

                <div className="formFooter">
                  <button className="primary" type="submit">
                    <Lock size={15} /> Update Password
                  </button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'organization' && (
            <Card>
              <SectionTitle title="Organization & Billing Profile" />
              <form onSubmit={handleSaveOrganization} className="stack" style={{ gap: '16px' }}>
                <div className="fieldGrid two">
                  <label>
                    Company Legal Name
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </label>

                  <label>
                    Industry / Vertical
                    <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} />
                  </label>
                </div>

                <div className="fieldGrid two">
                  <label>
                    GSTIN Number
                    <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} />
                  </label>

                  <label>
                    Billing Email Address
                    <input type="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} />
                  </label>
                </div>

                <div className="fieldGrid two">
                  <label>
                    Company Website URL
                    <input type="url" placeholder="https://yourcompany.com" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
                  </label>

                  <label>
                    Company Logo Image URL
                    <input type="text" placeholder="https://domain.com/logo.png" value={companyLogo} onChange={e => setCompanyLogo(e.target.value)} />
                  </label>
                </div>

                <label>
                  About Company Description
                  <textarea 
                    rows={3} 
                    placeholder="Provide a brief background about your company and brand for auditors..." 
                    value={aboutCompany} 
                    onChange={e => setAboutCompany(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </label>

                <div className="fieldGrid two">
                  <label>
                    Default Account Currency
                    <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)}>
                      <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                      <option value="USD ($)">USD ($) - US Dollar</option>
                    </select>
                  </label>
                </div>

                <div className="formFooter">
                  <button className="primary" type="submit">
                    <Save size={15} /> Save Organization Profile
                  </button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'campaigns' && (
            <Card>
              <SectionTitle title="Campaign Execution & Quality Control Rules" />
              <form onSubmit={handleSaveCampaignRules} className="stack" style={{ gap: '16px' }}>
                <label>
                  Minimum Quality Score Threshold (%)
                  <input type="number" value={autoQCThreshold} onChange={e => setAutoQCThreshold(e.target.value)} />
                </label>

                <div className="toggleRow" onClick={() => setRequirePhotoVerification(!requirePhotoVerification)}>
                  <div>
                    <b>Require Photo Evidence Verification</b>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Every audit submission must include at least 2 geotagged images.</span>
                  </div>
                  <label className="toggle" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={requirePhotoVerification} onChange={e => setRequirePhotoVerification(e.target.checked)} />
                    <i />
                  </label>
                </div>

                <div className="toggleRow" onClick={() => setRequireGpsTag(!requireGpsTag)}>
                  <div>
                    <b>Strict GPS Geofence Verification</b>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Automatically reject submissions recorded outside a 200-meter store radius.</span>
                  </div>
                  <label className="toggle" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={requireGpsTag} onChange={e => setRequireGpsTag(e.target.checked)} />
                    <i />
                  </label>
                </div>

                <div className="toggleRow" onClick={() => setEnableDisputeEscalation(!enableDisputeEscalation)}>
                  <div>
                    <b>Enable Auto Dispute Escalation</b>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Escalate quality discrepancies directly to InsightLoop Senior Ops Lead.</span>
                  </div>
                  <label className="toggle" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={enableDisputeEscalation} onChange={e => setEnableDisputeEscalation(e.target.checked)} />
                    <i />
                  </label>
                </div>

                <div className="formFooter">
                  <button className="primary" type="submit">
                    <Save size={15} /> Save Campaign Defaults
                  </button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <SectionTitle title="Developer API & Webhook Integrations" />
              <div className="stack" style={{ gap: '16px' }}>
                <div className="apiKeyBox">
                  <span>Live Production API Key</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <code style={{ flex: 1, padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                      {apiKey}
                    </code>
                    <button className="ghostDark" onClick={handleCopyKey}>
                      <Copy size={15} /> Copy
                    </button>
                  </div>
                </div>

                <label>
                  Webhook Event URL
                  <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
                </label>

                <div className="formFooter">
                  <button className="primary" onClick={() => showSuccess('Webhook Configuration Updated', 'Test payload sent to destination URL.')}>
                    <Save size={15} /> Update Webhook URL
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <SectionTitle title="Notification & Delivery Preferences" />
              <div className="stack" style={{ gap: '14px' }}>
                <div className="toggleRow">
                  <div>
                    <b>Daily Campaign Summary Email</b>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Receive a daily summary of audit completions and spend.</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <i />
                  </label>
                </div>

                <div className="toggleRow">
                  <div>
                    <b>Instant QC Escalation Alerts</b>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Notify immediately via Email & WhatsApp when a dispute occurs.</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <i />
                  </label>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
