import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat } from '../components/ui';
import { ShieldAlert, Smartphone, MapPin, Image, WalletCards, History, Lock, CheckCircle2, Search, UserCheck } from 'lucide-react';
import { showSuccess, showConfirm, showToast } from '../utils/swal';

export default function UserRisk() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFreeze = async () => {
    if (!selectedUser) return;
    const confirmed = await showConfirm('Freeze User Wallet?', `Freeze wallet balance for ${selectedUser.name}?`);
    if (confirmed) showSuccess('Wallet Frozen', `Account payout hold applied for ${selectedUser.name}.`);
  };

  const handleReKyc = async () => {
    if (!selectedUser) return;
    showToast(`Re-KYC verification request sent to ${selectedUser.name}`);
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    const confirmed = await showConfirm('Suspend User Account?', `Are you sure you want to suspend ${selectedUser.name}?`);
    if (confirmed) showSuccess('Account Suspended', `${selectedUser.name} has been suspended.`);
  };

  return (
    <AppLayout role='admin' title='User Risk Profile'>
      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Search size={18} color="#64748b" />
          <input 
            type="text"
            placeholder="Search auditor or enter user ID (e.g. USR-1002, email or name)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 0, outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' }}
          />
        </div>
      </Card>

      {!selectedUser ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <UserCheck size={42} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>No User Selected</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>
            Enter a user ID or search name in the search bar above to view automated fraud signals and risk score profiles.
          </p>
        </Card>
      ) : (
        <>
          <div className='profileRiskHero card'>
            <div className='avatar xl'>{selectedUser.name ? selectedUser.name.substring(0, 2).toUpperCase() : 'US'}</div>
            <div className='grow'>
              <h2>{selectedUser.name}</h2>
              <p className='muted'>{selectedUser.id || 'USR-1001'} · {selectedUser.city || 'Location'} · Registered Auditor</p>
              <div className='row gap8'>
                <Badge tone='green'>{selectedUser.status || 'Active'}</Badge>
                <Badge tone='green'>KYC Verified</Badge>
                <Badge>Verified Auditor</Badge>
              </div>
            </div>
            <div className='riskMeter'>
              <b>{selectedUser.riskScore || 0}</b>
              <span>Risk Score / 100</span>
              <Badge tone={selectedUser.riskScore > 50 ? 'red' : 'green'}>{selectedUser.riskScore > 50 ? 'High Risk' : 'Low Risk'}</Badge>
            </div>
          </div>

          <div className='statsGrid'>
            <Stat label='Completed Tasks' value={(selectedUser.completed || 0).toString()} icon={<CheckCircle2/>} />
            <Stat label='Approval Rate' value={`${selectedUser.approval || 100}%`} icon={<ShieldAlert/>} />
            <Stat label='Devices Used' value={(selectedUser.devices || 1).toString()} icon={<Smartphone/>} />
            <Stat label='Lifetime Earned' value={`₹${(selectedUser.earned || 0).toLocaleString()}`} icon={<WalletCards/>} />
          </div>

          <div className='twoCol'>
            <div>
              <Card>
                <h3>Risk Signals</h3>
                {[
                  ['Device consistency', 'Normal', 'green'],
                  ['GPS consistency', 'Normal', 'green'],
                  ['Duplicate image checks', '0 matches', 'green'],
                  ['Payout account sharing', 'No duplicate', 'green']
                ].map(([a, b, t]) => (
                  <div className='adminRow' key={a}>
                    <div>
                      <b>{a}</b>
                      <span>Automated fraud signal</span>
                    </div>
                    <Badge tone={t}>{b}</Badge>
                  </div>
                ))}
              </Card>
            </div>

            <div>
              <Card>
                <h3>Identity & Device</h3>
                <div className='reviewMetric'><MapPin/><div><b>Primary location</b><span>{selectedUser.city || 'Location'}</span></div></div>
                <div className='reviewMetric'><Smartphone/><div><b>Current device</b><span>Verified Browser / Device</span></div></div>
                <div className='reviewMetric'><Image/><div><b>Media fingerprint</b><span>No reused evidence detected</span></div></div>
              </Card>

              <Card style={{ marginTop: '16px' }}>
                <h3>Admin Controls</h3>
                <div className='decisionStack'>
                  <button className='ghost' onClick={handleFreeze}><Lock size={16}/> Freeze Wallet</button>
                  <button className='ghost' onClick={handleReKyc}>Require Re-KYC</button>
                  <button className='danger' onClick={handleSuspend}>Suspend Account</button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
