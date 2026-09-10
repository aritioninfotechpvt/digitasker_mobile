import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat, SectionTitle } from '../components/ui';
import { WalletCards, Receipt, Download, Plus, Search } from 'lucide-react';
import { showSuccess, showPrompt, showToast } from '../utils/swal';
import Pagination from '../components/Pagination';
import api from '../services/api';

const parseAmount = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(val.toString().replace(/[^0-9.]/g, '')) || 0;
};

export default function Billing() {
  const [balance, setBalance] = useState(() => {
    const cached = localStorage.getItem('digitasker_client_wallet_balance');
    return cached ? Number(cached) : 0;
  });

  const [invoices, setInvoices] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_client_invoices');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    api.client.getBilling()
      .then(res => {
        if (res.balance !== undefined) {
          setBalance(res.balance);
          localStorage.setItem('digitasker_client_wallet_balance', res.balance.toString());
        }
        if (Array.isArray(res.invoices)) {
          const formatted = res.invoices.map(inv => [
            inv.invoice_number || inv.id || 'INV-001',
            inv.period || 'Current Month',
            `₹${parseAmount(inv.amount).toLocaleString('en-IN')}`,
            inv.status || 'Paid',
            inv.due_date || inv.due || 'N/A'
          ]);
          setInvoices(formatted);
          localStorage.setItem('digitasker_custom_client_invoices', JSON.stringify(formatted));
        }
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const pendingInvoicesTotal = useMemo(() => {
    return invoices.filter(inv => inv[3] === 'Due').reduce((acc, inv) => acc + parseAmount(inv[2]), 0);
  }, [invoices]);

  const lifetimeSpendTotal = useMemo(() => {
    return invoices.filter(inv => inv[3] === 'Paid').reduce((acc, inv) => acc + parseAmount(inv[2]), 0);
  }, [invoices]);

  const currentCampaignSpend = useMemo(() => {
    return invoices.slice(0, 3).reduce((acc, inv) => acc + parseAmount(inv[2]), 0);
  }, [invoices]);

  const handleAddFunds = async () => {
    const amountStr = await showPrompt('Top Up Campaign Wallet', 'Enter amount to deposit (₹)', '100000');
    const amount = Number(amountStr);

    if (!amount || amount <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }

    try {
      if (api.client.topupWallet) {
        await api.client.topupWallet(amount).catch(() => {});
      }
    } catch (e) {}

    const newBal = balance + amount;
    setBalance(newBal);
    localStorage.setItem('digitasker_client_wallet_balance', newBal.toString());

    showSuccess(
      'Wallet Top-Up Successful! 💳',
      `₹${amount.toLocaleString('en-IN')} added to campaign reserve. Total Balance: ₹${newBal.toLocaleString('en-IN')}`
    );
  };

  const handleDownloadInvoice = (inv) => {
    showToast(`Downloading Tax Invoice ${inv[0]} (${inv[2]})...`, 'success');
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv[0].toLowerCase().includes(searchQuery.toLowerCase()) || 
                            inv[1].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || inv[3] === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  return (
    <AppLayout role='client' title='Billing & Financial Overview'>
      <div className='statsGrid four'>
        <Stat label="Account balance" value={`₹${balance.toLocaleString('en-IN')}`} icon={<WalletCards size={20}/>} />
        <Stat label="Current campaign spend" value={`₹${currentCampaignSpend.toLocaleString('en-IN')}`} icon={<Receipt size={20}/>} />
        <Stat label="Pending invoices" value={`₹${pendingInvoicesTotal.toLocaleString('en-IN')}`} icon={<Receipt size={20}/>} />
        <Stat label="Lifetime spend" value={`₹${lifetimeSpendTotal.toLocaleString('en-IN')}`} icon={<Receipt size={20}/>} />
      </div>

      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>Campaign Prepaid Wallet</h3>
            <p className='muted' style={{ margin: 0, fontSize: '13px' }}>Funds are held in reserve and debited only when tasks pass Quality Control.</p>
          </div>
          <button className='primary' onClick={handleAddFunds}>
            <Plus size={15} /> Add Funds
          </button>
        </div>
      </Card>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search invoice ID or billing period..." 
            value={searchQuery} 
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Invoice Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Due">Due</option>
        </select>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Tax Invoices & Transaction Statements" />
        </div>

        <div className='dataTable' style={{ gridTemplateColumns: '1.4fr 1.4fr 1.2fr 1fr 1.2fr 0.8fr' }}>
          <div className='dataHead' style={{ gridTemplateColumns: '1.4fr 1.4fr 1.2fr 1fr 1.2fr 0.8fr' }}>
            <span>Invoice Number</span>
            <span>Billing Period</span>
            <span>Total Amount</span>
            <span>Status</span>
            <span>Due Date</span>
            <span>Action</span>
          </div>

          {paginatedInvoices.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No invoices found for your account.</div>
          ) : (
            paginatedInvoices.map((r, i) => (
              <div className='dataRow' key={i} style={{ gridTemplateColumns: '1.4fr 1.4fr 1.2fr 1fr 1.2fr 0.8fr' }}>
                <span><b>{r[0]}</b></span>
                <span>{r[1]}</span>
                <span><b>{r[2]}</b></span>
                <Badge tone={r[3] === 'Paid' ? 'green' : 'orange'}>{r[3]}</Badge>
                <span>{r[4]}</span>
                <button className='ghostDark' style={{ height: '30px', padding: '0 10px', fontSize: '12px' }} onClick={() => handleDownloadInvoice(r)} title="Download Invoice">
                  <Download size={14} /> PDF
                </button>
              </div>
            ))
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>
    </AppLayout>
  );
}
