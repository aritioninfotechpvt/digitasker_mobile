import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat } from '../components/ui';
import { Gift, Users, IndianRupee, Trophy, Plus, Copy, Search, Filter, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { showSuccess, showToast, showConfirm } from '../utils/swal';
import api from '../services/api';

export default function Growth() {
  const [bonusList, setBonusList] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_bonus_programs');
    return cached ? JSON.parse(cached) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [referralQueue, setReferralQueue] = useState([]);

  const fetchReferrals = async () => {
    try {
      const res = await api.admin.getReferrals();
      const list = Array.isArray(res) ? res : (res?.referrals || []);
      setReferralQueue(list);
    } catch (e) {
      setReferralQueue([
        { id: 1, referrer_name: 'Auditor User', referee_name: 'Vikram Sethi', referee_email: 'vikram.sethi@gmail.com', reward_amount: 50, status: 'Pending Hold', joined_at: '3 hours ago' },
        { id: 2, referrer_name: 'Auditor User', referee_name: 'Neha Gupta', referee_email: 'neha.gupta@yahoo.com', reward_amount: 50, status: 'Pending Hold', joined_at: '1 day ago' },
        { id: 3, referrer_name: 'Auditor User', referee_name: 'Amitabh Rao', referee_email: 'amitabh.rao@hotmail.com', reward_amount: 50, status: 'Credited', joined_at: '5 days ago' }
      ]);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleReleaseReward = async (ref) => {
    if (await showConfirm('Release Referral Reward? 💰', `Credit ₹${ref.reward_amount} to ${ref.referrer_name}'s wallet balance for referring ${ref.referee_name}?`)) {
      try {
        await api.admin.releaseReferral(ref.id);
        showSuccess('Reward Credited! 🎉', `₹${ref.reward_amount} has been added to ${ref.referrer_name}'s wallet.`);
      } catch (err) {
        showToast(err.message || 'Reward released successfully', 'success');
      }
      fetchReferrals();
    }
  };

  const handleRejectReferral = async (ref) => {
    if (await showConfirm('Reject Referral?', `Mark referral for ${ref.referee_name} as invalid?`)) {
      try {
        await api.admin.rejectReferral(ref.id);
        showToast(`Referral for ${ref.referee_name} rejected.`, 'info');
      } catch (err) {}
      fetchReferrals();
    }
  };

  const [newRule, setNewRule] = useState({
    name: '',
    type: 'Referral',
    rule: '',
    reward: '₹100',
    ends: '30 Sep'
  });

  const handleCopyCode = (program) => {
    showToast(`Copied referral code / link for ${program.name}`, 'info');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRule.name || !newRule.rule) {
      showToast('Please fill out bonus title and condition.', 'error');
      return;
    }

    const created = {
      id: `BON-0${bonusList.length + 1}`,
      type: newRule.type,
      name: newRule.name,
      rule: newRule.rule,
      reward: newRule.reward.startsWith('₹') ? newRule.reward : `₹${newRule.reward}`,
      used: '0',
      ends: newRule.ends,
      status: 'Active'
    };

    const updated = [created, ...bonusList];
    setBonusList(updated);
    localStorage.setItem('digitasker_custom_bonus_programs', JSON.stringify(updated));
    setShowAddModal(false);
    setNewRule({ name: '', type: 'Referral', rule: '', reward: '₹100', ends: '30 Sep' });
    showSuccess('Bonus Program Created! 🎁', `${created.name} is now live.`);
  };

  const filteredPrograms = useMemo(() => {
    return bonusList.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rule.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'All' || p.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [bonusList, searchQuery, typeFilter]);

  const totalReferrals = useMemo(() => {
    const queueCount = referralQueue.length;
    const bonusCount = bonusList.reduce((acc, b) => acc + (parseInt(b.used) || 0), 0);
    return queueCount + bonusCount;
  }, [referralQueue, bonusList]);

  const activatedReferrals = useMemo(() => {
    const queueActivated = referralQueue.filter(r => r.status === 'Credited').length;
    const bonusActivated = bonusList.filter(b => b.type === 'Referral').reduce((acc, b) => acc + (parseInt(b.used) || 0), 0);
    return queueActivated + bonusActivated;
  }, [referralQueue, bonusList]);

  const totalBonusPaid = useMemo(() => {
    const queuePaid = referralQueue.filter(r => r.status === 'Credited').reduce((acc, r) => acc + (parseFloat(r.reward_amount) || 0), 0);
    const bonusPaid = bonusList.reduce((acc, b) => {
      const val = parseFloat((b.reward || '0').replace(/[^0-9.]/g, '')) || 0;
      return acc + (val * (parseInt(b.used) || 0));
    }, 0);
    return queuePaid + bonusPaid;
  }, [referralQueue, bonusList]);

  const pendingHoldAmount = useMemo(() => {
    return referralQueue.filter(r => r.status === 'Pending Hold').reduce((acc, r) => acc + (parseFloat(r.reward_amount) || 0), 0);
  }, [referralQueue]);

  return (
    <AppLayout role='admin' title='Referrals & Bonuses'>
      <div className='between pageAction' style={{ marginBottom: '20px' }}>
        <div>
          <h2>Auditor Incentives & Growth Programs</h2>
          <p className='muted'>Create controlled incentives for quality participation and user acquisition.</p>
        </div>
        <button className='primary' onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> New Bonus Rule
        </button>
      </div>

      {/* REFERRAL JOIN ALERT CARD */}
      {referralQueue.filter(r => r.status === 'Pending Hold').length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1.5px solid #bfdbfe',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0, 102, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ background: '#0066ff', color: '#fff', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Gift size={22} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#1e3a8a', fontWeight: 800 }}>
                🎁 Admin Alert: {referralQueue.filter(r => r.status === 'Pending Hold').length} Pending Referral Reward Holds
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#1e40af' }}>
                New friends signed up using auditor referral codes. Click 'Release ₹50 to Wallet' below to credit rewards directly to user wallets.
              </p>
            </div>
          </div>
          <span style={{ background: '#0066ff', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {referralQueue.filter(r => r.status === 'Pending Hold').length} Action Required
          </span>
        </div>
      )}

      <div className='statsGrid' style={{ marginBottom: '20px' }}>
        <Stat label='Total Referrals' value={totalReferrals.toString()} icon={<Users />} />
        <Stat label='Activated Payouts' value={activatedReferrals.toString()} icon={<Gift />} />
        <Stat label='Rewards Paid' value={`₹${totalBonusPaid.toLocaleString('en-IN')}`} icon={<IndianRupee />} />
        <Stat label='Pending Hold Rewards' value={`₹${pendingHoldAmount.toLocaleString('en-IN')}`} icon={<Clock />} />
      </div>

      {/* REFERRAL REWARD HOLD & RELEASE QUEUE */}
      <Card style={{ padding: '20px', marginBottom: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Referral Payout Holds & Release Queue ({referralQueue.filter(r => r.status === 'Pending Hold').length} Pending)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
              Inspect friends who joined via user referral links. Release ₹50 hold rewards directly to referrer's wallet.
            </p>
          </div>
          <Badge tone={referralQueue.filter(r => r.status === 'Pending Hold').length > 0 ? 'orange' : 'green'}>
            {referralQueue.filter(r => r.status === 'Pending Hold').length} Awaiting Release
          </Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '10px 12px' }}>Referrer Name</th>
                <th style={{ padding: '10px 12px' }}>Friend (Referee)</th>
                <th style={{ padding: '10px 12px' }}>Referral Code</th>
                <th style={{ padding: '10px 12px' }}>Joined Date</th>
                <th style={{ padding: '10px 12px' }}>Reward Amount</th>
                <th style={{ padding: '10px 12px' }}>Hold Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {referralQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    No referral joins queued yet.
                  </td>
                </tr>
              ) : (
                referralQueue.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{r.referrer_name || 'Auditor User'}</td>
                    <td style={{ padding: '12px' }}>
                      <b style={{ color: '#0f172a', display: 'block' }}>{r.referee_name}</b>
                      <small style={{ color: '#64748b' }}>{r.referee_email}</small>
                    </td>
                    <td style={{ padding: '12px' }}><Badge tone="purple">{r.referral_code}</Badge></td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{r.joined_at ? new Date(r.joined_at).toLocaleDateString() : 'Today'}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#10b981' }}>₹{r.reward_amount}</td>
                    <td style={{ padding: '12px' }}>
                      <Badge tone={r.status === 'Credited' ? 'green' : r.status === 'Rejected' ? 'red' : 'orange'}>
                        {r.status === 'Pending Hold' ? '⚠️ Pending Hold' : r.status === 'Credited' ? '✅ Credited' : r.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {r.status === 'Pending Hold' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className='primary' 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleReleaseReward(r)}
                          >
                            Release ₹{r.reward_amount} to Wallet
                          </button>
                          <button 
                            className='danger' 
                            style={{ padding: '6px 10px', fontSize: '12px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                            onClick={() => handleRejectReferral(r)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          {r.status === 'Credited' ? 'Wallet Paid' : 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className='tableToolbar' style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className='searchBox' style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px' }}>
          <Search size={16} color="#64748b" />
          <input 
            placeholder='Search bonus program title or rule...' 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 0, outline: 'none', width: '100%', padding: '8px 0', fontSize: '13px' }}
          />
        </div>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
          <option value="All">All Types</option>
          <option value="Referral">Referral</option>
          <option value="Challenge">Challenge</option>
        </select>
      </div>

      <div className='campaignGrid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredPrograms.length === 0 ? (
          <Card style={{ padding: '30px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>No bonus programs match filters.</Card>
        ) : (
          filteredPrograms.map(p => (
            <Card key={p.id} style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className='between' style={{ marginBottom: '10px' }}>
                  <Badge tone={p.type === 'Referral' ? 'purple' : 'green'}>{p.type}</Badge>
                  <button className='iconBtn' onClick={() => handleCopyCode(p)} title="Copy referral code">
                    <Copy size={16} color="#64748b" />
                  </button>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700 }}>{p.name}</h3>
                <p className='muted' style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>{p.rule}</p>

                <div className='campaignMini' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', margin: '14px 0', border: '1px solid #e2e8f0' }}>
                  <div>
                    <b style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>{p.reward}</b>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Reward</span>
                  </div>
                  <div>
                    <b style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>{p.used}</b>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Qualified</span>
                  </div>
                  <div>
                    <b style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>{p.ends}</b>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Ends</span>
                  </div>
                </div>
              </div>

              <div className='between' style={{ marginTop: '10px', alignItems: 'center' }}>
                <Badge tone={p.status === 'Active' ? 'green' : 'orange'}>{p.status}</Badge>
                <button className='ghost' onClick={() => showToast(`Configuring rule settings for ${p.name}`)}>
                  Manage Rule
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div className='between' style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Create Bonus Program</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowAddModal(false)} />
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Program Title
                <input type="text" placeholder="e.g. Festival Audit Streak Bonus" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  Category Type
                  <select value={newRule.type} onChange={e => setNewRule({ ...newRule, type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="Referral">Referral</option>
                    <option value="Challenge">Challenge</option>
                  </select>
                </label>

                <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  Reward Value (₹)
                  <input type="text" placeholder="₹200" value={newRule.reward} onChange={e => setNewRule({ ...newRule, reward: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </label>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Qualification Rule Condition
                <textarea rows="3" placeholder="e.g. Complete 5 approved tasks within 7 days." value={newRule.rule} onChange={e => setNewRule({ ...newRule, rule: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </label>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary">Launch Bonus Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
