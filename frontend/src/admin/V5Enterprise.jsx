import React, { useState, useMemo } from 'react';
import { 
  Activity, AlertTriangle, ArrowRight, BarChart3, BadgeIndianRupee, BriefcaseBusiness, Building2, 
  CalendarDays, CheckCircle2, Clock3, FileCheck2, FileText, Gavel, Globe2, IndianRupee, Layers3, 
  MapPinned, Network, ReceiptIndianRupee, Scale, Search, ShieldCheck, Sparkles, UsersRound, WalletCards, Zap, X, Plus, Edit3, Trash2, Check, RefreshCw
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Badge, Card, SectionTitle, Stat } from '../components/ui';
import Pagination from '../components/Pagination';
import { 
  vendorRateCards as initialRateCards, vendorContracts as initialContracts, vendorSettlementRows, 
  vendorCapacityRows, vendorBids, vendorScorecards, workforceRows, smartAllocationRows, 
  budgetControlRows, controlTowerAlerts, approvalChains, whiteLabelTenants, sourcingMix 
} from '../data/dummy';
import { showSuccess, showConfirm, showToast, showRichModal } from '../utils/swal';
import api from '../services/api';

const Page = ({ title, children }) => <AppLayout role="admin" title={title}>{children}</AppLayout>;
const Meter = ({ value }) => <div className="v5Meter"><i><b style={{ width: value }} /></i><span>{value}</span></div>;

// Shared Modal Overlay Wrapper
const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/* 1. OPERATIONS CONTROL TOWER */
export function OperationsControlTower() {
  const [incidents, setIncidents] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_incidents');
    return cached ? JSON.parse(cached) : [];
  });
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'High', scope: 'North Region', action: 'Inspect SLA drop' });

  const [qcCount, setQcCount] = useState(0);
  const [vendorHoldsVal, setVendorHoldsVal] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);

  React.useEffect(() => {
    Promise.allSettled([
      api.admin.getQCQueue(),
      api.admin.getSettlements(),
      api.admin.getTasks()
    ]).then(([qcRes, setRes, taskRes]) => {
      const qcList = qcRes.status === 'fulfilled' ? (qcRes.value.qc_queue || qcRes.value || []) : [];
      const setList = setRes.status === 'fulfilled' ? (setRes.value.settlements || setRes.value || []) : [];
      const tList = taskRes.status === 'fulfilled' ? (taskRes.value.tasks || taskRes.value || []) : [];

      setQcCount(qcList.filter(q => q.qc_status === 'Pending' || q.status === 'Pending').length);
      
      const holds = setList.filter(s => s.status === 'Hold' || s.status === 'Pending')
        .reduce((acc, s) => acc + (parseFloat(String(s.gross || s.gross_amount).replace(/[^0-9.]/g, '')) || 0), 0);
      setVendorHoldsVal(holds);
      setTasksCount(tList.length);
    });
  }, []);

  const formatHolds = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleOpenIncidents = () => {
    showRichModal(
      'Live Operations Incident Queue',
      `<div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><b>Active Incidents:</b> ${incidents.length}</p>
        <p><b>Critical:</b> ${incidents.filter(i => i.severity === 'Critical').length} events requiring immediate dispatch</p>
        <p><b>High Risk:</b> ${incidents.filter(i => i.severity === 'High').length} SLA warnings</p>
      </div>`
    );
  };

  const handleAddIncident = (e) => {
    e.preventDefault();
    if (!newIncident.title) return showToast('Please enter an incident title', 'error');
    const created = { id: `INC-${100 + incidents.length + 1}`, ...newIncident, age: 'Just now' };
    const updated = [created, ...incidents];
    setIncidents(updated);
    localStorage.setItem('digitasker_custom_incidents', JSON.stringify(updated));
    setShowAddIncident(false);
    setNewIncident({ title: '', severity: 'High', scope: 'North Region', action: 'Inspect SLA drop' });
    showSuccess('Incident Logged! 🚨', `${created.title} added to intervention queue.`);
  };

  return (
    <Page title="Operations Control Tower">
      <div className="v5Hero">
        <div>
          <Badge>LIVE OPERATIONS</Badge>
          <h2>One command center for tasks, vendors, quality, money and SLA risk.</h2>
          <p>Prioritize intervention before campaigns miss targets or settlements become blocked.</p>
        </div>
        <div className="v5Pulse">
          <Activity />
          <div>
            <span>Platform health</span>
            <b>96.8%</b>
            <small>{incidents.length} active incidents logged</small>
          </div>
        </div>
      </div>

      <div className="statsGrid four">
        <Stat label="Tasks at risk" value={incidents.length.toString()} icon={<AlertTriangle size={20}/>} />
        <Stat label="Pending QC" value={qcCount.toString()} icon={<ShieldCheck size={20}/>} />
        <Stat label="Vendor holds" value={formatHolds(vendorHoldsVal)} icon={<WalletCards size={20}/>} />
        <Stat label="Expiring compliance" value="0" icon={<FileCheck2 size={20}/>} />
      </div>

      <div className="controlTowerGrid">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SectionTitle title="Priority intervention queue" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ghostDark" onClick={handleOpenIncidents} style={{ padding: '6px 12px', fontSize: '12px' }}>Open Queue</button>
              <button className="primary" onClick={() => setShowAddIncident(true)} style={{ padding: '6px 12px', fontSize: '12px' }}>+ Log Incident</button>
            </div>
          </div>

          {incidents.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
              <AlertTriangle size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No active incidents logged.</p>
            </div>
          ) : (
            incidents.map(a => (
              <div className="incidentRow" key={a.id} style={{ cursor: 'pointer' }} onClick={() => showToast(`Incident ${a.id}: ${a.title}`, 'info')}>
                <div className={`incidentIcon ${a.severity.toLowerCase()}`}><AlertTriangle size={17} /></div>
                <div className="grow">
                  <div className="row">
                    <b>{a.title}</b>
                    <Badge tone={a.severity === 'Critical' ? 'red' : a.severity === 'High' ? 'orange' : 'purple'}>{a.severity}</Badge>
                  </div>
                  <span>{a.scope}</span>
                  <p>{a.action}</p>
                </div>
                <small>{a.age}</small>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title="Sourcing mix" />
          <div className="sourcingRing">
            <div><b>{tasksCount.toLocaleString('en-IN')}</b><span>campaign tasks</span></div>
          </div>
          {sourcingMix.map(s => (
            <div className="sourcingLine" key={s.type}>
              <div><b>{s.type}</b><span>{s.note}</span></div>
              <strong>{s.tasks}</strong>
              <Meter value={s.share} />
            </div>
          ))}
        </Card>
      </div>

      {showAddIncident && (
        <Modal title="Log Operational Incident" onClose={() => setShowAddIncident(false)}>
          <form onSubmit={handleAddIncident} className="stack" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Incident Title</span>
              <input value={newIncident.title} onChange={e => setNewIncident({ ...newIncident, title: e.target.value })} placeholder="e.g. Regional coverage drop in Delhi" required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Severity</span>
                <select value={newIncident.severity} onChange={e => setNewIncident({ ...newIncident, severity: e.target.value })}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </label>
              <label className="blockField">
                <span>Scope / Region</span>
                <input value={newIncident.scope} onChange={e => setNewIncident({ ...newIncident, scope: e.target.value })} />
              </label>
            </div>
            <label className="blockField">
              <span>Required Action</span>
              <input value={newIncident.action} onChange={e => setNewIncident({ ...newIncident, action: e.target.value })} />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowAddIncident(false)}>Cancel</button>
              <button type="submit" className="primary">Log Incident 🚨</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 2. VENDOR COMMERCIALS & RATE CARDS */
export function VendorCommercials() {
  const [rateCards, setRateCards] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_ratecards');
    return cached ? JSON.parse(cached) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    vendor: '',
    taskType: '',
    region: '',
    baseRate: '',
    memberCeiling: '',
    margin: '',
    validity: '31 Dec 2027',
    status: 'Active'
  });

  React.useEffect(() => {
    api.admin.getRateCards()
      .then(res => {
        const raw = Array.isArray(res) ? res : (res.rate_cards || []);
        if (raw && raw.length > 0) {
          const fetched = raw.map(rc => ({
            id: rc.rate_card_code || `RC-${rc.id}`,
            vendor: rc.vendor_name || rc.vendor?.name || 'Vendor',
            taskType: rc.task_type || 'Audit',
            region: rc.region || 'All India',
            baseRate: `₹${rc.base_rate}`,
            memberCeiling: `₹${rc.member_ceiling}`,
            margin: `${rc.platform_margin}%`,
            validity: rc.validity || '31 Dec 2027',
            status: rc.status || 'Active'
          }));
          setRateCards(fetched);
          localStorage.setItem('digitasker_custom_ratecards', JSON.stringify(fetched));
        }
      })
      .catch(() => {});
  }, []);

  const filteredRateCards = rateCards.filter(r => {
    const matchesSearch = r.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.taskType.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRateCards.length / pageSize) || 1;
  const paginatedRateCards = filteredRateCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCard.vendor || !newCard.baseRate) return showToast('Please enter vendor name and base rate', 'error');
    const created = {
      id: `RC-10${rateCards.length + 1}`,
      ...newCard
    };
    const updated = [created, ...rateCards];
    setRateCards(updated);
    localStorage.setItem('digitasker_custom_ratecards', JSON.stringify(updated));
    setShowAddModal(false);
    setNewCard({ vendor: '', taskType: '', region: '', baseRate: '', memberCeiling: '', margin: '', validity: '31 Dec 2027', status: 'Active' });
    showSuccess('Rate Card Created! 💳', `New rate card for ${created.vendor} added.`);
  };

  const handleToggleStatus = (card) => {
    const newStatus = card.status === 'Active' ? 'Paused' : 'Active';
    const updated = rateCards.map(r => r.id === card.id ? { ...r, status: newStatus } : r);
    setRateCards(updated);
    localStorage.setItem('digitasker_custom_ratecards', JSON.stringify(updated));
    showToast(`Rate Card ${card.id} status updated to ${newStatus}`);
  };

  const avgMargin = useMemo(() => {
    if (rateCards.length === 0) return '0%';
    const sum = rateCards.reduce((acc, r) => acc + (parseFloat(String(r.margin).replace(/[^0-9.]/g, '')) || 0), 0);
    return `${(sum / rateCards.length).toFixed(1)}%`;
  }, [rateCards]);

  const uniqueVendorsCount = useMemo(() => Array.from(new Set(rateCards.map(r => r.vendor))).length, [rateCards]);

  return (
    <Page title="Vendor Commercials & Rate Cards">
      <div className="statsGrid four">
        <Stat label="Active rate cards" value={rateCards.filter(r => r.status === 'Active').length.toString()} icon={<BadgeIndianRupee size={20}/>} />
        <Stat label="Negotiated vendors" value={uniqueVendorsCount.toString()} icon={<Building2 size={20}/>} />
        <Stat label="Avg vendor margin" value={avgMargin} icon={<BarChart3 size={20}/>} />
        <Stat label="Security deposits" value="₹0" icon={<WalletCards size={20}/>} />
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search vendor, task type, region, ID..." 
            value={searchTerm} 
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
        </select>
        <button className="primary" onClick={() => setShowAddModal(true)}>+ New rate card</button>
        <button className="ghostDark" onClick={() => showToast('Rate cards template downloaded', 'info')}>Export CSV</button>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Commercial rate cards" action="Effective Sep 2026" />
        </div>
        <div className="dataTable rateCardTable">
          <div className="dataHead">
            <span>Vendor</span>
            <span>Task type</span>
            <span>Region</span>
            <span>Base rate</span>
            <span>Member ceiling</span>
            <span>Platform margin</span>
            <span>Validity</span>
            <span>Status / Action</span>
          </div>
          {paginatedRateCards.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No matching rate cards found.</div>
          ) : (
            paginatedRateCards.map(r => (
              <div className="dataRow" key={r.id}>
                <div className="cellColumn">
                  <b>{r.vendor}</b>
                  <small>{r.id}</small>
                </div>
                <span>{r.taskType}</span>
                <span>{r.region}</span>
                <strong>{r.baseRate}</strong>
                <span>{r.memberCeiling}</span>
                <span>{r.margin}</span>
                <span>{r.validity}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge tone={r.status === 'Active' ? 'green' : 'orange'}>{r.status}</Badge>
                  <button className="ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleToggleStatus(r)}>Toggle</button>
                </div>
              </div>
            ))
          )}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRateCards.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>

      {showAddModal && (
        <Modal title="Create Vendor Rate Card" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Vendor Name</span>
              <input value={newCard.vendor} onChange={e => setNewCard({ ...newCard, vendor: e.target.value })} required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Task Category / Type</span>
                <input value={newCard.taskType} onChange={e => setNewCard({ ...newCard, taskType: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Coverage Region</span>
                <input value={newCard.region} onChange={e => setNewCard({ ...newCard, region: e.target.value })} required />
              </label>
            </div>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Base Rate (₹)</span>
                <input value={newCard.baseRate} onChange={e => setNewCard({ ...newCard, baseRate: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Member Ceiling (₹)</span>
                <input value={newCard.memberCeiling} onChange={e => setNewCard({ ...newCard, memberCeiling: e.target.value })} required />
              </label>
            </div>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Platform Margin (%)</span>
                <input value={newCard.margin} onChange={e => setNewCard({ ...newCard, margin: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Validity Date</span>
                <input value={newCard.validity} onChange={e => setNewCard({ ...newCard, validity: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="primary">Save Rate Card 💳</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 3. VENDOR CONTRACTS */
export function VendorContracts() {
  const [contracts, setContracts] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_contracts');
    return cached ? JSON.parse(cached) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContract, setNewContract] = useState({
    vendor: '',
    agreement: 'Master Service Agreement (MSA)',
    expiry: '31 Dec 2027',
    status: 'Compliant',
    docs: ['GST', 'PAN', 'NDA', 'Bank Proof']
  });

  const handleReviewContract = (c) => {
    showRichModal(
      `Contract Review: ${c.vendor}`,
      `<div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><b>Agreement Type:</b> ${c.agreement}</p>
        <p><b>Expiry Date:</b> ${c.expiry}</p>
        <p><b>Status:</b> <span style="color:#059669; font-weight:700;">${c.status}</span></p>
        <p><b>Verified Documents:</b> ${c.docs.join(', ')}</p>
      </div>`
    );
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newContract.vendor) return showToast('Please enter vendor name', 'error');
    const created = { id: `CNT-${contracts.length + 1}`, ...newContract };
    const updated = [created, ...contracts];
    setContracts(updated);
    localStorage.setItem('digitasker_custom_contracts', JSON.stringify(updated));
    setShowAddModal(false);
    setNewContract({ vendor: '', agreement: 'Master Service Agreement (MSA)', expiry: '31 Dec 2027', status: 'Compliant', docs: ['GST', 'PAN', 'NDA'] });
    showSuccess('Contract Registered! 📜', `Agreement for ${created.vendor} added.`);
  };

  const compliantCount = useMemo(() => contracts.filter(c => c.status === 'Compliant').length, [contracts]);
  const complianceRate = useMemo(() => contracts.length > 0 ? `${((compliantCount / contracts.length) * 100).toFixed(1)}%` : '0%', [contracts, compliantCount]);

  return (
    <Page title="Vendor Contracts & Compliance">
      <div className="statsGrid four">
        <Stat label="Active agreements" value={contracts.length.toString()} icon={<FileText size={20}/>} />
        <Stat label="Renewal in 30 days" value="0" icon={<CalendarDays size={20}/>} />
        <Stat label="Document issues" value="0" icon={<AlertTriangle size={20}/>} />
        <Stat label="Compliant vendors" value={complianceRate} icon={<ShieldCheck size={20}/>} />
      </div>

      <div className="twoColAdvanced">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SectionTitle title="Contracts & statutory documents" />
            <button className="primary" onClick={() => setShowAddModal(true)} style={{ padding: '6px 12px', fontSize: '12px' }}>+ New Contract</button>
          </div>

          {contracts.map(c => (
            <div className="contractRow" key={c.id}>
              <div className="contractIcon"><FileCheck2 size={20} /></div>
              <div className="grow">
                <div className="row">
                  <b>{c.vendor}</b>
                  <Badge tone={c.status === 'Compliant' ? 'green' : 'orange'}>{c.status}</Badge>
                </div>
                <span>{c.agreement} · expires {c.expiry}</span>
                <div className="docChips" style={{ marginTop: '6px' }}>
                  {c.docs.map(d => <Badge key={d}>{d}</Badge>)}
                </div>
              </div>
              <button className="ghostDark" onClick={() => handleReviewContract(c)}>Review</button>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle title="Compliance policy rules" />
          {[
            ['Auto-pause on expired agreement', 'Enabled'],
            ['GST/PAN required before settlement', 'Enabled'],
            ['Bank verification before payout', 'Enabled'],
            ['Renewal reminder', '30, 15 and 7 days'],
            ['Evidence retention', '365 days'],
            ['Vendor data access after termination', 'Immediate revoke']
          ].map(x => (
            <div className="financeLine" key={x[0]} style={{ cursor: 'pointer' }} onClick={() => showToast(`Policy: ${x[0]} is ${x[1]}`, 'info')}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}
        </Card>
      </div>

      {showAddModal && (
        <Modal title="Register Vendor Contract" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Vendor Name</span>
              <input value={newContract.vendor} onChange={e => setNewContract({ ...newContract, vendor: e.target.value })} placeholder="e.g. Apex Field Services" required />
            </label>
            <label className="blockField">
              <span>Agreement Type</span>
              <select value={newContract.agreement} onChange={e => setNewContract({ ...newContract, agreement: e.target.value })}>
                <option value="Master Service Agreement (MSA)">Master Service Agreement (MSA)</option>
                <option value="Service Level Agreement (SLA)">Service Level Agreement (SLA)</option>
                <option value="Non-Disclosure Agreement (NDA)">Non-Disclosure Agreement (NDA)</option>
              </select>
            </label>
            <label className="blockField">
              <span>Expiration Date</span>
              <input value={newContract.expiry} onChange={e => setNewContract({ ...newContract, expiry: e.target.value })} required />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="primary">Register Contract 📜</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 4. VENDOR SETTLEMENT ENGINE */
export function VendorSettlements() {
  const [settlements, setSettlements] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_settlements');
    return cached ? JSON.parse(cached) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    vendor: '',
    tasks: '',
    gross: ''
  });

  const filteredSettlements = settlements.filter(r => {
    const matchesSearch = r.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSettlements.length / pageSize) || 1;
  const paginatedSettlements = filteredSettlements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreateBatch = (e) => {
    e.preventDefault();
    if (!newBatch.vendor || !newBatch.gross) return showToast('Please enter vendor name and gross amount', 'error');
    const grossNum = parseFloat(newBatch.gross.replace(/,/g, '')) || 0;
    const gstVal = Math.round(grossNum * 0.18);
    const tdsVal = Math.round(grossNum * 0.01);
    const netVal = grossNum + gstVal - tdsVal;

    const created = {
      id: `SET-2026-0${settlements.length + 1}`,
      vendor: newBatch.vendor,
      tasks: newBatch.tasks || '0',
      gross: `₹${grossNum.toLocaleString('en-IN')}`,
      gst: `₹${gstVal.toLocaleString('en-IN')}`,
      tds: `− ₹${tdsVal.toLocaleString('en-IN')}`,
      adjustments: '₹0',
      net: `₹${netVal.toLocaleString('en-IN')}`,
      status: 'Ready'
    };

    const updated = [created, ...settlements];
    setSettlements(updated);
    localStorage.setItem('digitasker_custom_settlements', JSON.stringify(updated));
    setShowAddModal(false);
    setNewBatch({ vendor: '', tasks: '', gross: '' });
    showSuccess('Settlement Batch Created!', `Batch ${created.id} created for ${created.vendor}. Net: ${created.net}`);
  };

  const totalReadyVal = useMemo(() => {
    return settlements.filter(s => s.status === 'Ready')
      .reduce((acc, s) => acc + (parseFloat(String(s.net).replace(/[^0-9.]/g, '')) || 0), 0);
  }, [settlements]);

  const totalHoldVal = useMemo(() => {
    return settlements.filter(s => s.status === 'Hold')
      .reduce((acc, s) => acc + (parseFloat(String(s.net).replace(/[^0-9.]/g, '')) || 0), 0);
  }, [settlements]);

  const totalTdsVal = useMemo(() => {
    return settlements.reduce((acc, s) => acc + (parseFloat(String(s.tds).replace(/[^0-9.]/g, '')) || 0), 0);
  }, [settlements]);

  const formatLakh = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <Page title="Vendor Settlement Engine">
      <div className="statsGrid four">
        <Stat label="Settlement ready" value={formatLakh(totalReadyVal)} icon={<ReceiptIndianRupee size={20}/>} />
        <Stat label="On hold" value={formatLakh(totalHoldVal)} icon={<Clock3 size={20}/>} />
        <Stat label="TDS this cycle" value={formatLakh(totalTdsVal)} icon={<IndianRupee size={20}/>} />
        <Stat label="Reconciliation exceptions" value={settlements.filter(s => s.status === 'Hold').length.toString()} icon={<Scale size={20}/>} />
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search vendor or settlement batch ID..." 
            value={searchTerm} 
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Statuses</option>
          <option value="Ready">Ready</option>
          <option value="Hold">On Hold</option>
        </select>
        <button className="primary" onClick={() => setShowAddModal(true)}>Create settlement batch</button>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Settlement batches" />
        </div>
        <div className="dataTable settlementTable">
          <div className="dataHead">
            <span>Batch / Vendor</span>
            <span>Approved work</span>
            <span>Gross</span>
            <span>GST</span>
            <span>TDS</span>
            <span>Adjustments</span>
            <span>Net payable</span>
            <span>Status</span>
          </div>
          {paginatedSettlements.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No matching settlements found.</div>
          ) : (
            paginatedSettlements.map(r => (
              <div className="dataRow" key={r.id}>
                <div className="cellColumn">
                  <b>{r.vendor}</b>
                  <small>{r.id}</small>
                </div>
                <span>{r.tasks} tasks</span>
                <span>{r.gross}</span>
                <span>{r.gst}</span>
                <span>{r.tds}</span>
                <span>{r.adjustments}</span>
                <strong>{r.net}</strong>
                <Badge tone={r.status === 'Ready' ? 'green' : 'orange'}>{r.status}</Badge>
              </div>
            ))
          )}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSettlements.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>

      {showAddModal && (
        <Modal title="Create Settlement Batch" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Vendor Name</span>
              <input value={newBatch.vendor} onChange={e => setNewBatch({ ...newBatch, vendor: e.target.value })} required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Approved Tasks Count</span>
                <input value={newBatch.tasks} onChange={e => setNewBatch({ ...newBatch, tasks: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Gross Work Amount (₹)</span>
                <input value={newBatch.gross} onChange={e => setNewBatch({ ...newBatch, gross: e.target.value })} required />
              </label>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: '#475569' }}>
              <p style={{ margin: 0 }}>Auto-calculated Tax: GST +18%, TDS −1%</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="primary">Generate Batch 🧾</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 5. VENDOR CAPACITY */
export function VendorCapacity() {
  const [capacityRows, setCapacityRows] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_capacity');
    return cached ? JSON.parse(cached) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCap, setNewCap] = useState({ vendor: '', coverage: 'North India', capacity: '500 tasks/day', assigned: '0', utilization: '0%', priority: 'Primary', available: 'Immediate' });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCap.vendor) return showToast('Enter vendor name', 'error');
    const updated = [newCap, ...capacityRows];
    setCapacityRows(updated);
    localStorage.setItem('digitasker_custom_capacity', JSON.stringify(updated));
    setShowAddModal(false);
    setNewCap({ vendor: '', coverage: 'North India', capacity: '500 tasks/day', assigned: '0', utilization: '0%', priority: 'Primary', available: 'Immediate' });
    showSuccess('Capacity Updated!', `Capacity allocation added for ${newCap.vendor}.`);
  };

  const totalCapacityVal = useMemo(() => {
    return capacityRows.reduce((acc, c) => acc + (parseInt(String(c.capacity).replace(/[^0-9]/g, '')) || 0), 0);
  }, [capacityRows]);

  const totalAssignedVal = useMemo(() => {
    return capacityRows.reduce((acc, c) => acc + (parseInt(String(c.assigned).replace(/[^0-9]/g, '')) || 0), 0);
  }, [capacityRows]);

  const spareVal = useMemo(() => Math.max(0, totalCapacityVal - totalAssignedVal), [totalCapacityVal, totalAssignedVal]);

  return (
    <Page title="Vendor Capacity & Allocation">
      <div className="statsGrid four">
        <Stat label="Daily network capacity" value={totalCapacityVal.toLocaleString('en-IN')} icon={<UsersRound size={20}/>} />
        <Stat label="Allocated today" value={totalAssignedVal.toLocaleString('en-IN')} icon={<Layers3 size={20}/>} />
        <Stat label="Spare capacity" value={spareVal.toLocaleString('en-IN')} icon={<CheckCircle2 size={20}/>} />
        <Stat label="Coverage gaps" value="0" icon={<MapPinned size={20}/>} />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <SectionTitle title="Capacity calendar & coverage" />
          <button className="primary" onClick={() => setShowAddModal(true)} style={{ padding: '6px 12px', fontSize: '12px' }}>+ Add Capacity Projection</button>
        </div>

        <div className="dataTable capacityTable">
          <div className="dataHead">
            <span>Vendor</span>
            <span>Coverage</span>
            <span>Daily capacity</span>
            <span>Assigned</span>
            <span>Utilization</span>
            <span>Backup priority</span>
            <span>Next available</span>
          </div>
          {capacityRows.map(v => (
            <div className="dataRow" key={v.vendor}>
              <b>{v.vendor}</b>
              <span>{v.coverage}</span>
              <span>{v.capacity}</span>
              <span>{v.assigned}</span>
              <Meter value={v.utilization} />
              <Badge>{v.priority}</Badge>
              <span>{v.available}</span>
            </div>
          ))}
        </div>
      </Card>

      {showAddModal && (
        <Modal title="Add Vendor Capacity" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Vendor Name</span>
              <input value={newCap.vendor} onChange={e => setNewCap({ ...newCap, vendor: e.target.value })} required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Coverage Area</span>
                <input value={newCap.coverage} onChange={e => setNewCap({ ...newCap, coverage: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Daily Task Capacity</span>
                <input value={newCap.capacity} onChange={e => setNewCap({ ...newCap, capacity: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="primary">Save Capacity 📊</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 6. VENDOR BIDDING */
export function VendorBidding() {
  const [bids, setBids] = useState(vendorBids);
  const [showNewRfp, setShowNewRfp] = useState(false);

  const handleAwardRFQ = () => {
    showSuccess('RFQ Awarded!', 'NorthStar Field Network awarded 60% allocation at ₹380/task.');
  };

  return (
    <Page title="Vendor Bidding / RFQ">
      <div className="v5Flow">
        <div><span>1</span><b>Publish RFQ</b><small>Scope, locations, SLA</small></div>
        <ArrowRight size={16} />
        <div><span>2</span><b>Vendor Quotes</b><small>Rate, capacity, timeline</small></div>
        <ArrowRight size={16} />
        <div><span>3</span><b>Compare</b><small>Commercial + quality</small></div>
        <ArrowRight size={16} />
        <div><span>4</span><b>Award</b><small>Full or partial quantity</small></div>
      </div>

      <Card>
        <SectionTitle title="Open RFQ · Retail Visibility Audit · North India" action="Award selected vendors" onActionClick={handleAwardRFQ} />
        <div className="dataTable bidTable">
          <div className="dataHead">
            <span>Vendor</span>
            <span>Quoted rate</span>
            <span>Capacity</span>
            <span>Timeline</span>
            <span>Quality</span>
            <span>Commercial score</span>
            <span>Status</span>
          </div>
          {bids.map(b => (
            <div className="dataRow" key={b.vendor}>
              <b>{b.vendor}</b>
              <strong>{b.rate}</strong>
              <span>{b.capacity}</span>
              <span>{b.timeline}</span>
              <span>{b.quality}</span>
              <Meter value={b.score} />
              <Badge tone={b.status === 'Recommended' ? 'green' : 'purple'}>{b.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

/* 7. VENDOR PERFORMANCE */
export function VendorPerformance() {
  const [scorecards] = useState(vendorScorecards);

  const handleOpenScorecard = (vendor) => {
    showRichModal(
      `Vendor Scorecard: ${vendor.vendor}`,
      `<div style="text-align:left; font-size:13px; line-height:1.6;">
        <p><b>Tier:</b> ${vendor.tier}</p>
        <p><b>Overall Rating:</b> ${vendor.score}/100</p>
        <p><b>Completion Rate:</b> ${vendor.completion}</p>
        <p><b>QC Pass Rate:</b> ${vendor.qc}</p>
        <p><b>SLA Compliance:</b> ${vendor.sla}</p>
      </div>`
    );
  };

  return (
    <Page title="Vendor Performance Scorecards">
      <div className="vendorScoreGrid">
        {scorecards.map(v => (
          <Card key={v.vendor}>
            <div className="row">
              <div>
                <Badge>{v.tier}</Badge>
                <h3 style={{ margin: '8px 0 0', fontSize: '18px' }}>{v.vendor}</h3>
              </div>
              <div className="scoreOrb">{v.score}</div>
            </div>

            <div className="scoreMetrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '14px 0 18px', padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              {[
                ['Completion', v.completion],
                ['QC', v.qc],
                ['SLA', v.sla],
                ['Fraud', v.fraud],
                ['Disputes', v.disputes],
                ['Member quality', v.memberQuality]
              ].map(x => (
                <div key={x[0]} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>{x[0]}</span>
                  <b style={{ fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>{x[1]}</b>
                </div>
              ))}
            </div>

            <button className="ghostDark full" onClick={() => handleOpenScorecard(v)}>Open vendor scorecard</button>
          </Card>
        ))}
      </div>
    </Page>
  );
}

/* 8. WORKFORCE MANAGEMENT */
export function WorkforceManagement() {
  const [workforce, setWorkforce] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_workforce');
    return cached ? JSON.parse(cached) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [todayFilter, setTodayFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', vendor: '', area: '', skills: 'Store Audit', cert: 'Level 1 Auditor', today: 'Available', limit: '5/day', quality: '100%' });

  const filteredWorkforce = workforce.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesToday = todayFilter === 'All' || m.today === todayFilter;
    return matchesSearch && matchesToday;
  });

  const totalPages = Math.ceil(filteredWorkforce.length / pageSize) || 1;
  const paginatedWorkforce = filteredWorkforce.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.vendor) return showToast('Please enter member name and vendor', 'error');
    const created = { id: `MEM-${100 + workforce.length + 1}`, ...newMember };
    const updated = [created, ...workforce];
    setWorkforce(updated);
    localStorage.setItem('digitasker_custom_workforce', JSON.stringify(updated));
    setShowAddModal(false);
    setNewMember({ name: '', vendor: '', area: '', skills: 'Store Audit', cert: 'Level 1 Auditor', today: 'Available', limit: '5/day', quality: '100%' });
    showSuccess('Auditor Registered!', `${created.name} added to vendor workforce.`);
  };

  const availableCount = useMemo(() => workforce.filter(w => w.today === 'Available').length, [workforce]);
  const certifiedCount = useMemo(() => workforce.filter(w => w.cert && !w.cert.includes('Uncertified')).length, [workforce]);
  const onLeaveCount = useMemo(() => workforce.filter(w => w.today === 'On Leave').length, [workforce]);

  return (
    <Page title="Vendor Workforce Management">
      <div className="statsGrid four">
        <Stat label="Network members" value={workforce.length.toString()} icon={<UsersRound size={20}/>} />
        <Stat label="Available today" value={availableCount.toString()} icon={<CheckCircle2 size={20}/>} />
        <Stat label="Certified" value={certifiedCount.toString()} icon={<ShieldCheck size={20}/>} />
        <Stat label="On leave" value={onLeaveCount.toString()} icon={<CalendarDays size={20}/>} />
      </div>

      <div className="advancedToolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="searchBox" style={{ flex: 1 }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search member, vendor, area, member ID..." 
            value={searchTerm} 
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <select 
          style={{ height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '13px', background: 'white' }}
          value={todayFilter}
          onChange={e => { setTodayFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Today Statuses</option>
          <option value="Available">Available</option>
          <option value="On Leave">On Leave</option>
        </select>
        <button className="primary" onClick={() => setShowAddModal(true)}>+ Add Member</button>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <SectionTitle title="Member availability, skill & certification" />
        </div>
        <div className="dataTable workforceTable">
          <div className="dataHead">
            <span>Member</span>
            <span>Vendor</span>
            <span>Area</span>
            <span>Skills</span>
            <span>Certification</span>
            <span>Today</span>
            <span>Task limit</span>
            <span>Quality</span>
          </div>
          {paginatedWorkforce.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No matching workforce members found.</div>
          ) : (
            paginatedWorkforce.map(m => (
              <div className="dataRow" key={m.id}>
                <div className="cellColumn">
                  <b>{m.name}</b>
                  <small>{m.id}</small>
                </div>
                <span>{m.vendor}</span>
                <span>{m.area}</span>
                <span>{m.skills}</span>
                <Badge tone="green">{m.cert}</Badge>
                <Badge tone={m.today === 'Available' ? 'green' : 'orange'}>{m.today}</Badge>
                <span>{m.limit}</span>
                <strong>{m.quality}</strong>
              </div>
            ))
          )}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredWorkforce.length}
          pageSize={pageSize}
          onPageChange={p => setCurrentPage(p)}
        />
      </Card>

      {showAddModal && (
        <Modal title="Add Field Agent to Workforce" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Full Name</span>
              <input value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Vendor Affiliation</span>
                <input value={newMember.vendor} onChange={e => setNewMember({ ...newMember, vendor: e.target.value })} required />
              </label>
              <label className="blockField">
                <span>Operating City</span>
                <input value={newMember.area} onChange={e => setNewMember({ ...newMember, area: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="primary">Register Agent 👤</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 9. SMART ALLOCATION */
export function SmartAllocation() {
  const handleSaveModel = () => {
    showSuccess('Allocation Model Saved', 'Smart allocation strategy weights updated successfully.');
  };

  const handleAssign = (row) => {
    showSuccess('Task Assigned', `Assigned ${row.task} to ${row.recommended}.`);
  };

  return (
    <Page title="Smart Allocation Engine">
      <div className="twoColAdvanced">
        <Card>
          <SectionTitle title="Allocation strategy weights" />
          {[
            ['Distance / service area', '25%'],
            ['Vendor capacity', '20%'],
            ['Historical quality', '20%'],
            ['Certification fit', '15%'],
            ['SLA performance', '10%'],
            ['Cost efficiency', '10%']
          ].map(x => (
            <div className="weightRow" key={x[0]}>
              <span>{x[0]}</span>
              <input type="range" defaultValue={parseInt(x[1])} />
              <b>{x[1]}</b>
            </div>
          ))}
          <button className="primary full" style={{ marginTop: '16px' }} onClick={handleSaveModel}>Save allocation model</button>
        </Card>

        <Card>
          <SectionTitle title="Recommended allocations" />
          {smartAllocationRows.map(r => (
            <div className="smartRow" key={r.task}>
              <div>
                <b>{r.task}</b>
                <span>{r.location} · {r.requirement}</span>
              </div>
              <div className="grow">
                <b>{r.recommended}</b>
                <span>{r.reason}</span>
              </div>
              <Badge tone="green">{r.fit} fit</Badge>
              <button className="ghostDark" onClick={() => handleAssign(r)}>Assign</button>
            </div>
          ))}
        </Card>
      </div>
    </Page>
  );
}

/* 10. BUDGET CONTROL */
export function BudgetControl() {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);

  React.useEffect(() => {
    Promise.allSettled([
      api.admin.getCampaigns(),
      api.admin.getClients()
    ]).then(([campRes, cliRes]) => {
      setCampaigns(campRes.status === 'fulfilled' ? (campRes.value.campaigns || campRes.value || []) : []);
      setClients(cliRes.status === 'fulfilled' ? (cliRes.value.clients || cliRes.value || []) : []);
    });
  }, []);

  const totalClientBudget = useMemo(() => clients.reduce((acc, c) => acc + (parseFloat(c.total_spend || c.spend) || 0), 0), [clients]);
  const totalReserved = useMemo(() => campaigns.reduce((acc, c) => acc + (parseFloat(c.allocated_budget) || 0), 0), [campaigns]);
  const totalCommitted = useMemo(() => campaigns.reduce((acc, c) => acc + (parseFloat(c.spent_budget) || 0), 0), [campaigns]);
  const uncommitted = useMemo(() => Math.max(0, totalClientBudget - totalReserved), [totalClientBudget, totalReserved]);

  const formatVal = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <Page title="Campaign Budget Control">
      <div className="statsGrid four">
        <Stat label="Client budget" value={formatVal(totalClientBudget)} icon={<IndianRupee size={20}/>} />
        <Stat label="Platform reserved" value={formatVal(totalReserved)} icon={<WalletCards size={20}/>} />
        <Stat label="Committed to vendors" value={formatVal(totalCommitted)} icon={<Building2 size={20}/>} />
        <Stat label="Uncommitted" value={formatVal(uncommitted)} icon={<CheckCircle2 size={20}/>} />
      </div>

      <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
        <SectionTitle title={`Budget waterfall by campaign (${campaigns.length})`} />
        {campaigns.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <Building2 size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No active campaign budgets logged.</p>
          </div>
        ) : (
          campaigns.map(r => (
            <div className="budgetRow" key={r.id || r.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <div className="budgetTitle">
                <b style={{ color: '#0f172a', fontSize: '14px', display: 'block' }}>{r.title}</b>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{r.client?.name || 'Client'} · {r.status}</span>
              </div>
              <div className="budgetSteps" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Allocated</span><b>₹{(parseFloat(r.allocated_budget) || 0).toLocaleString('en-IN')}</b></div>
                <ArrowRight size={14} color="#94a3b8" />
                <div><span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Spent</span><b>₹{(parseFloat(r.spent_budget) || 0).toLocaleString('en-IN')}</b></div>
                <ArrowRight size={14} color="#94a3b8" />
                <div className="budgetRemain"><span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Remaining</span><strong style={{ color: '#059669' }}>₹{Math.max(0, (parseFloat(r.allocated_budget) || 0) - (parseFloat(r.spent_budget) || 0)).toLocaleString('en-IN')}</strong></div>
              </div>
            </div>
          ))
        )}
      </Card>
    </Page>
  );
}

/* 11. GOVERNANCE COMPLIANCE */
export function GovernanceCompliance() {
  return (
    <Page title="Governance, Consent & Approval Chains">
      <div className="twoColAdvanced">
        <Card>
          <SectionTitle title="Approval chains" />
          {approvalChains.map(a => (
            <div className="approvalChain" key={a.name}>
              <div>
                <b>{a.name}</b>
                <span>{a.trigger}</span>
              </div>
              <div className="chainNodes">
                {a.steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <Badge>{s}</Badge>
                    {i < a.steps.length - 1 && <ArrowRight size={14} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle title="Data & consent controls" />
          {[
            ['Campaign-specific participant consent', 'Required'],
            ['Evidence retention', '365 days'],
            ['Account deletion SLA', '30 days'],
            ['Sensitive exports', 'Manager approval'],
            ['Financial maker-checker', 'Required'],
            ['Admin session timeout', '30 minutes'],
            ['Immutable audit log', 'Enabled']
          ].map(x => (
            <div className="financeLine" key={x[0]} style={{ cursor: 'pointer' }} onClick={() => showToast(`Control: ${x[0]} = ${x[1]}`, 'info')}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}
        </Card>
      </div>
    </Page>
  );
}

/* 12. WHITE LABEL & TENANTS */
export function WhiteLabel() {
  const [tenants, setTenants] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_tenants');
    return cached ? JSON.parse(cached) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ portalName: '', domain: '', client: '', branding: 'Custom Logo & Color', email: 'admin@domain.com', accent: '#0066ff', initials: 'DT' });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTenant.portalName) return showToast('Enter portal name', 'error');
    const created = { id: `TNT-${tenants.length + 1}`, ...newTenant, initials: newTenant.portalName.slice(0, 2).toUpperCase() };
    const updated = [...tenants, created];
    setTenants(updated);
    localStorage.setItem('digitasker_custom_tenants', JSON.stringify(updated));
    setShowAddModal(false);
    setNewTenant({ portalName: '', domain: '', client: '', branding: 'Custom Logo & Color', email: 'admin@domain.com', accent: '#0066ff', initials: 'DT' });
    showSuccess('Tenant Provisioned!', `Portal ${created.portalName} configured.`);
  };

  const customDomainsCount = tenants.filter(t => t.domain).length;
  const mailersCount = tenants.filter(t => t.email).length;
  const themesCount = tenants.filter(t => t.branding).length;

  return (
    <Page title="White Label & Tenant Branding">
      <div className="statsGrid four">
        <Stat label="White-label tenants" value={tenants.length.toString()} icon={<Globe2 size={20}/>} />
        <Stat label="Custom domains" value={customDomainsCount.toString()} icon={<Network size={20}/>} />
        <Stat label="Branded mailers" value={mailersCount.toString()} icon={<FileText size={20}/>} />
        <Stat label="Custom portal themes" value={themesCount.toString()} icon={<Sparkles size={20}/>} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="primary" onClick={() => setShowAddModal(true)}>+ Register Tenant</button>
      </div>

      <div className="whiteLabelGrid">
        {tenants.length === 0 ? (
          <Card style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <Globe2 size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No white-label tenants registered.</p>
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Click "+ Register Tenant" above to add your first white-label domain or client portal.</small>
          </Card>
        ) : (
          tenants.map(t => (
            <Card key={t.id}>
              <div className="tenantPreview" style={{ '--tenantAccent': t.accent }}>
                <div className="tenantLogo">{t.initials}</div>
                <div>
                  <b>{t.portalName}</b>
                  <span>{t.domain}</span>
                </div>
              </div>
              <div className="tenantMeta">
                <span>Client</span><b>{t.client}</b>
                <span>Branding</span><b>{t.branding}</b>
                <span>Email</span><b>{t.email}</b>
              </div>
              <button className="ghostDark full" onClick={() => showSuccess('Configured', `Updated ${t.portalName}`)}>Configure tenant</button>
            </Card>
          ))
        )}
      </div>

      {showAddModal && (
        <Modal title="Register White Label Tenant" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="blockField">
              <span>Portal Name</span>
              <input value={newTenant.portalName} onChange={e => setNewTenant({ ...newTenant, portalName: e.target.value })} required />
            </label>
            <div className="fieldGrid two">
              <label className="blockField">
                <span>Domain URL</span>
                <input value={newTenant.domain} onChange={e => setNewTenant({ ...newTenant, domain: e.target.value })} placeholder="audit.client.com" required />
              </label>
              <label className="blockField">
                <span>Client Name</span>
                <input value={newTenant.client} onChange={e => setNewTenant({ ...newTenant, client: e.target.value })} required />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="primary">Provision Tenant 🌐</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* 13. TASK SOURCING */
export function TaskSourcing() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [configData, setConfigData] = useState({
    'Direct User': { maxDailyTasks: '5', minLevel: 'Level 2 Auditor', autoAcceptanceTimeout: '15 mins', locationRadius: '500m' },
    'Vendor Managed': { primaryVendorRatio: '60%', adminApprovalRequired: 'Yes', quotaBuffer: '10%', vendorFeeMargin: '15%' },
    'Vendor Bid': { minVendorScore: '85/100', bidWindow: '48 hours', maxBidRateCap: '₹500', autoAwardLowest: 'Yes' }
  });

  const handleSaveConfig = (e) => {
    e.preventDefault();
    showSuccess('Sourcing Settings Saved! ⚙️', `Configuration parameters updated for ${selectedModel}.`);
    setSelectedModel(null);
  };

  return (
    <Page title="Task Sourcing Models">
      <div className="sourcingCards">
        {[
          ['Direct User', 'Admin assigns directly to platform auditors', 'Best for online surveys, smaller campaigns and high-control tasks'],
          ['Vendor Managed', 'Admin allocates quota/budget to vendor; vendor assigns members', 'Best for field audits across managed partner networks'],
          ['Vendor Bid', 'Admin publishes RFQ; vendors quote and win full/partial scope', 'Best for large multi-region campaigns and price discovery']
        ].map((s, i) => (
          <Card key={s[0]}>
            <div className="sourcingIcon">
              {[<UsersRound size={22}/>, <Building2 size={22}/>, <Gavel size={22}/>][i]}
            </div>
            <h3 style={{ margin: '10px 0 6px' }}>{s[0]}</h3>
            <p style={{ fontSize: '13px' }}>{s[1]}</p>
            <small style={{ fontSize: '11px', color: '#64748b' }}>{s[2]}</small>
            <button className="primary full" style={{ marginTop: '14px' }} onClick={() => setSelectedModel(s[0])}>
              Configure {s[0]}
            </button>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: '24px' }}>
        <SectionTitle title="Mixed sourcing example · 1,000 retail audits" />
        <div className="mixedSourcing">
          {sourcingMix.map(s => (
            <div key={s.type}>
              <b>{s.tasks}</b>
              <span>{s.type}</span>
              <small>{s.note}</small>
            </div>
          ))}
        </div>
      </Card>

      {selectedModel && (
        <Modal title={`Configure ${selectedModel} Sourcing Model`} onClose={() => setSelectedModel(null)}>
          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {selectedModel === 'Direct User' && (
              <>
                <label className="blockField">
                  <span>Max Daily Tasks Per Auditor</span>
                  <input 
                    value={configData['Direct User'].maxDailyTasks} 
                    onChange={e => setConfigData({ ...configData, 'Direct User': { ...configData['Direct User'], maxDailyTasks: e.target.value } })} 
                  />
                </label>
                <label className="blockField">
                  <span>Minimum Auditor Level Required</span>
                  <select 
                    value={configData['Direct User'].minLevel}
                    onChange={e => setConfigData({ ...configData, 'Direct User': { ...configData['Direct User'], minLevel: e.target.value } })}
                  >
                    <option>Level 1 (Basic Auditor)</option>
                    <option>Level 2 Auditor</option>
                    <option>Master / Certified Auditor</option>
                  </select>
                </label>
                <label className="blockField">
                  <span>Location Verification Radius</span>
                  <input 
                    value={configData['Direct User'].locationRadius} 
                    onChange={e => setConfigData({ ...configData, 'Direct User': { ...configData['Direct User'], locationRadius: e.target.value } })} 
                  />
                </label>
              </>
            )}

            {selectedModel === 'Vendor Managed' && (
              <>
                <label className="blockField">
                  <span>Primary Vendor Allocation Ratio (%)</span>
                  <input 
                    value={configData['Vendor Managed'].primaryVendorRatio} 
                    onChange={e => setConfigData({ ...configData, 'Vendor Managed': { ...configData['Vendor Managed'], primaryVendorRatio: e.target.value } })} 
                  />
                </label>
                <label className="blockField">
                  <span>Admin Sign-off Required For Member Assignment</span>
                  <select 
                    value={configData['Vendor Managed'].adminApprovalRequired}
                    onChange={e => setConfigData({ ...configData, 'Vendor Managed': { ...configData['Vendor Managed'], adminApprovalRequired: e.target.value } })}
                  >
                    <option value="Yes">Yes (Admin Sign-off)</option>
                    <option value="No">No (Instant Vendor Auto-Assignment)</option>
                  </select>
                </label>
                <label className="blockField">
                  <span>Vendor Service Fee Margin (%)</span>
                  <input 
                    value={configData['Vendor Managed'].vendorFeeMargin} 
                    onChange={e => setConfigData({ ...configData, 'Vendor Managed': { ...configData['Vendor Managed'], vendorFeeMargin: e.target.value } })} 
                  />
                </label>
              </>
            )}

            {selectedModel === 'Vendor Bid' && (
              <>
                <label className="blockField">
                  <span>Minimum Vendor Scorecard Rating</span>
                  <input 
                    value={configData['Vendor Bid'].minVendorScore} 
                    onChange={e => setConfigData({ ...configData, 'Vendor Bid': { ...configData['Vendor Bid'], minVendorScore: e.target.value } })} 
                  />
                </label>
                <label className="blockField">
                  <span>Bid Window Duration</span>
                  <input 
                    value={configData['Vendor Bid'].bidWindow} 
                    onChange={e => setConfigData({ ...configData, 'Vendor Bid': { ...configData['Vendor Bid'], bidWindow: e.target.value } })} 
                  />
                </label>
                <label className="blockField">
                  <span>Max Bid Rate Cap per Task (₹)</span>
                  <input 
                    value={configData['Vendor Bid'].maxBidRateCap} 
                    onChange={e => setConfigData({ ...configData, 'Vendor Bid': { ...configData['Vendor Bid'], maxBidRateCap: e.target.value } })} 
                  />
                </label>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button type="button" className="ghost" onClick={() => setSelectedModel(null)}>Cancel</button>
              <button type="submit" className="primary">Save Sourcing Parameters ⚙️</button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
