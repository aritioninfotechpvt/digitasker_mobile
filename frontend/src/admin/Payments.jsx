import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { IndianRupee, Clock3, Wallet, Landmark, Search, Download, CheckCircle2, Pause, Eye, FileSpreadsheet, Filter } from 'lucide-react';
import { Card, Badge, Stat, SectionTitle } from '../components/ui';
import { showSuccess, showConfirm, showToast, showRichModal } from '../utils/swal';
import Pagination from '../components/Pagination';

import api from '../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  React.useEffect(() => {
    api.admin.getPayouts()
      .then(res => {
        if (res.payouts && res.payouts.length > 0) {
          setPayments(res.payouts.map(p => ({
            id: p.payout_code || `PAY-${p.id}`,
            user: p.user?.name || 'Auditor',
            email: p.user?.email || 'user@example.com',
            type: p.type || 'Task Reward',
            amount: parseFloat(p.amount) || 0,
            status: p.status || 'Processing',
            date: new Date(p.created_at || Date.now()).toLocaleDateString(),
            method: p.payout_method || 'Bank Transfer'
          })));
        }
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('amount');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPaidOut = useMemo(() => payments.filter(p => p.status === 'Completed' || p.status === 'Approved').reduce((acc, p) => acc + p.amount, 0), [payments]);
  const paymentsOnHold = useMemo(() => payments.filter(p => p.status === 'On Hold').reduce((acc, p) => acc + p.amount, 0), [payments]);
  const availableToUsers = useMemo(() => payments.filter(p => p.status === 'Available').reduce((acc, p) => acc + p.amount, 0), [payments]);
  const withdrawalRequestsCount = useMemo(() => payments.filter(p => p.type === 'Withdrawal' || p.status === 'Processing').length, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = 
        p.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.method.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const sortedPayments = useMemo(() => {
    const list = [...filteredPayments];
    if (sortBy === 'amount') {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'id') {
      list.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'user') {
      list.sort((a, b) => a.user.localeCompare(b.user));
    }
    return list;
  }, [filteredPayments, sortBy]);

  const totalPages = Math.ceil(sortedPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPayments.slice(start, start + pageSize);
  }, [sortedPayments, currentPage, pageSize]);

  const handleApprovePayment = async (pay) => {
    const confirmed = await showConfirm(
      `Release Payment ${pay.id}?`,
      `Approve and release ₹${pay.amount} to ${pay.user} (${pay.method})?`
    );

    if (confirmed) {
      setPayments(payments.map(p => p.id === pay.id ? { ...p, status: 'Available' } : p));
      showSuccess('Payment Released! 💸', `₹${pay.amount} has been approved for ${pay.user}.`);
    }
  };

  const handleHoldPayment = async (pay) => {
    const confirmed = await showConfirm(
      `Hold Payment ${pay.id}?`,
      `Place ₹${pay.amount} payout for ${pay.user} on compliance hold?`
    );

    if (confirmed) {
      setPayments(payments.map(p => p.id === pay.id ? { ...p, status: 'On Hold' } : p));
      showToast(`Payment ${pay.id} placed on hold.`, 'warning');
    }
  };

  const handleViewLedger = (pay) => {
    showRichModal(
      `Payment Ledger: ${pay.id}`,
      `<div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><b>Transaction ID:</b> ${pay.id}</p>
        <p><b>Recipient:</b> ${pay.user} (${pay.email})</p>
        <p><b>Transaction Type:</b> ${pay.type}</p>
        <p><b>Amount:</b> <span style="color:#059669; font-weight:800;">₹${pay.amount}</span></p>
        <p><b>Payment Method:</b> ${pay.method}</p>
        <p><b>Status:</b> ${pay.status}</p>
        <p><b>Date:</b> ${pay.date}</p>
      </div>`
    );
  };

  const handleExportExcel = () => {
    const headers = ['Transaction ID', 'User Name', 'Email', 'Payment Type', 'Amount (INR)', 'Payment Method', 'Status', 'Date'];
    const rows = sortedPayments.map(p => [
      p.id,
      `"${p.user}"`,
      `"${p.email}"`,
      `"${p.type}"`,
      p.amount,
      `"${p.method}"`,
      p.status,
      p.date
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `insightloop_payments_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Excel / CSV Export Ready! 📊', `Downloaded ${sortedPayments.length} financial payment transaction records.`);
  };

  return (
    <AppLayout role="admin" title="Payments, Earnings & Payout Control">
      {/* Top Financial Stats */}
      <div className="statsGrid four">
        <Stat label="Total Paid Out" value={`₹${totalPaidOut.toLocaleString()}`} icon={<IndianRupee size={20}/>} />
        <Stat label="Payments On Hold" value={`₹${paymentsOnHold.toLocaleString()}`} icon={<Clock3 size={20}/>} />
        <Stat label="Available to Users" value={`₹${availableToUsers.toLocaleString()}`} icon={<Wallet size={20}/>} />
        <Stat label="Withdrawal Requests" value={withdrawalRequestsCount.toString()} icon={<Landmark size={20}/>} />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: 0, overflow: 'hidden', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <SectionTitle 
            title={`Financial Transactions & Payment Queue (${sortedPayments.length})`} 
            action="Export Excel / CSV"
            onActionClick={handleExportExcel}
          />
        </div>

        <div className="advancedToolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px 16px 0' }}>
          <div className="searchBox" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px' }}>
            <Search size={16} color="#64748b" />
            <input 
              placeholder="Search user, payment ID, transaction type..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ border: 0, padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', fontSize: '13.5px' }}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', outline: 'none', fontWeight: 600 }}
          >
            <option value="All">All Payment Statuses</option>
            <option value="Available">Available / Approved</option>
            <option value="On Hold">On Hold</option>
            <option value="Processing">Processing</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', outline: 'none', fontWeight: 600 }}
          >
            <option value="amount">Sort: Amount (High to Low)</option>
            <option value="id">Sort: Payment ID</option>
            <option value="user">Sort: User Recipient (A-Z)</option>
          </select>

          <button 
            className="primary" 
            onClick={handleExportExcel}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', background: '#0066ff', color: '#ffffff', border: 0, cursor: 'pointer' }}
          >
            <FileSpreadsheet size={16} /> Excel Report
          </button>
        </div>

        <div className="dataTable" style={{ marginTop: '14px' }}>
          <div className="dataHead" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1.1fr 0.9fr 1.2fr 0.8fr 1fr', gap: '10px', padding: '10px 16px', background: '#f8fafc', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            <span>ID</span>
            <span>User Recipient</span>
            <span>Payment Type</span>
            <span>Amount</span>
            <span>Payout Method</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {paginatedPayments.map((p) => (
            <div className="dataRow" key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1.1fr 0.9fr 1.2fr 0.8fr 1fr', gap: '10px', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
              <b style={{ color: '#0f172a', fontFamily: 'monospace' }}>{p.id}</b>
              <div>
                <b style={{ color: '#0f172a', display: 'block' }}>{p.user}</b>
                <small style={{ color: '#64748b', fontSize: '11px' }}>{p.date}</small>
              </div>
              <span style={{ color: '#334155', fontWeight: 600 }}>{p.type}</span>
              <strong style={{ color: '#059669', fontSize: '14px' }}>₹{p.amount}</strong>
              <span style={{ color: '#64748b', fontSize: '12px' }}>{p.method}</span>
              <div>
                <Badge tone={p.status === 'Available' ? 'green' : p.status === 'On Hold' ? 'red' : 'orange'}>{p.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleViewLedger(p)}
                  title="View Ledger"
                  style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', color: '#475569' }}
                >
                  <Eye size={13} />
                </button>
                {p.status === 'On Hold' ? (
                  <button 
                    onClick={() => handleApprovePayment(p)}
                    title="Approve & Release Payment"
                    style={{ padding: '6px 10px', borderRadius: '6px', border: 0, background: '#0066ff', color: '#ffffff', cursor: 'pointer', fontWeight: 600, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <CheckCircle2 size={13} /> Release
                  </button>
                ) : (
                  <button 
                    onClick={() => handleHoldPayment(p)}
                    title="Place on Hold"
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', cursor: 'pointer', fontWeight: 600, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Pause size={13} /> Hold
                  </button>
                )}
              </div>
            </div>
          ))}

          {paginatedPayments.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              No transactions found matching search or filter criteria.
            </div>
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedPayments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </AppLayout>
  );
}
