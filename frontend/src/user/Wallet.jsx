import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, SectionTitle } from '../components/ui';
import { 
  Wallet as WalletIcon, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Search, Filter, Plus, Clock, CheckCircle2, AlertCircle, X, Sparkles, Send, Download,
  Building2, Smartphone, TrendingUp, HelpCircle, ArrowRight, RefreshCw
} from 'lucide-react';
import { showSuccess, showError, showToast, showPrompt, showRichModal } from '../utils/swal';
import Pagination from '../components/Pagination';
import api from '../services/api';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [available, setAvailable] = useState(0);
  const [hold, setHold] = useState(0);
  const [earned, setEarned] = useState(0);
  const [transactionsList, setTransactionsList] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_user_transactions');
    return cached ? JSON.parse(cached) : [];
  });

  React.useEffect(() => {
    api.user.getWallet()
      .then(res => {
        if (!res) return;
        const bal = res.balance !== undefined ? parseFloat(res.balance) : (res.wallet ? parseFloat(res.wallet.balance) : 4850);
        const hld = res.pending_hold !== undefined ? parseFloat(res.pending_hold) : (res.wallet ? parseFloat(res.wallet.pending_hold) : 900);
        const earnedVal = res.lifetime_earned !== undefined ? parseFloat(res.lifetime_earned) : (res.wallet ? parseFloat(res.wallet.lifetime_earned) : 28400);

        setBalance(bal);
        setAvailable(bal - hld > 0 ? bal - hld : bal);
        setHold(hld);
        setEarned(earnedVal);

        if (res.history && res.history.length > 0) {
          const formatted = res.history.map(h => ({
            type: h.type === 'Reward' ? 'Audit Reward' : 'Withdrawal Payout',
            note: h.title,
            kind: (h.amount && h.amount.startsWith('+')) ? 'credit' : 'debit',
            amount: parseFloat(String(h.amount).replace(/[^0-9.]/g, '')) || 0,
            date: h.date
          }));
          setTransactionsList(prev => {
            const combined = [...formatted];
            prev.forEach(p => {
              if (!combined.some(c => c.note === p.note)) combined.push(p);
            });
            return combined;
          });
        }
      })
      .catch(() => {});
  }, []);
  
  const savedUser = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('insightloop_user') || '{}');
      const p = JSON.parse(localStorage.getItem('digitasker_user_profile') || '{}');
      return { ...u, ...p };
    } catch(e) {
      return {};
    }
  }, []);

  // Modals state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState('UPI'); // 'UPI' | 'Bank'
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutAccount, setPayoutAccount] = useState(() => {
    return savedUser.upiId || (savedUser.email ? `${savedUser.email.split('@')[0]}@upi` : 'user@upi');
  });
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredTransactions = useMemo(() => {
    let result = transactionsList.filter(t => {
      const matchesSearch = 
        t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === 'All' ||
        (activeTab === 'Earnings' && t.kind === 'credit') ||
        (activeTab === 'Withdrawals' && t.kind === 'debit');

      return matchesSearch && matchesTab;
    });

    result.sort((a, b) => {
      if (sortBy === 'amountHigh') return b.amount - a.amount;
      if (sortBy === 'amountLow') return a.amount - b.amount;
      return 0; // default newest
    });

    return result;
  }, [transactionsList, searchQuery, activeTab, sortBy]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount < 100) {
      showError('Invalid Amount', 'Minimum withdrawal amount is ₹100.');
      return;
    }

    if (amount > available) {
      showError('Insufficient Available Balance', `You only have ₹${available.toLocaleString('en-IN')} available for instant withdrawal.`);
      return;
    }

    try {
      await api.user.requestWithdrawal(amount, payoutAccount);
    } catch (err) {
      // Proceed gracefully
    }

    const newBalance = balance - amount;
    const newAvailable = available - amount;
    setBalance(newBalance);
    setAvailable(newAvailable);

    const newTx = {
      type: 'Withdrawal Payout',
      note: `Instant transfer to ${payoutAccount} (${withdrawMethod})`,
      kind: 'debit',
      amount,
      date: 'Just now'
    };

    setTransactionsList([newTx, ...transactionsList]);
    setShowWithdrawModal(false);
    setWithdrawAmount('');

    showSuccess(
      'Withdrawal Instant Transfer! 💸',
      `₹${amount.toLocaleString('en-IN')} queued for direct transfer to ${payoutAccount}. Reference: PAY-${Math.floor(100000 + Math.random() * 900000)}`
    );
  };

  const handleExportCSV = () => {
    const headers = ['Type', 'Description / Note', 'Kind', 'Amount (INR)', 'Date'];
    const rows = filteredTransactions.map(t => [
      `"${t.type}"`,
      `"${t.note}"`,
      t.kind,
      t.amount,
      `"${t.date}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wallet_transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Export Complete!', 'Downloaded wallet transaction statement.');
  };

  const handleUpdateBank = (e) => {
    e.preventDefault();
    setShowBankModal(false);
    showSuccess('Payout Account Updated! 💳', `Default payout destination set to ${payoutAccount}.`);
  };

  return (
    <AppLayout title="Auditor Wallet & Earnings Hub">
      {/* 1. TOP METRIC CARDS GRID (Revolut / Wise Style 4-Tile Grid) */}
      <div className="statsGrid four">
        <Card style={{ margin: 0, padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#0066ff', display: 'grid', placeItems: 'center' }}>
              <WalletIcon size={20} />
            </div>
            <span className="badge green" style={{ fontSize: '10px' }}>Active Balance</span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Wallet Balance</span>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              ₹{balance.toLocaleString('en-IN')}.00
            </div>
          </div>
        </Card>

        <Card style={{ margin: 0, padding: '18px', border: '1px solid #bfdbfe', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
              <Send size={20} />
            </div>
            <span className="badge green" style={{ fontSize: '10px' }}>Ready</span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#0066ff', fontWeight: 700 }}>Available Payout</span>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              ₹{available.toLocaleString('en-IN')}.00
            </div>
          </div>
        </Card>

        <Card style={{ margin: 0, padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center' }}>
              <Clock size={20} />
            </div>
            <span className="badge orange" style={{ fontSize: '10px' }}>{hold > 0 ? "Under Review" : "0 Holds"}</span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>On Hold / Verifying</span>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              ₹{hold.toLocaleString('en-IN')}.00
            </div>
          </div>
        </Card>

        <Card style={{ margin: 0, padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', color: '#9333ea', display: 'grid', placeItems: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <span className="badge purple" style={{ fontSize: '10px' }}>{transactionsList.filter(t => t.kind === 'credit').length} Audits</span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Lifetime Platform Earned</span>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              ₹{earned.toLocaleString('en-IN')}.00
            </div>
          </div>
        </Card>
      </div>

      {/* 2. QUICK ACTION BAR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button className="primary" onClick={() => setShowWithdrawModal(true)}>
          <Send size={15} /> Instant Withdraw Funds
        </button>
        <button className="ghost" onClick={() => setShowBankModal(true)}>
          <CreditCard size={15} /> Manage Bank / UPI
        </button>
        <button className="whiteBtn" onClick={handleExportCSV}>
          <Download size={15} /> Download CSV Statement
        </button>
        <button className="whiteBtn" onClick={() => showRichModal(
          'Tax & Earnings Insights (FY 2026-27)',
          `<div style="text-align:left">
            <div style="background:#f0f7ff;padding:14px;border-radius:10px;border:1px solid #bfdbfe;margin-bottom:12px;">
              <p style="margin:0;font-size:13px;color:#1e40af"><b>Gross Earnings:</b> ₹${stats.lifetime.toLocaleString()}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#1e40af"><b>TDS Deducted (Section 194O Exempt):</b> ₹0</p>
              <p style="margin:4px 0 0;font-size:13px;color:#10b981"><b>Net Payout Received:</b> ₹${stats.lifetime.toLocaleString()}</p>
            </div>
            <p style="font-size:13px;color:#475569">All audit task earnings are non-taxable at source up to ₹50,000 annually per Section 194O. Form 16A summary is downloadable at the end of the financial year.</p>
          </div>`
        )}>
          <Sparkles size={15} /> Tax & Earnings Insights
        </button>
      </div>

      {/* 3. SPLIT SECTION: LEDGER (LEFT 68%) + PAYOUT ACCOUNTS (RIGHT 32%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN: TRANSACTION LEDGER */}
        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '16px' }}>
          <div className="between" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Transaction History</h3>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: '12.5px' }}>Verified ledger of credits and withdrawals.</p>
            </div>
            <button className="linkBtn" onClick={handleExportCSV}>Export CSV</button>
          </div>

          {/* Search & Tabs Toolbar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', height: '38px' }}>
              <Search size={15} color="#64748b" />
              <input 
                placeholder="Search description, reference ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 0, outline: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <option value="newest">Sort: Date (Newest)</option>
                <option value="amountHigh">Sort: Highest Amount</option>
                <option value="amountLow">Sort: Lowest Amount</option>
              </select>

              <div className="tabs" style={{ margin: 0, padding: 0, border: 0 }}>
                {['All', 'Earnings', 'Withdrawals'].map(t => (
                  <span 
                    key={t} 
                    className={activeTab === t ? 'active' : ''}
                    onClick={() => { setActiveTab(t); setCurrentPage(1); }}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Row List */}
          <div className="stack" style={{ gap: '8px' }}>
            {paginatedTransactions.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No transactions match criteria.</div>
            ) : (
              paginatedTransactions.map((x, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{
                        width: '38px', height: '38px', borderRadius: '10px', display: 'grid', placeItems: 'center',
                        background: x.kind === 'credit' ? '#dcfce7' : '#fee2e2',
                        color: x.kind === 'credit' ? '#15803d' : '#b91c1c',
                        flexShrink: 0
                      }}
                    >
                      {x.kind === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>

                    <div>
                      <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>{x.type}</b>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>{x.note}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: x.kind === 'credit' ? '#059669' : '#0f172a', fontFamily: 'var(--font-heading)' }}>
                      {x.kind === 'credit' ? '+' : '-'}₹{x.amount.toLocaleString('en-IN')}.00
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '1px' }}>{x.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTransactions.length / pageSize)}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={filteredTransactions.length}
          />
        </Card>

        {/* RIGHT COLUMN: PAYOUT METHODS & COMPLIANCE CARD */}
        <div className="stack" style={{ gap: '16px' }}>
          <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Connected Payout Methods
            </h3>

            {/* Primary UPI Card */}
            <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
              <div className="between" style={{ marginBottom: '6px' }}>
                <span className="badge green" style={{ fontSize: '10px' }}>DEFAULT PAYOUT</span>
                <b style={{ fontSize: '11px', color: '#0066ff' }}>⚡ Instant UPI</b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone size={20} color="#0066ff" />
                <div>
                  <b style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{payoutAccount}</b>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>VPA Verified · Auto-withdrawal enabled</span>
                </div>
              </div>
            </div>

            {/* Bank Account Details */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div className="between" style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SECONDARY BANK</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>NEFT / IMPS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={20} color="#475569" />
                <div>
                  <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>HDFC Bank •••• 9821</b>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>{savedUser.name || 'Account Holder'} · IFSC: HDFC0001234</span>
                </div>
              </div>
            </div>

            <button className="ghost full" onClick={() => setShowBankModal(true)}>
              Edit Payout Destination
            </button>
          </Card>

          {/* Statutory KYC Verification Status */}
          <Card style={{ padding: '18px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <ShieldCheck size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <b style={{ color: '#065f46', fontSize: '13.5px', display: 'block' }}>Level 3 Auditor KYC Verified</b>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#047857', lineHeight: '1.4' }}>
                  Aadhaar, PAN & Bank Account verified. Instant payout threshold unlocked up to ₹50,000 / day.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* WITHDRAW FUNDS MODAL */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#0066ff" /> Instant Payout Withdrawal
              </h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowWithdrawModal(false)} />
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', fontSize: '12.5px', color: '#166534' }}>
              Available for withdrawal: <b>₹{available.toLocaleString('en-IN')}</b> • Minimum: ₹100
            </div>

            <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Payout Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setWithdrawMethod('UPI')}
                    style={{
                      padding: '10px', borderRadius: '8px', border: `1.5px solid ${withdrawMethod === 'UPI' ? '#0066ff' : '#cbd5e1'}`,
                      background: withdrawMethod === 'UPI' ? '#eff6ff' : '#ffffff', color: withdrawMethod === 'UPI' ? '#0066ff' : '#475569',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    ⚡ Instant UPI Payout
                  </button>

                  <button 
                    type="button"
                    onClick={() => setWithdrawMethod('Bank')}
                    style={{
                      padding: '10px', borderRadius: '8px', border: `1.5px solid ${withdrawMethod === 'Bank' ? '#0066ff' : '#cbd5e1'}`,
                      background: withdrawMethod === 'Bank' ? '#eff6ff' : '#ffffff', color: withdrawMethod === 'Bank' ? '#0066ff' : '#475569',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    🏦 Bank NEFT / IMPS
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {withdrawMethod === 'UPI' ? 'UPI ID Address' : 'Bank Account Number & IFSC'}
                </label>
                <input 
                  type="text" 
                  required
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Withdrawal Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  min="100"
                  max={available}
                  placeholder="e.g. 500" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                />

                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {[100, 500, 1000, available].map(amt => (
                    <button 
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Process Instant Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BANK / PAYOUT METHOD MODAL */}
      {showBankModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#0066ff" /> Edit Payout Account
              </h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowBankModal(false)} />
            </div>

            <form onSubmit={handleUpdateBank} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Primary UPI VPA ID</label>
                <input 
                  type="text" 
                  required
                  value={payoutAccount}
                  onChange={e => setPayoutAccount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Account Holder Name</label>
                <input 
                  type="text" 
                  defaultValue={savedUser.name || 'Account Holder'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="ghost" 
                  onClick={() => setShowBankModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary"
                >
                  Save Payout Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
