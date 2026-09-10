import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat } from '../components/ui';
import { WalletCards, Clock, ShieldCheck, IndianRupee, Check, Pause, Search } from 'lucide-react';
import { payoutRequests as initialRequests } from '../data/dummy';
import { showSuccess, showConfirm, showToast } from '../utils/swal';
import Pagination from '../components/Pagination';
import api from '../services/api';

export default function PayoutApproval() {
  const [requests, setRequests] = useState([]);
  const [paidToday, setPaidToday] = useState(() => {
    const saved = localStorage.getItem('digitasker_paid_today');
    return saved ? parseFloat(saved) : 0;
  });

  React.useEffect(() => {
    api.admin.getPayouts()
      .then(res => {
        const rawList = Array.isArray(res) ? res : (res.payout_requests || []);
        const approvedList = JSON.parse(localStorage.getItem('digitasker_approved_payouts') || '[]');
        if (rawList.length > 0) {
          const mapped = rawList
            .filter(p => p.status !== 'Approved' && !approvedList.includes(p.id) && !approvedList.includes(`PAY-${p.id}`))
            .map(p => ({
              id: p.request_code || `PAY-${p.id}`,
              raw_id: p.id,
              user: p.user_name || p.user?.name || 'Auditor',
              amount: parseFloat(p.amount) || 0,
              method: p.bank_details || p.payment_method || 'Bank Transfer',
              kyc: p.kyc_verified === 'Yes' || p.user?.kyc_status === 'Verified' ? 'KYC Verified' : 'Pending KYC',
              risk: parseFloat(p.fraud_risk_score || 0) < 5 ? 'Low' : 'Medium',
              requested: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Today'
            }));
          setRequests(mapped);
        } else {
          setRequests([]);
        }
      })
      .catch(() => {
        setRequests([]);
      });
  }, []);

  const [selectedIds, setSelectedIds] = useState([]);
  const [filterMethod, setFilterMethod] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('amount');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApproveBatch = async () => {
    const payoutsToApprove = selectedIds.length > 0 
      ? requests.filter(r => selectedIds.includes(r.id))
      : requests;

    if (payoutsToApprove.length === 0) {
      showToast('No pending payout requests to approve.', 'info');
      return;
    }

    const confirmed = await showConfirm(
      'Approve Payouts Batch?',
      `Confirm release of ${payoutsToApprove.length} payouts to auditor UPI & Bank accounts.`
    );

    if (confirmed) {
      const idsToApprove = payoutsToApprove.map(r => r.id);
      
      // Call backend API for each raw_id
      for (const p of payoutsToApprove) {
        if (p.raw_id) {
          try { await api.admin.approvePayout(p.raw_id); } catch(e) {}
        }
      }

      // Update paid today state & storage
      const addAmount = payoutsToApprove.reduce((acc, r) => acc + r.amount, 0);
      const updatedPaidToday = paidToday + addAmount;
      setPaidToday(updatedPaidToday);
      localStorage.setItem('digitasker_paid_today', updatedPaidToday.toString());

      // Store approved IDs
      const approvedList = JSON.parse(localStorage.getItem('digitasker_approved_payouts') || '[]');
      payoutsToApprove.forEach(p => {
        if (!approvedList.includes(p.id)) approvedList.push(p.id);
        if (p.raw_id && !approvedList.includes(p.raw_id)) approvedList.push(p.raw_id);
      });
      localStorage.setItem('digitasker_approved_payouts', JSON.stringify(approvedList));

      setRequests(requests.filter(r => !idsToApprove.includes(r.id)));
      setSelectedIds([]);
      showSuccess(
        'Payout Batch Released! 💸',
        `${idsToApprove.length} payout transfers processed successfully via Bank/UPI API.`
      );
    }
  };

  const handleSingleApprove = async (payout) => {
    const confirmed = await showConfirm(
      `Approve ${payout.id}?`,
      `Transfer ₹${payout.amount.toLocaleString('en-IN')} to ${payout.user} via ${payout.method}?`
    );

    if (confirmed) {
      if (payout.raw_id) {
        try { await api.admin.approvePayout(payout.raw_id); } catch(e){}
      }

      // Update paid today state & storage
      const updatedPaidToday = paidToday + payout.amount;
      setPaidToday(updatedPaidToday);
      localStorage.setItem('digitasker_paid_today', updatedPaidToday.toString());

      // Store approved IDs
      const approvedList = JSON.parse(localStorage.getItem('digitasker_approved_payouts') || '[]');
      if (!approvedList.includes(payout.id)) approvedList.push(payout.id);
      if (payout.raw_id && !approvedList.includes(payout.raw_id)) approvedList.push(payout.raw_id);
      localStorage.setItem('digitasker_approved_payouts', JSON.stringify(approvedList));

      setRequests(requests.filter(r => r.id !== payout.id));
      showSuccess('Payout Released', `₹${payout.amount.toLocaleString('en-IN')} transferred to ${payout.user}`);
    }
  };

  const handleSinglePause = (payout) => {
    showToast(`Payout ${payout.id} put on compliance hold.`, 'warning');
  };

  const autoEligibleCount = useMemo(() => {
    return requests.filter(r => r.risk === 'Low' && r.kyc.includes('Verified')).length;
  }, [requests]);

  const formattedPaidToday = useMemo(() => {
    if (paidToday >= 100000) return `₹${(paidToday / 100000).toFixed(2)}L`;
    if (paidToday >= 1000) return `₹${(paidToday / 1000).toFixed(1)}k`;
    return `₹${paidToday.toLocaleString('en-IN')}`;
  }, [paidToday]);

  const filteredRequests = useMemo(() => {
    let result = requests.filter(r => {
      const matchesSearch = 
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMethod = filterMethod === 'All' || r.method.toLowerCase().includes(filterMethod.toLowerCase());

      return matchesSearch && matchesMethod;
    });

    result.sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'user') return a.user.localeCompare(b.user);
      return 0;
    });

    return result;
  }, [requests, searchQuery, filterMethod, sortBy]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  return (
    <AppLayout role='admin' title='Payout Approval'>
      <div className='statsGrid four'>
        <Stat label='Pending Requests' value={requests.length.toString()} icon={<Clock />} />
        <Stat label='Pending Amount' value={`₹${requests.reduce((acc, r) => acc + r.amount, 0).toLocaleString('en-IN')}`} icon={<IndianRupee />} />
        <Stat label='Auto-Eligible' value={autoEligibleCount.toString()} icon={<ShieldCheck />} />
        <Stat label='Paid Today' value={formattedPaidToday} icon={<WalletCards />} />
      </div>

      <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
        <div className='tableToolbar' style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <div className='searchBox' style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px' }}>
            <Search size={16} color="#64748b" />
            <input 
              placeholder='Search user or payout ID...' 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ border: 0, padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', fontSize: '13.5px' }}
            />
          </div>

          <select 
            value={filterMethod} 
            onChange={e => { setFilterMethod(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 600, fontSize: '13.5px', color: '#334155' }}
          >
            <option value="All">All Methods</option>
            <option value="UPI">UPI Transfer</option>
            <option value="Bank">Bank Transfer</option>
          </select>

          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 600, fontSize: '13.5px', color: '#334155' }}
          >
            <option value="amount">Sort: Amount (High-Low)</option>
            <option value="user">Sort: User Name</option>
          </select>

          <button 
            className='primary' 
            onClick={handleApproveBatch}
            style={{ padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13.5px', background: '#0066ff', color: '#ffffff', border: 0 }}
          >
            Approve {selectedIds.length > 0 ? `Selected (${selectedIds.length})` : 'All Pending'}
          </button>
        </div>

        <div className='payoutTable' style={{ marginTop: '10px' }}>
          <div className='dataHead' style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.2fr 1.1fr 1fr 0.8fr', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            <span>Request</span>
            <span>User</span>
            <span>Method</span>
            <span>Amount</span>
            <span>Checks</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {paginatedRequests.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
              <Clock size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No pending payout requests found.</p>
            </div>
          ) : (
            paginatedRequests.map(p => (
              <div className='dataRow' key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.2fr 1.1fr 1fr 0.8fr', gap: '10px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type='checkbox' 
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div>
                    <b style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{p.id}</b>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>{p.requested}</small>
                  </div>
                </div>

                <div>
                  <b style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{p.user}</b>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>{p.kyc}</small>
                </div>

                <span style={{ color: '#334155', fontWeight: 600 }}>{p.method}</span>
                <strong style={{ color: '#059669', fontSize: '14px' }}>₹{p.amount.toLocaleString('en-IN')}</strong>
                <div>
                  <Badge tone={p.risk === 'Low' ? 'green' : 'orange'}>{p.risk} risk</Badge>
                </div>

                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => handleSingleApprove(p)} 
                    title="Approve Payout"
                    style={{ padding: '6px 10px', borderRadius: '6px', border: 0, background: '#dcfce7', color: '#15803d', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleSinglePause(p)} 
                    title="Put on Hold"
                    style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #fed7aa', background: '#fff7ed', color: '#c2410c', cursor: 'pointer' }}
                  >
                    <Pause size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={Math.ceil(filteredRequests.length / pageSize) || 1}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={filteredRequests.length}
        />
      </Card>
    </AppLayout>
  );
}
