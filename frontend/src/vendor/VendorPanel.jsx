import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ClipboardList, WalletCards, UserPlus, Search, Filter, ArrowRight, CheckCircle2, Clock3, 
  MapPin, IndianRupee, Send, ShieldCheck, MessageSquare, X, Check, Copy, ExternalLink, ChevronLeft, ChevronRight, FileText, CreditCard, Upload
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Badge, Card, SectionTitle, Stat } from '../components/ui';
import { showSuccess, showToast, showConfirm, showPrompt } from '../utils/swal';
import { shareMemberWhatsApp } from './V5Vendor';
import api from '../services/api';

const Page = ({ title, children }) => <AppLayout role='vendor' title={title}>{children}</AppLayout>;

export function VendorDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    admin_released: '₹0',
    vendor_available: '₹0',
    member_payable: '₹0',
    network_members: 0,
    active_tasks: 0,
    quality_score: '0%'
  });

  const [tasks, setTasks] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_tasks');
    return cached ? JSON.parse(cached) : [];
  });

  const [members, setMembers] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_members');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    api.vendor.getDashboard()
      .then(res => {
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      })
      .catch(() => {});
  }, []);

  const vendorName = useMemo(() => {
    try {
      const u = localStorage.getItem('insightloop_user');
      return u ? (JSON.parse(u).name || JSON.parse(u).company || 'Agency Partner') : 'Agency Partner';
    } catch (e) {
      return 'Agency Partner';
    }
  }, []);

  const handleBatchPayout = async () => {
    if (members.length === 0) {
      showToast('No active members available to disburse payouts.', 'info');
      return;
    }
    const confirmed = await showConfirm(
      'Create Member Payout Batch?',
      `Process payouts for ${members.length} active field network members?`
    );
    if (confirmed) {
      showSuccess(
        'Member Payout Batch Created! 💸',
        `Payouts queued for direct disbursement to ${members.length} vendor members.`
      );
    }
  };

  return (
    <Page title='Vendor Dashboard'>
      <div className='vendorHero'>
        <div>
          <Badge>PARTNER ACCOUNT</Badge>
          <h2>{vendorName}</h2>
          <p>Manage allocated campaigns, distribute tasks to your field members and control member payouts from one workspace.</p>
        </div>
        <div className='vendorHeroWallet'>
          <span>Available vendor balance</span>
          <b>{metrics.vendor_available || '₹0'}</b>
          <small>{metrics.admin_released || '₹0'} released by admin</small>
        </div>
      </div>

      <div className='statsGrid four'>
        <Stat label='Active members' value={(members.length || metrics.network_members || 0).toString()} icon={<Users />} />
        <Stat label='Assigned tasks' value={(tasks.length || metrics.active_tasks || 0).toString()} icon={<ClipboardList />} />
        <Stat label='Under verification' value={tasks.filter(t => t.status === 'Verification' || t.status === 'Pending').length.toString()} icon={<Clock3 />} />
        <Stat label='Member payable' value={metrics.member_payable || '₹0'} icon={<WalletCards />} />
      </div>

      <div className='twoColAdvanced'>
        <Card>
          <SectionTitle title='Current allocations' action='View all tasks' onActionClick={() => navigate('/vendor/tasks')} />
          {tasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No active task allocations found.
            </div>
          ) : (
            tasks.slice(0, 4).map(t => (
              <div className='vendorAllocation' key={t.id || t.title}>
                <div className='vendorTaskIcon'><ClipboardList size={18} /></div>
                <div className='grow'>
                  <div className='row'>
                    <b>{t.title}</b>
                    <Badge tone={t.status === 'Active' ? 'green' : 'orange'}>{t.status || 'Active'}</Badge>
                  </div>
                  <span>{t.campaign || 'Campaign'} · {t.location || 'Pan-India'}</span>
                  <div className='allocationProgress'>
                    <i><b style={{ width: t.progress || '0%' }} /></i>
                    <small>{t.assigned || 0}/{t.quota || 100} assigned · {t.completed || 0} completed</small>
                  </div>
                </div>
                <strong>{t.vendorReward || `₹${t.reward || 0}`}</strong>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title='Payment chain' />
          <div className='paymentChain'>
            <div><span>ADMIN RELEASED</span><b>{metrics.admin_released || '₹0'}</b><small>Current cycle</small></div>
            <ArrowRight />
            <div><span>VENDOR AVAILABLE</span><b>{metrics.vendor_available || '₹0'}</b><small>After holds/adjustments</small></div>
            <ArrowRight />
            <div><span>MEMBER PAYABLE</span><b>{metrics.member_payable || '₹0'}</b><small>Approved member work</small></div>
          </div>
          <button className='primary full' onClick={handleBatchPayout}>
            Create member payout batch
          </button>
        </Card>
      </div>
    </Page>
  );
}

export function VendorMembers() {
  const [members, setMembers] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_members');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    api.vendor.getMembers()
      .then(res => {
        if (Array.isArray(res)) {
          const fetched = res.map((m, idx) => ({
            id: m.member_code || `MEM-${m.id || idx + 101}`,
            name: m.name,
            phone: m.phone || m.area || '+91 9876543210',
            email: m.email || `${m.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            city: m.area || m.city || 'Location N/A',
            country: 'India 🇮🇳',
            skills: m.skills ? (Array.isArray(m.skills) ? m.skills : [m.skills]) : ['Auditor'],
            cert: m.certification || 'Verified',
            completed: m.completed_tasks_count || 0,
            quality: m.quality_rating || '100%',
            balance: '₹0',
            lifetimeEarned: '₹0',
            onHold: '₹0',
            status: m.status || 'Active',
            kycStatus: 'Verified',
            pan: m.pan || 'N/A',
            aadhaar: m.aadhaar || 'N/A',
            payoutMethod: `UPI: ${m.name.toLowerCase().replace(/\s+/g, '')}@upi`,
            bankAccount: 'N/A',
            password: 'Insight@' + Math.floor(1000 + Math.random() * 9000),
            joinedDate: 'Recently',
            tasks: []
          }));
          setMembers(fetched);
          localStorage.setItem('digitasker_custom_vendor_members', JSON.stringify(fetched));
        }
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMemberModal, setActiveMemberModal] = useState(null);
  const [modalTab, setModalTab] = useState('kyc');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [skillsStr, setSkillsStr] = useState('Mystery Audit, Retail');
  const [autoWA, setAutoWA] = useState(true);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        m.id.toLowerCase().includes(q) ||
        (m.city && m.city.toLowerCase().includes(q))
      );
    });
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const cleanPhoneStr = phone.startsWith('+91') ? phone : `+91 ${phone}`;
    const newM = {
      id: `MEM-${Math.floor(100 + Math.random() * 900)}`,
      name,
      phone: cleanPhoneStr,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      city: city || 'Location N/A',
      country: 'India 🇮🇳',
      skills: skillsStr.split(',').map(s => s.trim()),
      cert: 'Retail Auditor',
      completed: 0,
      quality: '100%',
      balance: '₹0',
      lifetimeEarned: '₹0',
      onHold: '₹0',
      status: 'Active',
      kycStatus: 'Verified',
      pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
      aadhaar: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
      payoutMethod: `UPI: ${name.toLowerCase().replace(/\s+/g, '')}@upi`,
      bankAccount: 'N/A',
      password: 'Insight@' + Math.floor(1000 + Math.random() * 9000),
      joinedDate: 'Today',
      tasks: []
    };

    const updated = [newM, ...members];
    setMembers(updated);
    localStorage.setItem('digitasker_custom_vendor_members', JSON.stringify(updated));

    api.vendor.addMember({
      name,
      phone: cleanPhoneStr,
      email: newM.email,
      city: newM.city,
      skills: newM.skills
    }).catch(() => {});

    setShowAddModal(false);
    showSuccess('Member Registered & Login Created! 🚀', `${name} (${cleanPhoneStr}) added to agency network.`);

    if (autoWA) {
      shareMemberWhatsApp(newM);
    }

    setName('');
    setPhone('');
  };

  const handleDisbursePayout = (m) => {
    showSuccess('Member Payout Disbursed! 💸', `₹${m.balance} sent to ${m.name} via instant UPI.`);
    setActiveMemberModal(null);
  };

  return (
    <Page title='Members & Invitations'>
      <div className='statsGrid four'>
        <Stat label='Total members' value={members.length.toString()} icon={<Users />} />
        <Stat label='Active' value={members.filter(m => m.status === 'Active').length.toString()} icon={<CheckCircle2 />} />
        <Stat label='Invited' value={members.filter(m => m.status === 'Invited').length.toString()} icon={<Send />} />
        <Stat label='Suspended' value={members.filter(m => m.status === 'Suspended').length.toString()} icon={<ShieldCheck />} />
      </div>

      <div className='advancedToolbar'>
        <div className='searchBox' style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder='Search member by Name, Phone, Member ID...' 
          />
          {searchQuery && (
            <button className='iconBtn' onClick={() => setSearchQuery('')} style={{ border: 0, width: '24px', height: '24px' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <button className='ghost' onClick={() => showToast(`Filtered ${filteredMembers.length} members`)}>
          <Filter size={15} /> Filters ({filteredMembers.length})
        </button>
        <button className='primary' onClick={() => setShowAddModal(true)}>
          <UserPlus size={15} /> Invite / Add Member
        </button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Agency Field Members</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Showing {filteredMembers.length} active network members</span>
        </div>

        <div className='dataTable memberTable'>
          <div className='dataHead'>
            <span>Member</span>
            <span>Location</span>
            <span>Skills</span>
            <span>Completed</span>
            <span>Quality</span>
            <span>Balance</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {paginatedMembers.map(m => (
            <div className='dataRow' key={m.id} style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                <b style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: 700, display: 'block' }}>{m.name}</b>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#eff6ff', color: '#0066ff', border: '1px solid #bfdbfe', fontSize: '10.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                    {m.id}
                  </span>
                  <small style={{ color: '#64748b', fontSize: '11.5px', fontWeight: 500 }}>{m.phone}</small>
                </div>
              </div>

              <span>{m.city}</span>
              <span>{Array.isArray(m.skills) ? m.skills.join(', ') : m.skills}</span>
              <span>{m.completed}</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>{m.quality}</span>
              <strong style={{ color: '#059669' }}>{m.balance}</strong>
              <Badge tone={m.status === 'Active' ? 'green' : m.status === 'Invited' ? 'purple' : 'orange'}>
                {m.status}
              </Badge>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className='ghost' onClick={() => { setActiveMemberModal(m); setModalTab('kyc'); }}>
                  Full Profile & KYC
                </button>
                <button className='whiteBtn smallBtn' onClick={() => shareMemberWhatsApp(m)} title="Share Login Details on WhatsApp">
                  <MessageSquare size={14} color="#25D366" /> WA
                </button>
              </div>
            </div>
          ))}

          {paginatedMembers.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              {searchQuery ? `No members found matching "${searchQuery}".` : 'No vendor members registered yet.'}
            </div>
          )}
        </div>

        <div className='paginationBar'>
          <span>
            Showing <b>{filteredMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</b> to <b>{Math.min(currentPage * pageSize, filteredMembers.length)}</b> of <b>{filteredMembers.length}</b> members
          </span>

          <div className='paginationControls'>
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                className={p === currentPage ? 'active' : ''} 
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      {showAddModal && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Add Agency Member & Create Login</h3>
              <button className='iconBtn' onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className='stack'>
              <label>
                Full Name
                <input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Anita Sharma" 
                />
              </label>

              <label>
                Mobile / WhatsApp Number (+91)
                <input 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="e.g. 9876543210" 
                />
              </label>

              <div className='fieldGrid two'>
                <label>
                  City / Region
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="City / Area" />
                </label>

                <label>
                  Skills / Expertise
                  <input value={skillsStr} onChange={e => setSkillsStr(e.target.value)} placeholder="Mystery Audit, Retail" />
                </label>
              </div>

              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type='checkbox' 
                  id='waCheck2' 
                  checked={autoWA} 
                  onChange={e => setAutoWA(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor='waCheck2' style={{ margin: 0, color: '#065f46', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                  Auto-open WhatsApp chat with prefilled login credentials & password
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type='button' className='ghost' onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type='submit' className='primary' style={{ flex: 1 }}>Create Login & Save 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeMemberModal && (
        <div className='modalBackdrop'>
          <div className='modalCard' style={{ maxWidth: '620px' }}>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{activeMemberModal.name}</h3>
                  <span className='badge green'>{activeMemberModal.kycStatus || 'Verified KYC'}</span>
                </div>
                <span style={{ color: '#0066ff', fontWeight: 700, fontSize: '12.5px' }}>
                  Member ID: <b>{activeMemberModal.id}</b> · Mobile: <b>{activeMemberModal.phone}</b>
                </span>
              </div>
              <button className='iconBtn' onClick={() => setActiveMemberModal(null)}><X size={18} /></button>
            </div>

            <div className='tabs' style={{ marginBottom: '16px' }}>
              <span className={modalTab === 'kyc' ? 'active' : ''} onClick={() => setModalTab('kyc')}>
                <ShieldCheck size={14} style={{ marginRight: '6px' }} /> Profile & Statutory KYC
              </span>
              <span className={modalTab === 'work' ? 'active' : ''} onClick={() => setModalTab('work')}>
                <FileText size={14} style={{ marginRight: '6px' }} /> Work & Task History
              </span>
              <span className={modalTab === 'finance' ? 'active' : ''} onClick={() => setModalTab('finance')}>
                <CreditCard size={14} style={{ marginRight: '6px' }} /> Payout & Ledger
              </span>
            </div>

            {modalTab === 'kyc' && (
              <div className='stack' style={{ gap: '14px' }}>
                <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px' }}>
                  <b style={{ color: '#0066ff', fontSize: '13px', display: 'block', marginBottom: '8px' }}>🔑 Member Login Credentials</b>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
                    <div>Username / Mobile: <b>{activeMemberModal.phone}</b></div>
                    <div>Temporary Password: <b>{activeMemberModal.password || 'Insight@2026'}</b></div>
                    <div>Portal Link: <b>http://localhost:5173/user</b></div>
                    <div>Account Status: <span className='badge green'>{activeMemberModal.status}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className='primary smallBtn' onClick={() => shareMemberWhatsApp(activeMemberModal)} style={{ flex: 1 }}>
                      <MessageSquare size={14} /> Send Credentials on WhatsApp
                    </button>
                    <button className='ghost smallBtn' onClick={() => showToast('Temporary password reset.')}>
                      Reset Password
                    </button>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>🛡️ Statutory KYC & Bank Records</b>
                  <div className='fieldGrid two' style={{ fontSize: '12.5px' }}>
                    <div>PAN Number: <b>{activeMemberModal.pan || 'N/A'}</b></div>
                    <div>Aadhaar Verification: <b>{activeMemberModal.aadhaar || 'N/A'}</b></div>
                    <div>Payout Destination: <b>{activeMemberModal.payoutMethod || 'UPI Instant'}</b></div>
                    <div>Bank Account: <b>{activeMemberModal.bankAccount || 'N/A'}</b></div>
                    <div>Location / City: <b>{activeMemberModal.city}</b></div>
                    <div>Joined Agency: <b>{activeMemberModal.joinedDate || 'Recently'}</b></div>
                  </div>
                </div>
              </div>
            )}

            {modalTab === 'work' && (
              <div className='stack' style={{ gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div><span>Completed Tasks</span><b style={{ display: 'block', fontSize: '16px' }}>{activeMemberModal.completed}</b></div>
                  <div><span>Quality Rating</span><b style={{ display: 'block', fontSize: '16px', color: '#059669' }}>{activeMemberModal.quality}</b></div>
                  <div><span>Certification</span><b style={{ display: 'block', fontSize: '13px', color: '#0066ff' }}>{activeMemberModal.cert || 'Auditor'}</b></div>
                </div>

                <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '6px' }}>Assigned Task Submissions:</b>
                {activeMemberModal.tasks && activeMemberModal.tasks.length > 0 ? (
                  activeMemberModal.tasks.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                      <div>
                        <b>{t.name}</b>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Submitted: {t.date}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <b style={{ color: '#059669', display: 'block' }}>{t.reward}</b>
                        <Badge tone={t.status === 'Approved' ? 'green' : 'orange'}>{t.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#64748b', fontSize: '12.5px', margin: 0 }}>No active task history logged yet.</p>
                )}
              </div>
            )}

            {modalTab === 'finance' && (
              <div className='stack' style={{ gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                  <div><span>Available Balance</span><b style={{ display: 'block', fontSize: '18px', color: '#059669' }}>{activeMemberModal.balance}</b></div>
                  <div><span>On Hold</span><b style={{ display: 'block', fontSize: '16px', color: '#d97706' }}>{activeMemberModal.onHold || '₹0'}</b></div>
                  <div><span>Lifetime Earned</span><b style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>{activeMemberModal.lifetimeEarned || '₹0'}</b></div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                  <p style={{ margin: '3px 0' }}>• <b>Disbursement Method:</b> {activeMemberModal.payoutMethod || 'Instant UPI'}</p>
                  <p style={{ margin: '3px 0' }}>• <b>Destination Account:</b> {activeMemberModal.bankAccount || 'N/A'}</p>
                </div>

                <button className='primary full' onClick={() => handleDisbursePayout(activeMemberModal)}>
                  Disburse Member Payout ({activeMemberModal.balance}) 💸
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className='ghost' onClick={() => setActiveMemberModal(null)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export function VendorTasks() {
  const [tasks, setTasks] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_tasks');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    api.vendor.getTasks()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const formatted = res.map(t => ({
            id: t.task_code || `TSK-${t.id}`,
            title: t.title,
            campaign: t.campaign?.title || 'Audit Campaign',
            location: t.location || 'Pan-India',
            vendorReward: `₹${parseFloat(t.vendor_payout || t.reward || 300).toLocaleString('en-IN')}`,
            memberReward: parseFloat(t.reward || 250),
            margin: '₹50',
            assigned: t.assigned_count || 0,
            quota: t.total_quota || 100,
            completed: t.completed_count || 0,
            progress: `${Math.round(((t.completed_count || 0) / (t.total_quota || 100)) * 100)}%`,
            status: t.status || 'Active',
            country: 'India',
            platform: 'Field Audit',
            eligibility: ['Geotagged Photo', 'QC Verification']
          }));
          setTasks(formatted);
          localStorage.setItem('digitasker_custom_vendor_tasks', JSON.stringify(formatted));
        }
      })
      .catch(() => {});
  }, []);

  const [assignmentTaskModal, setAssignmentTaskModal] = useState(null);
  const [autoAssignModal, setAutoAssignModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberRate, setMemberRate] = useState('250');

  const toggleMemberSelection = (id) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleConfirmAssignment = () => {
    if (!assignmentTaskModal) return;

    const updatedTasks = tasks.map(t => {
      if (t.id === assignmentTaskModal.id) {
        const newAssigned = Math.min(t.quota, t.assigned + selectedMemberIds.length * 5);
        const progressPct = Math.round((newAssigned / t.quota) * 100) + '%';
        return { ...t, assigned: newAssigned, progress: progressPct };
      }
      return t;
    });

    setTasks(updatedTasks);
    localStorage.setItem('digitasker_custom_vendor_tasks', JSON.stringify(updatedTasks));
    setAssignmentTaskModal(null);

    showSuccess(
      'Tasks Assigned & Members Notified! 🚀',
      `Assigned ${selectedMemberIds.length} members to "${assignmentTaskModal.title}" at ₹${memberRate}/payout.`
    );
  };

  const handleExecuteAutoAssign = () => {
    setAutoAssignModal(false);

    const updatedTasks = tasks.map(t => ({
      ...t,
      assigned: t.quota,
      progress: '100%'
    }));
    setTasks(updatedTasks);
    localStorage.setItem('digitasker_custom_vendor_tasks', JSON.stringify(updatedTasks));

    showSuccess(
      'Smart Auto-Assignment Complete! 🤖',
      'Distributed remaining unassigned inventory to available field members.'
    );
  };

  return (
    <Page title='Task Allocation'>
      <div className='statsGrid four'>
        <Stat label='Allocated by admin' value={tasks.length.toString()} icon={<ClipboardList />} />
        <Stat label='Assigned to members' value={tasks.reduce((a, b) => a + (b.assigned || 0), 0).toString()} icon={<Users />} />
        <Stat label='Unassigned inventory' value={tasks.reduce((a, b) => a + maxZero((b.quota || 0) - (b.assigned || 0)), 0).toString()} icon={<Clock3 />} />
        <Stat label='Completed' value={tasks.reduce((a, b) => a + (b.completed || 0), 0).toString()} icon={<CheckCircle2 />} />
      </div>

      <div className='advancedToolbar'>
        <div className='searchBox'>
          <Search size={16} />
          <input placeholder='Search task, campaign, location...' />
        </div>
        <button className='ghost' onClick={() => showToast('Filtered active tasks')}>
          <Filter size={15} /> Filters
        </button>
        <button className='primary' onClick={() => setAutoAssignModal(true)}>
          Auto-assign eligible members
        </button>
      </div>

      {tasks.length === 0 ? (
        <Card style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          <ClipboardList size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '16px' }}>No Task Allocations</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>There are currently no active tasks assigned to your vendor agency by admin.</p>
        </Card>
      ) : (
        <div className='vendorTaskGrid'>
          {tasks.map(t => (
            <Card key={t.id} className='vendorTaskCard'>
              <div className='row between' style={{ marginBottom: '8px' }}>
                <Badge>{t.id}</Badge>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="badge green">{t.country === 'India' ? '🇮🇳 India' : '🌐 Global'}</span>
                  <Badge tone="purple">{t.platform}</Badge>
                </div>
              </div>

              <h3>{t.title}</h3>
              <p style={{ color: '#0066ff', fontWeight: '700', margin: '2px 0 8px', fontSize: '13px' }}>{t.campaign}</p>

              <div className='vendorMeta'>
                <span><MapPin size={14} />{t.location}</span>
                <span><IndianRupee size={14} />₹{t.memberReward} / member payout</span>
              </div>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '8px 0 10px' }}>
                {t.eligibility?.map(req => (
                  <span key={req} style={{ background: '#f1f5f9', color: '#334155', fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    ✓ {req}
                  </span>
                ))}
              </div>

              <div className='allocationProgress'>
                <i><b style={{ width: t.progress }} /></i>
                <small>{t.assigned} assigned of {t.quota} · {t.completed} completed</small>
              </div>

              <div className='taskMargin'>
                <div><span>Admin → Vendor</span><b>{t.vendorReward}</b></div>
                <div><span>Vendor → Member</span><b>₹{t.memberReward}</b></div>
                <div><span>Vendor margin</span><b>{t.margin}</b></div>
              </div>

              <button className='primary full' onClick={() => { setAssignmentTaskModal(t); setMemberRate((t.memberReward || 250).toString()); }}>
                Manage Assignment & Member Eligibility
              </button>
            </Card>
          ))}
        </div>
      )}

      {assignmentTaskModal && (
        <div className='modalBackdrop'>
          <div className='modalCard' style={{ maxWidth: '560px' }}>
            <div className='row between' style={{ marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Task Assignment & Member Allocation</h3>
                <span style={{ color: '#0066ff', fontWeight: 700, fontSize: '12px' }}>{assignmentTaskModal.id} · {assignmentTaskModal.title}</span>
              </div>
              <button className='iconBtn' onClick={() => setAssignmentTaskModal(null)}><X size={18} /></button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '12.5px' }}>
              <p style={{ margin: '2px 0' }}>• <b>Admin Rate:</b> {assignmentTaskModal.vendorReward}</p>
              <p style={{ margin: '2px 0' }}>• <b>Location Eligibility:</b> {assignmentTaskModal.location}</p>
              <p style={{ margin: '2px 0' }}>• <b>Inventory Status:</b> {assignmentTaskModal.assigned}/{assignmentTaskModal.quota} assigned</p>
            </div>

            <label style={{ marginBottom: '14px' }}>
              Custom Per-Member Payout Rate (₹)
              <input value={memberRate} onChange={e => setMemberRate(e.target.value)} placeholder="250" />
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className='ghost' onClick={() => setAssignmentTaskModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className='primary' onClick={handleConfirmAssignment} style={{ flex: 1.5 }}>
                Assign & Confirm Allocation 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {autoAssignModal && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Smart Auto-Allocation Rules</h3>
              <button className='iconBtn' onClick={() => setAutoAssignModal(false)}><X size={18} /></button>
            </div>

            <div className='stack'>
              <label>
                Auto-Allocation Strategy
                <select>
                  <option>Nearest Member Location First (GPS Proximity)</option>
                  <option>Highest Auditor Rating First (4.8★+)</option>
                  <option>Equal Workload Distribution across network</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className='ghost' onClick={() => setAutoAssignModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className='primary' onClick={handleExecuteAutoAssign} style={{ flex: 1 }}>Run Smart Auto-Assign 🤖</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

function maxZero(val) {
  return val > 0 ? val : 0;
}

export function VendorPayments() {
  const [paymentsList, setPaymentsList] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_payments');
    return cached ? JSON.parse(cached) : [];
  });

  const [batchModal, setBatchModal] = useState(false);

  const handleReleaseMemberPayments = async () => {
    if (paymentsList.length === 0) {
      showToast('No member payouts currently queued.', 'info');
      return;
    }
    const confirmed = await showConfirm(
      'Release Member Payments?',
      'Disburse member payouts via instant bank/UPI transfer?'
    );

    if (confirmed) {
      const updated = paymentsList.map(p => ({ ...p, status: 'Paid' }));
      setPaymentsList(updated);
      localStorage.setItem('digitasker_custom_vendor_payments', JSON.stringify(updated));
      showSuccess(
        'Member Payments Released! 💸',
        'Payout transactions submitted to payment gateway.'
      );
    }
  };

  return (
    <Page title='Vendor Payments'>
      <div className='statsGrid four'>
        <Stat label='Released by admin' value='₹0' icon={<IndianRupee />} />
        <Stat label='On admin hold' value='₹0' icon={<Clock3 />} />
        <Stat label='Member payable' value='₹0' icon={<Users />} />
        <Stat label='Paid to members' value='₹0' icon={<WalletCards />} />
      </div>

      <div className='twoColAdvanced'>
        <Card>
          <SectionTitle title='Admin → Vendor ledger' />
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No admin transactions recorded in vendor ledger.
          </div>
        </Card>

        <Card>
          <SectionTitle title='Vendor → Member payout queue' action='Create batch' onAction={() => setBatchModal(true)} />
          {paymentsList.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No member payout requests in queue.
            </div>
          ) : (
            paymentsList.map(p => (
              <div className='payoutMini' key={p.id}>
                <div>
                  <b>{p.member}</b>
                  <span>{p.tasks} approved tasks · {p.method}</span>
                </div>
                <strong>{p.amount}</strong>
                <Badge tone={p.status === 'Ready' || p.status === 'Paid' ? 'green' : 'orange'}>{p.status}</Badge>
              </div>
            ))
          )}

          <button className='primary full' onClick={handleReleaseMemberPayments} style={{ marginTop: '16px' }}>
            Release selected member payments
          </button>
        </Card>
      </div>

      {batchModal && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Create Payout Batch for Members</h3>
              <button className='iconBtn' onClick={() => setBatchModal(false)}><X size={18} /></button>
            </div>
            <div className='stack'>
              <label>
                Disbursement Account / Gateways
                <select>
                  <option>Razorpay Payouts (Instant UPI)</option>
                  <option>HDFC Corporate Banking Direct Transfer</option>
                  <option>ICICI Bank API</option>
                </select>
              </label>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Total Members: <b>0 Auditors</b> · Total Batch Amount: <b style={{ color: '#059669' }}>₹0</b>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className='ghost' onClick={() => setBatchModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className='primary' onClick={() => { setBatchModal(false); showSuccess('Payout Batch Queued! 💸'); }} style={{ flex: 1 }}>
                  Process Batch Disbursement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export function VendorProfile() {
  const [showKycModal, setShowKycModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const user = useMemo(() => {
    try {
      const u = localStorage.getItem('insightloop_user');
      return u ? JSON.parse(u) : {};
    } catch (e) {
      return {};
    }
  }, []);

  const profile = useMemo(() => {
    try {
      const p = localStorage.getItem('digitasker_custom_vendor_profile');
      return p ? JSON.parse(p) : {};
    } catch (e) {
      return {};
    }
  }, []);

  const [legalName, setLegalName] = useState(profile.legal_name || (user.company && user.company !== 'Legal Entity Name' ? user.company : '') || '');
  const [managerName, setManagerName] = useState(profile.manager_name || (user.name && user.name !== 'Vendor Partner Account' ? user.name : '') || '');
  const [email, setEmail] = useState(user.email || profile.email || '');
  const [coverage, setCoverage] = useState(profile.coverage || 'Pan-India');
  const [gstin, setGstin] = useState(profile.gstin || '');

  const displayLegalName = legalName || (user.company && user.company !== 'Legal Entity Name' ? user.company : '') || 'Not Provided';
  const displayManagerName = managerName || (user.name && user.name !== 'Vendor Partner Account' ? user.name : '') || 'Operations Lead';

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      legal_name: legalName,
      manager_name: managerName,
      email,
      coverage,
      gstin
    };
    localStorage.setItem('digitasker_custom_vendor_profile', JSON.stringify(updatedProfile));

    const updatedUser = {
      ...user,
      name: managerName || user.name,
      company: legalName || user.company,
      email: email || user.email
    };
    localStorage.setItem('insightloop_user', JSON.stringify(updatedUser));

    setIsEditing(false);
    showSuccess('Profile Saved! 👤', 'Vendor business profile and contact details updated successfully.');
  };

  const handleChangePassword = async () => {
    const newPass = await showPrompt('Change Vendor Password 🔒', 'Enter new account password:', 'At least 6 characters', 'password');
    if (newPass && newPass.trim().length >= 6) {
      showSuccess('Password Updated! 🔒', 'Vendor account password updated successfully.');
    } else if (newPass !== undefined && newPass !== null) {
      showToast('Password must be at least 6 characters.', 'error');
    }
  };

  const [pan, setPan] = useState(profile.pan || '');
  const [bank, setBank] = useState(profile.bank || '');
  const [cin, setCin] = useState(profile.cin || '');
  const [panDoc, setPanDoc] = useState(profile.pan_doc || null);
  const [bankDoc, setBankDoc] = useState(profile.bank_doc || null);
  const [cinDoc, setCinDoc] = useState(profile.cin_doc || null);
  const [gstinDoc, setGstinDoc] = useState(profile.gstin_doc || null);
  const [isEditingKyc, setIsEditingKyc] = useState(false);

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const docObj = { name: file.name, dataUrl: reader.result, uploadDate: new Date().toLocaleDateString('en-IN') };
      if (docType === 'pan') setPanDoc(docObj);
      if (docType === 'bank') setBankDoc(docObj);
      if (docType === 'cin') setCinDoc(docObj);
      if (docType === 'gstin') setGstinDoc(docObj);
      showToast(`Document "${file.name}" attached!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveKyc = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      gstin,
      pan,
      bank,
      cin,
      pan_doc: panDoc,
      bank_doc: bankDoc,
      cin_doc: cinDoc,
      gstin_doc: gstinDoc
    };
    localStorage.setItem('digitasker_custom_vendor_profile', JSON.stringify(updatedProfile));
    setIsEditingKyc(false);
    showSuccess('Statutory KYC & Documents Saved! 🛡️', 'Vendor compliance numbers and uploaded document files saved.');
  };

  const inputStyle = {
    width: '100%',
    height: '38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '0 12px',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginTop: '6px',
    marginBottom: '8px'
  };

  return (
    <Page title='Vendor Profile, Credentials & Governance'>
      <div className='twoColAdvanced'>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SectionTitle title='Business Profile & Credentials' />
            <button className='ghostDark' style={{ fontSize: '12px' }} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className='stack' style={{ gap: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                Legal Entity Name
                <input 
                  required
                  value={legalName} 
                  onChange={e => setLegalName(e.target.value)} 
                  placeholder="e.g. Acme Field Network Pvt. Ltd." 
                  style={inputStyle}
                />
              </label>

              <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                Primary Account Manager Name
                <input 
                  required
                  value={managerName} 
                  onChange={e => setManagerName(e.target.value)} 
                  placeholder="e.g. Rahul Sharma" 
                  style={inputStyle}
                />
              </label>

              <div className='fieldGrid two'>
                <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  Login Email Address
                  <input 
                    type="email"
                    required
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="vendor@company.com" 
                    style={inputStyle}
                  />
                </label>

                <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  Coverage Region
                  <input 
                    value={coverage} 
                    onChange={e => setCoverage(e.target.value)} 
                    placeholder="e.g. Punjab, Delhi NCR" 
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                GSTIN Registration Number
                <input 
                  value={gstin} 
                  onChange={e => setGstin(e.target.value)} 
                  placeholder="e.g. 07AAAAA0000A1Z5" 
                  style={inputStyle}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className='ghost' onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className='primary' style={{ flex: 1 }}>
                  💾 Save Profile Details
                </button>
              </div>
            </form>
          ) : (
            <>
              {[
                ['Vendor ID', profile.vendor_id || 'VEN-001'],
                ['Legal Entity Name', displayLegalName],
                ['Primary Account Manager', displayManagerName],
                ['Login Email', email || user.email || 'Not Provided'],
                ['Login Password', '••••••••••••'],
                ['Coverage Region', coverage || 'Pan-India'],
                ['GSTIN Registration', gstin || 'Not Provided'],
                ['Agreement Validity', 'Active']
              ].map(x => (
                <div className='financeLine' key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className='primary' onClick={handleChangePassword} style={{ flex: 1 }}>
                  🔒 Change Password
                </button>
                <button className='ghostDark' onClick={() => setShowKycModal(true)} style={{ flex: 1 }}>
                  🛡️ View Statutory KYC
                </button>
              </div>
            </>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SectionTitle title='Statutory KYC & Compliance Status' />
            <button className='ghostDark' style={{ fontSize: '12px' }} onClick={() => setIsEditingKyc(!isEditingKyc)}>
              {isEditingKyc ? 'Cancel' : '✏️ Update KYC & Documents'}
            </button>
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
            <b style={{ color: '#047857', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} /> Vendor Statutory KYC Status
            </b>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#065f46' }}>
              Upload business registration documents, PAN, and cancelled cheque for bank payout verification.
            </p>
          </div>

          {isEditingKyc ? (
            <form onSubmit={handleSaveKyc} className='stack' style={{ gap: '16px' }}>
              {/* PAN Section */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ margin: 0, fontWeight: 700, fontSize: '12.5px' }}>Business PAN Card</label>
                <input 
                  value={pan} 
                  onChange={e => setPan(e.target.value)} 
                  placeholder="e.g. ABCDE1234F" 
                  style={inputStyle}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="panFileInput" className="ghostDark" style={{ cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', margin: 0 }}>
                    <Upload size={14} /> {panDoc ? `Attached: ${panDoc.name}` : 'Upload PAN Document (PDF/Image)'}
                  </label>
                  <input id="panFileInput" type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, 'pan')} style={{ display: 'none' }} />
                  {panDoc && <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>✓ Document Uploaded</span>}
                </div>
              </div>

              {/* Bank Section */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ margin: 0, fontWeight: 700, fontSize: '12.5px' }}>Bank Account & Cancelled Cheque</label>
                <input 
                  value={bank} 
                  onChange={e => setBank(e.target.value)} 
                  placeholder="e.g. HDFC Bank •••• 8842 (IFSC: HDFC0001234)" 
                  style={inputStyle}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="bankFileInput" className="ghostDark" style={{ cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', margin: 0 }}>
                    <Upload size={14} /> {bankDoc ? `Attached: ${bankDoc.name}` : 'Upload Cancelled Cheque / Passbook'}
                  </label>
                  <input id="bankFileInput" type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, 'bank')} style={{ display: 'none' }} />
                  {bankDoc && <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>✓ Document Uploaded</span>}
                </div>
              </div>

              {/* CIN Section */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ margin: 0, fontWeight: 700, fontSize: '12.5px' }}>Incorporation Certificate / CIN</label>
                <input 
                  value={cin} 
                  onChange={e => setCin(e.target.value)} 
                  placeholder="e.g. U74999PB2022PTC055123" 
                  style={inputStyle}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="cinFileInput" className="ghostDark" style={{ cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', margin: 0 }}>
                    <Upload size={14} /> {cinDoc ? `Attached: ${cinDoc.name}` : 'Upload Incorporation Certificate'}
                  </label>
                  <input id="cinFileInput" type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, 'cin')} style={{ display: 'none' }} />
                  {cinDoc && <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>✓ Document Uploaded</span>}
                </div>
              </div>

              {/* GSTIN Section */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ margin: 0, fontWeight: 700, fontSize: '12.5px' }}>GSTIN Certificate</label>
                <input 
                  value={gstin} 
                  onChange={e => setGstin(e.target.value)} 
                  placeholder="e.g. 07AAAAA0000A1Z5" 
                  style={inputStyle}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="gstinFileInput" className="ghostDark" style={{ cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', margin: 0 }}>
                    <Upload size={14} /> {gstinDoc ? `Attached: ${gstinDoc.name}` : 'Upload GSTIN Certificate'}
                  </label>
                  <input id="gstinFileInput" type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(e, 'gstin')} style={{ display: 'none' }} />
                  {gstinDoc && <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>✓ Document Uploaded</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className='ghost' onClick={() => setIsEditingKyc(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className='primary' style={{ flex: 1 }}>
                  💾 Save KYC & Uploaded Documents
                </button>
              </div>
            </form>
          ) : (
            <>
              {[
                ['GSTIN Certificate', gstin ? `GSTIN: ${gstin}` : 'No Number Provided', gstinDoc],
                ['Business PAN Card', pan ? `PAN: ${pan}` : 'No Number Provided', panDoc],
                ['Bank Account Payout', bank ? bank : 'No Account Linked', bankDoc],
                ['Incorporation Certificate', cin ? `CIN: ${cin}` : 'No CIN Provided', cinDoc]
              ].map(x => (
                <div className='financeLine' key={x[0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <div>
                    <b style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{x[0]}</b>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {x[1]} {x[2] ? ` · 📄 ${x[2].name}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {x[2] && x[2].dataUrl && (
                      <button className='ghostDark' style={{ fontSize: '11px', padding: '4px 8px', height: 'auto' }} onClick={() => {
                        const win = window.open();
                        if (win) { win.document.write(`<iframe src="${x[2].dataUrl}" style="width:100%;height:100%;border:none;"></iframe>`); }
                      }}>
                        View File
                      </button>
                    )}
                    <Badge tone={x[2] ? 'green' : 'orange'}>{x[2] ? 'Document Attached' : 'Pending Upload'}</Badge>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '16px' }}>
                <button className='primary full' onClick={() => setIsEditingKyc(true)}>
                  ✏️ Update KYC & Upload Documents
                </button>
              </div>
            </>
          )}
        </Card>
      </div>

      {showKycModal && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Vendor Statutory KYC Record & Documents</h3>
              <button className='iconBtn' onClick={() => setShowKycModal(false)}><X size={18} /></button>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12.5px', marginBottom: '18px' }}>
              <p style={{ margin: '4px 0' }}>• Vendor ID: <b>{profile.vendor_id || 'VEN-001'}</b></p>
              <p style={{ margin: '4px 0' }}>• Entity: <b>{displayLegalName}</b></p>
              <p style={{ margin: '4px 0' }}>• PAN: <b>{pan || 'N/A'}</b> {panDoc ? `(📄 ${panDoc.name})` : ''}</p>
              <p style={{ margin: '4px 0' }}>• GSTIN: <b style={{ fontFamily: 'monospace' }}>{gstin || 'N/A'}</b> {gstinDoc ? `(📄 ${gstinDoc.name})` : ''}</p>
              <p style={{ margin: '4px 0' }}>• Bank Account: <b>{bank || 'N/A'}</b> {bankDoc ? `(📄 ${bankDoc.name})` : ''}</p>
              <p style={{ margin: '4px 0' }}>• CIN: <b>{cin || 'N/A'}</b> {cinDoc ? `(📄 ${cinDoc.name})` : ''}</p>
            </div>
            <button className='primary full' onClick={() => setShowKycModal(false)}>Close KYC Details</button>
          </div>
        </div>
      )}
    </Page>
  );
}
