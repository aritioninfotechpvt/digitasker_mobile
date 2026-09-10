import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowRight, BadgeIndianRupee, CalendarDays, CheckCircle2, Clock3, FileCheck2, Gavel, IndianRupee, 
  MapPinned, ReceiptIndianRupee, ShieldCheck, UsersRound, Send, Phone, MessageSquare, Copy, Check, ExternalLink, X, Sparkles, Search
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Badge, Card, SectionTitle, Stat } from '../components/ui';
import { showSuccess, showToast, showConfirm } from '../utils/swal';
import api from '../services/api';

const Page = ({ title, children }) => <AppLayout role='vendor' title={title}>{children}</AppLayout>;

// Helper function to launch WhatsApp credential share
export function shareMemberWhatsApp(member) {
  const cleanPhone = (member.phone || '9876543210').replace(/[^0-9]/g, '');
  const phoneFormatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const loginUrl = window.location.origin + '/user';
  const text = encodeURIComponent(
    `👋 Hello *${member.name}*!\n\n` +
    `Your Field Auditor Account has been created.\n\n` +
    `🔑 *Your Member Login Details:*\n` +
    `• Portal Link: ${loginUrl}\n` +
    `• Username / Phone: ${member.phone || '+91 98765 43210'}\n` +
    `• Temporary Password: ${member.password || 'Insight@2026'}\n` +
    `• Member ID: ${member.id}\n\n` +
    `Please log in to check your active task assignments and track payouts! 🚀`
  );
  const waUrl = `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${text}`;
  window.open(waUrl, '_blank');
}

export function VendorCommercialView() {
  const [rateCards, setRateCards] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_ratecards');
    return cached ? JSON.parse(cached) : [];
  });
  const [selectedRate, setSelectedRate] = useState(null);

  useEffect(() => {
    api.vendor.getCommercials()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const formatted = res.map(r => ({
            id: r.rate_card_code || `RC-${r.id}`,
            taskType: r.task_type || 'Field Task',
            region: r.region || 'Pan-India',
            baseRate: `₹${r.base_rate}`,
            memberCeiling: `₹${r.member_ceiling}`,
            margin: `₹${r.platform_margin || 50}`,
            validity: r.validity || 'Active',
            status: r.status || 'Active'
          }));
          setRateCards(formatted);
          localStorage.setItem('digitasker_custom_vendor_ratecards', JSON.stringify(formatted));
        }
      })
      .catch(() => {});
  }, []);

  const handleRequestRevision = async () => {
    const confirmed = await showConfirm(
      'Request Commercial Rate Revision?',
      'Submit rate increase proposal for tasks to admin?'
    );
    if (confirmed) {
      showSuccess(
        'Revision Request Submitted! 📑',
        'Admin team will review your requested commercial terms within 24 hours.'
      );
    }
  };

  const regionsCount = useMemo(() => new Set(rateCards.map(r => r.region)).size, [rateCards]);

  return (
    <Page title='My Rate Cards'>
      <div className='statsGrid four'>
        <Stat label='Active rates' value={rateCards.length.toString()} icon={<BadgeIndianRupee />} />
        <Stat label='Regions covered' value={regionsCount.toString()} icon={<MapPinned />} />
        <Stat label='Avg task earning' value={rateCards.length > 0 ? "₹380" : "₹0"} icon={<IndianRupee />} />
        <Stat label='Margin status' value={rateCards.length > 0 ? "Active" : "N/A"} icon={<CheckCircle2 />} />
      </div>

      <Card>
        <SectionTitle title='Commercial terms assigned by admin' action='Request rate revision' onAction={handleRequestRevision} />
        {rateCards.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No commercial rate cards currently assigned to your agency.
          </div>
        ) : (
          <div className='dataTable rateCardTable'>
            <div className='dataHead'>
              <span>Task type</span>
              <span>Region</span>
              <span>Vendor rate</span>
              <span>Member ceiling</span>
              <span>Your margin</span>
              <span>Validity</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {rateCards.map(r => (
              <div className='dataRow' key={r.id}>
                <b>{r.taskType}</b>
                <span>{r.region}</span>
                <strong>{r.baseRate}</strong>
                <span>{r.memberCeiling}</span>
                <span style={{ color: '#059669', fontWeight: '700' }}>{r.margin}</span>
                <span>{r.validity}</span>
                <Badge tone='green'>{r.status}</Badge>
                <button className='ghost' onClick={() => setSelectedRate(r)}>Details</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedRate && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '12px' }}>
              <h3>Commercial Terms: {selectedRate.taskType}</h3>
              <button className='iconBtn' onClick={() => setSelectedRate(null)}><X size={18} /></button>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '13px', lineHeight: '1.6' }}>
              <p>• <b>Task Category:</b> {selectedRate.taskType}</p>
              <p>• <b>Coverage Region:</b> {selectedRate.region}</p>
              <p>• <b>Admin → Vendor Rate:</b> <span style={{ color: '#0066ff', fontWeight: 800 }}>{selectedRate.baseRate}</span></p>
              <p>• <b>Member Payout Ceiling:</b> {selectedRate.memberCeiling}</p>
              <p>• <b>Vendor Agency Margin:</b> <span style={{ color: '#059669', fontWeight: 800 }}>{selectedRate.margin}</span></p>
              <p>• <b>Contract Validity:</b> {selectedRate.validity}</p>
            </div>
            <button className='primary full' style={{ marginTop: '16px' }} onClick={() => setSelectedRate(null)}>Close</button>
          </div>
        </div>
      )}
    </Page>
  );
}

export function VendorContractView() {
  const [contracts] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_contracts');
    return cached ? JSON.parse(cached) : [];
  });

  return (
    <Page title='Contracts & Compliance'>
      <div className='twoColAdvanced'>
        <Card>
          <SectionTitle title='Agreement status' />
          <div className='vendorAgreement' style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
            <FileCheck2 size={34} style={{ color: '#0066ff' }} />
            <div>
              <Badge tone='green'>ACTIVE</Badge>
              <h3 style={{ margin: '4px 0 2px', fontSize: '16px', color: '#0f172a' }}>Master Vendor Agreement</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>Verified Vendor Account Partner</p>
            </div>
          </div>
          {[
            ['GST registration', 'Verified'],
            ['PAN', 'Verified'],
            ['Bank account', 'Verified'],
            ['Authorized signatory', 'Verified'],
            ['NDA', 'Signed'],
            ['Data processing terms', 'Signed']
          ].map(x => (
            <div className='financeLine' key={x[0]}>
              <span>{x[0]}</span>
              <Badge tone='green'>{x[1]}</Badge>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle title='Document expiry alerts' />
          {contracts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No contract expiry alerts recorded.
            </div>
          ) : (
            contracts.map(c => (
              <div className='contractRow' key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                <CalendarDays style={{ color: '#0066ff' }} />
                <div className='grow'>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>{c.agreement}</b>
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>{c.expiry}</span>
                </div>
                <Badge tone={c.status === 'Compliant' ? 'green' : 'orange'}>{c.status}</Badge>
              </div>
            ))
          )}
        </Card>
      </div>
    </Page>
  );
}

export function VendorCapacityView() {
  const [capacityList, setCapacityList] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_capacity');
    return cached ? JSON.parse(cached) : [];
  });
  const [editingCapacity, setEditingCapacity] = useState(null);

  const handleUpdateClick = (v, index) => {
    setEditingCapacity({ ...v, index });
  };

  const handleSaveCapacity = () => {
    if (!editingCapacity) return;
    const updated = [...capacityList];
    updated[editingCapacity.index] = {
      ...updated[editingCapacity.index],
      capacity: editingCapacity.capacity,
      assigned: editingCapacity.assigned,
      coverage: editingCapacity.coverage,
      available: editingCapacity.available
    };
    setCapacityList(updated);
    localStorage.setItem('digitasker_custom_vendor_capacity', JSON.stringify(updated));
    setEditingCapacity(null);
    showSuccess('Capacity Updated!', 'Regional daily auditor capacity updated successfully.');
  };

  const totalCap = useMemo(() => capacityList.reduce((acc, c) => acc + (parseInt(c.capacity) || 0), 0), [capacityList]);
  const totalAssigned = useMemo(() => capacityList.reduce((acc, c) => acc + (parseInt(c.assigned) || 0), 0), [capacityList]);

  return (
    <Page title='Capacity & Availability'>
      <div className='statsGrid four'>
        <Stat label="Today's capacity" value={totalCap.toString()} icon={<UsersRound />} />
        <Stat label='Assigned today' value={totalAssigned.toString()} icon={<CheckCircle2 />} />
        <Stat label='Available capacity' value={(totalCap - totalAssigned > 0 ? totalCap - totalAssigned : 0).toString()} icon={<Clock3 />} />
        <Stat label='Coverage areas' value={capacityList.length.toString()} icon={<MapPinned />} />
      </div>

      <Card>
        <SectionTitle title='Capacity calendar' />
        {capacityList.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No regional capacity schedules defined.
          </div>
        ) : (
          capacityList.map((v, i) => (
            <div className='capacityVendorLine' key={i}>
              <div>
                <b>{v.coverage}</b>
                <span>Next available: <b>{v.available}</b></span>
              </div>
              <div>
                <span>Daily capacity</span>
                <b>{v.capacity}</b>
              </div>
              <div>
                <span>Assigned today</span>
                <b>{v.assigned}</b>
              </div>
              <div className='grow' style={{ maxWidth: '200px' }}>
                <span>Utilization</span>
                <div className='v5Meter' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <b style={{ display: 'block', height: '100%', background: '#0066ff', width: v.utilization || '0%' }} />
                  </i>
                  <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{v.utilization || '0%'}</span>
                </div>
              </div>
              <button className='ghost' onClick={() => handleUpdateClick(v, i)}>Update</button>
            </div>
          ))
        )}
      </Card>

      {editingCapacity && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '16px' }}>
              <h3>Update Daily Regional Capacity</h3>
              <button className='iconBtn' onClick={() => setEditingCapacity(null)}><X size={18} /></button>
            </div>

            <div className='stack'>
              <label>
                Coverage Region / State
                <input 
                  value={editingCapacity.coverage} 
                  onChange={e => setEditingCapacity({ ...editingCapacity, coverage: e.target.value })} 
                />
              </label>

              <label>
                Daily Capacity (Audits / Day)
                <input 
                  value={editingCapacity.capacity} 
                  onChange={e => setEditingCapacity({ ...editingCapacity, capacity: e.target.value })} 
                />
              </label>

              <label>
                Assigned Slots Today
                <input 
                  value={editingCapacity.assigned} 
                  onChange={e => setEditingCapacity({ ...editingCapacity, assigned: e.target.value })} 
                />
              </label>

              <label>
                Availability SLA
                <select 
                  value={editingCapacity.available} 
                  onChange={e => setEditingCapacity({ ...editingCapacity, available: e.target.value })}
                >
                  <option>Immediate</option>
                  <option>Within 12 Hours</option>
                  <option>Within 24 Hours</option>
                  <option>Fully Booked</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className='ghost' onClick={() => setEditingCapacity(null)} style={{ flex: 1 }}>Cancel</button>
                <button className='primary' onClick={handleSaveCapacity} style={{ flex: 1 }}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export function VendorBidsView() {
  const [bids, setBids] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_bids');
    return cached ? JSON.parse(cached) : [];
  });

  const [bidsModal, setBidsModal] = useState(null);
  const [myQuote, setMyQuote] = useState('400');

  const handleSubmitQuote = () => {
    if (!bidsModal) return;
    setBidsModal(null);
    showSuccess('Bid Submitted! 🚀', `Your quote of ₹${myQuote}/audit for ${bidsModal.name} has been placed.`);
  };

  return (
    <Page title='RFQ & Bids'>
      <div className='statsGrid four'>
        <Stat label='Open RFQs' value={bids.length.toString()} icon={<Gavel />} />
        <Stat label='Submitted bids' value='0' icon={<ReceiptIndianRupee />} />
        <Stat label='Awards won' value='0' icon={<CheckCircle2 />} />
        <Stat label='Potential value' value='₹0' icon={<IndianRupee />} />
      </div>

      <Card>
        <SectionTitle title='Available RFQs' action='Bid history' />
        {bids.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No open RFQs or bidding opportunities available.
          </div>
        ) : (
          bids.map((b, i) => (
            <div className='rfqVendorRow' key={i}>
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                  <Badge>{b.id}</Badge>
                  <b style={{ fontSize: '14px' }}>{b.name}</b>
                </div>
                <span>{b.location}</span>
              </div>
              <div>
                <span>Target quantity</span>
                <b>{b.quantity} audits</b>
              </div>
              <div>
                <span>Indicative rate</span>
                <b style={{ color: '#0066ff' }}>{b.indicativeRate}</b>
              </div>
              <button 
                className='primary' 
                onClick={() => setBidsModal(b)}
              >
                Submit quote
              </button>
            </div>
          ))
        )}
      </Card>

      {bidsModal && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Submit Commercial Quote ({bidsModal.id})</h3>
              <button className='iconBtn' onClick={() => setBidsModal(null)}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px' }}>
              Campaign: <b>{bidsModal.name}</b> · Target Quantity: <b>{bidsModal.quantity}</b>
            </p>

            <div className='stack'>
              <label>
                Your Proposed Unit Rate (₹ / audit)
                <input value={myQuote} onChange={e => setMyQuote(e.target.value)} placeholder="e.g. 400" />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className='ghost' onClick={() => setBidsModal(null)} style={{ flex: 1 }}>Cancel</button>
                <button className='primary' onClick={handleSubmitQuote} style={{ flex: 1 }}>Submit RFQ Quote 🚀</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export function VendorSettlementView() {
  const [statementView, setStatementView] = useState(null);
  const [settlements, setSettlements] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_settlements');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    api.vendor.getSettlements()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const formatted = res.map(s => ({
            id: s.batch_code || `SET-${s.id}`,
            tasks: s.tasks_count || 0,
            gross: `₹${parseFloat(s.gross_amount || 0).toLocaleString('en-IN')}`,
            gst: `₹${parseFloat(s.gst_amount || 0).toLocaleString('en-IN')}`,
            tds: `₹${parseFloat(s.tds_amount || 0).toLocaleString('en-IN')}`,
            net: `₹${parseFloat(s.net_payable || 0).toLocaleString('en-IN')}`,
            status: s.status || 'Processed'
          }));
          setSettlements(formatted);
          localStorage.setItem('digitasker_custom_vendor_settlements', JSON.stringify(formatted));
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadAll = () => {
    showSuccess('Statements Downloaded! 📊', 'Quarterly vendor settlement reports downloaded in CSV format.');
  };

  return (
    <Page title='Settlements & Statements'>
      <div className='statsGrid four'>
        <Stat label='Ready for settlement' value='₹0' icon={<ReceiptIndianRupee />} />
        <Stat label='Admin hold' value='₹0' icon={<Clock3 />} />
        <Stat label='TDS deducted' value='₹0' icon={<IndianRupee />} />
        <Stat label='Paid this quarter' value='₹0' icon={<CheckCircle2 />} />
      </div>

      <Card>
        <SectionTitle title='Settlement statements' action='Download all' onAction={handleDownloadAll} />
        {settlements.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No settlement statements generated yet.
          </div>
        ) : (
          settlements.map(r => (
            <div className='settlementVendorRow' key={r.id}>
              <div>
                <b style={{ fontSize: '13.5px' }}>{r.id}</b>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{r.tasks} approved tasks</span>
              </div>
              <div>
                <span>Gross</span>
                <b>{r.gross}</b>
              </div>
              <div>
                <span>GST / TDS</span>
                <span>{r.gst} / {r.tds}</span>
              </div>
              <div>
                <span>Net payout</span>
                <strong style={{ color: '#059669', fontSize: '14px' }}>{r.net}</strong>
              </div>
              <Badge tone={r.status === 'Ready' || r.status === 'Processed' ? 'green' : 'orange'}>{r.status}</Badge>
              <button className='ghost' onClick={() => setStatementView(r)}>Statement</button>
            </div>
          ))
        )}
      </Card>

      {statementView && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Settlement Statement Details ({statementView.id})</h3>
              <button className='iconBtn' onClick={() => setStatementView(null)}><X size={18} /></button>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', lineHeight: '1.7' }}>
              <p>• <b>Settlement Reference:</b> {statementView.id}</p>
              <p>• <b>Completed & Approved Tasks:</b> {statementView.tasks} tasks</p>
              <p>• <b>Gross Value:</b> {statementView.gross}</p>
              <p>• <b>GST Added:</b> {statementView.gst}</p>
              <p>• <b>TDS Deducted:</b> {statementView.tds}</p>
              <p>• <b>Net Payable Amount:</b> <b style={{ color: '#059669', fontSize: '16px' }}>{statementView.net}</b></p>
              <p>• <b>Payment Disbursement Status:</b> <span className='badge green'>{statementView.status}</span></p>
            </div>
            <button className='primary full' style={{ marginTop: '16px' }} onClick={() => setStatementView(null)}>Close Statement</button>
          </div>
        </div>
      )}
    </Page>
  );
}

export function VendorWorkforceView() {
  const [members, setMembers] = useState(() => {
    const cached = localStorage.getItem('digitasker_custom_vendor_members');
    return cached ? JSON.parse(cached) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeMemberModal, setActiveMemberModal] = useState(null);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberArea, setNewMemberArea] = useState('');
  const [newMemberSkills, setNewMemberSkills] = useState('Retail, Mystery Audit');
  const [newMemberLimit, setNewMemberLimit] = useState('5 tasks');
  const [autoShareWhatsApp, setAutoShareWhatsApp] = useState(true);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        m.id.toLowerCase().includes(q) ||
        ((m.city || m.area) && (m.city || m.area).toLowerCase().includes(q))
      );
    });
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) return;

    const newM = {
      id: `MEM-${Math.floor(100 + Math.random() * 900)}`,
      name: newMemberName,
      phone: newMemberPhone.startsWith('+91') ? newMemberPhone : `+91 ${newMemberPhone}`,
      email: `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      area: newMemberArea || 'Pan-India',
      city: newMemberArea || 'Pan-India',
      skills: newMemberSkills,
      cert: 'Retail Auditor',
      today: 'Available',
      limit: newMemberLimit,
      quality: '100%',
      password: 'Insight@' + Math.floor(1000 + Math.random() * 9000),
      balance: '₹0',
      lifetimeEarned: '₹0',
      onHold: '₹0',
      kycStatus: 'Verified',
      pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
      aadhaar: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
      payoutMethod: `UPI: ${newMemberName.toLowerCase().replace(/\s+/g, '')}@upi`,
      bankAccount: 'N/A'
    };

    const updated = [newM, ...members];
    setMembers(updated);
    localStorage.setItem('digitasker_custom_vendor_members', JSON.stringify(updated));

    setShowAddModal(false);
    showSuccess('Member Registered & Login Created! 🚀', `${newM.name} (${newM.phone}) has been registered.`);

    if (autoShareWhatsApp) {
      shareMemberWhatsApp(newM);
    }

    setNewMemberName('');
    setNewMemberPhone('');
  };

  const handleBulkUpdate = () => {
    setShowBulkModal(false);
    showSuccess('Calendar Updated! 📅', 'Workforce daily availability & task limits refreshed.');
  };

  const handleDisburseMemberPayout = (m) => {
    showSuccess('Payout Processed! 💸', `Disbursed payout to ${m.name} (${m.phone}).`);
    setActiveMemberModal(null);
  };

  return (
    <Page title='Workforce Availability & Member Logins'>
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
        <button className='primary' onClick={() => setShowAddModal(true)}>
          + Add Member / Create Login
        </button>
        <button className='ghost' onClick={() => setShowBulkModal(true)}>
          Bulk update calendar
        </button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Member availability & task limits</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Showing {filteredMembers.length} active workforce members</span>
        </div>

        <div className='dataTable workforceTable'>
          <div className='dataHead'>
            <span>Member</span>
            <span>Area</span>
            <span>Skills</span>
            <span>Certification</span>
            <span>Today</span>
            <span>Task limit</span>
            <span>Quality</span>
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
              <span>{m.area || m.city || 'N/A'}</span>
              <span>{Array.isArray(m.skills) ? m.skills.join(', ') : (m.skills || 'General')}</span>
              <Badge tone='green'>{m.cert || 'Auditor'}</Badge>
              <Badge tone={m.today === 'Available' || m.status === 'Active' ? 'green' : 'orange'}>{m.today || 'Available'}</Badge>
              <span>{m.limit || '5 tasks'}</span>
              <strong style={{ color: '#059669' }}>{m.quality || '100%'}</strong>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className='ghost' onClick={() => setActiveMemberModal(m)}>Manage & KYC</button>
                <button className='whiteBtn smallBtn' onClick={() => shareMemberWhatsApp(m)} title="Share Credentials on WhatsApp">
                  <MessageSquare size={14} color="#25D366" /> WA
                </button>
              </div>
            </div>
          ))}

          {paginatedMembers.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              {searchQuery ? `No members found matching "${searchQuery}".` : 'No workforce members added yet.'}
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
              Previous
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
              Next
            </button>
          </div>
        </div>
      </Card>

      {showAddModal && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Add Agency Member & Generate Login</h3>
              <button className='iconBtn' onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateMember} className='stack'>
              <label>
                Full Name
                <input 
                  required 
                  value={newMemberName} 
                  onChange={e => setNewMemberName(e.target.value)} 
                  placeholder='e.g. Anita Sharma' 
                />
              </label>

              <label>
                Mobile / WhatsApp Number (+91)
                <input 
                  required 
                  value={newMemberPhone} 
                  onChange={e => setNewMemberPhone(e.target.value)} 
                  placeholder='e.g. 9876543210' 
                />
              </label>

              <div className='fieldGrid two'>
                <label>
                  Location / Area
                  <input 
                    value={newMemberArea} 
                    onChange={e => setNewMemberArea(e.target.value)} 
                    placeholder="City / Area"
                  />
                </label>

                <label>
                  Daily Task Limit
                  <select value={newMemberLimit} onChange={e => setNewMemberLimit(e.target.value)}>
                    <option>3 tasks</option>
                    <option>5 tasks</option>
                    <option>10 tasks</option>
                    <option>Unlimited</option>
                  </select>
                </label>
              </div>

              <label>
                Skills / Expertise
                <input 
                  value={newMemberSkills} 
                  onChange={e => setNewMemberSkills(e.target.value)} 
                  placeholder='Retail, Mystery Audit, Social Media' 
                />
              </label>

              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type='checkbox' 
                  id='waCheck' 
                  checked={autoShareWhatsApp} 
                  onChange={e => setAutoShareWhatsApp(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor='waCheck' style={{ margin: 0, color: '#065f46', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                  Auto-open WhatsApp to send login details & password after saving
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type='button' className='ghost' onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type='submit' className='primary' style={{ flex: 1 }}>Create Login & Save Member 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className='modalBackdrop'>
          <div className='modalCard'>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Bulk Update Member Availability & Quota</h3>
              <button className='iconBtn' onClick={() => setShowBulkModal(false)}><X size={18} /></button>
            </div>
            <div className='stack'>
              <label>
                Set Today Availability for All Members
                <select>
                  <option>Available for all tasks</option>
                  <option>On leave / Unavailable</option>
                  <option>Field Audit Only</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className='ghost' onClick={() => setShowBulkModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className='primary' onClick={handleBulkUpdate} style={{ flex: 1 }}>Apply Bulk Calendar Update</button>
              </div>
            </div>
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
                  <span className='badge green'>{activeMemberModal.kycStatus || 'KYC Verified'}</span>
                </div>
                <span style={{ color: '#0066ff', fontWeight: 700, fontSize: '12.5px' }}>
                  Member ID: <b>{activeMemberModal.id}</b> · Mobile: <b>{activeMemberModal.phone}</b>
                </span>
              </div>
              <button className='iconBtn' onClick={() => setActiveMemberModal(null)}><X size={18} /></button>
            </div>

            <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <b style={{ color: '#0066ff', fontSize: '13px', display: 'block', marginBottom: '6px' }}>🔑 Member Login Credentials</b>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
                <div>Username / Phone: <b>{activeMemberModal.phone}</b></div>
                <div>Temporary Password: <b>{activeMemberModal.password || 'Insight@2026'}</b></div>
                <div>Portal Link: <b>http://localhost:5173/user</b></div>
                <div>Availability: <span className='badge green'>{activeMemberModal.today || 'Available'}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className='primary smallBtn' onClick={() => shareMemberWhatsApp(activeMemberModal)} style={{ flex: 1 }}>
                  <MessageSquare size={14} /> Send Credentials on WhatsApp
                </button>
                <button className='ghost smallBtn' onClick={() => showToast('Password reset to Insight@2026')}>
                  Reset Password
                </button>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>🛡️ Statutory KYC & Bank Details</b>
              <div className='fieldGrid two' style={{ fontSize: '12.5px' }}>
                <div>PAN Number: <b>{activeMemberModal.pan || 'N/A'}</b></div>
                <div>Aadhaar Status: <b>{activeMemberModal.aadhaar || 'N/A'}</b></div>
                <div>Payout Destination: <b>{activeMemberModal.payoutMethod || 'UPI Instant'}</b></div>
                <div>Bank Account: <b>{activeMemberModal.bankAccount || 'N/A'}</b></div>
              </div>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <b style={{ fontSize: '13px', color: '#065f46', display: 'block', marginBottom: '8px' }}>📊 Work Completed & Financial Balance</b>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span>Quality Score: <b>{activeMemberModal.quality || '100%'}</b></span>
                <span>Daily Limit: <b>{activeMemberModal.limit || '5 tasks'}</b></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <span>Available Member Balance:</span>
                <b style={{ color: '#059669', fontSize: '15px' }}>{activeMemberModal.balance || '₹0'}</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className='ghost' onClick={() => setActiveMemberModal(null)} style={{ flex: 1 }}>Close</button>
              <button className='primary' onClick={() => handleDisburseMemberPayout(activeMemberModal)} style={{ flex: 1 }}>
                💸 Disburse Member Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export function VendorWhiteLabelView() {
  const [agencyName, setAgencyName] = useState(() => localStorage.getItem('digitasker_custom_agency_name') || '');
  const [customSubdomain, setCustomSubdomain] = useState(() => localStorage.getItem('digitasker_custom_subdomain') || '');
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('digitasker_custom_logo_url') || '');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('digitasker_custom_accent_color') || '#0066ff');
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('digitasker_custom_support_email') || '');
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('digitasker_custom_support_phone') || '');
  const [welcomeHeading, setWelcomeHeading] = useState(() => localStorage.getItem('digitasker_custom_welcome_heading') || '');
  const [welcomeSub, setWelcomeSub] = useState(() => localStorage.getItem('digitasker_custom_welcome_sub') || '');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleSaveBranding = (e) => {
    e.preventDefault();
    localStorage.setItem('digitasker_custom_agency_name', agencyName);
    localStorage.setItem('digitasker_custom_subdomain', customSubdomain);
    localStorage.setItem('digitasker_custom_logo_url', logoUrl);
    localStorage.setItem('digitasker_custom_accent_color', accentColor);
    localStorage.setItem('digitasker_custom_support_email', supportEmail);
    localStorage.setItem('digitasker_custom_support_phone', supportPhone);
    localStorage.setItem('digitasker_custom_welcome_heading', welcomeHeading);
    localStorage.setItem('digitasker_custom_welcome_sub', welcomeSub);

    showSuccess(
      'White-Label Agency Branding Saved! 🚀',
      `Custom portal domain "${customSubdomain || 'Default'}" and white-label branding for ${agencyName || 'Agency'} updated successfully.`
    );
  };

  const handleCopyLink = () => {
    const fullLink = `https://${customSubdomain || 'portal'}/user?agency=${encodeURIComponent(agencyName || 'Agency')}`;
    navigator.clipboard.writeText(fullLink);
    showToast('Member Trust Invite Link copied to clipboard! 📋', 'success');
  };

  const handleTestWhatsAppInvite = () => {
    const portalUrl = `https://${customSubdomain || 'portal'}/user`;
    const text = encodeURIComponent(
      `👋 Welcome to *${agencyName || 'Agency'}* Official Auditor Portal!\n\n` +
      `You are invited to join our verified agency field network.\n\n` +
      `🌐 *Your White-Label Auditor Portal:* ${portalUrl}\n` +
      `🏢 *Agency:* ${agencyName || 'Agency'}\n` +
      `📞 *Agency Support:* ${supportPhone || 'N/A'}\n\n` +
      `Log in with your registered mobile number to view active store mystery audits and task payouts! 🚀`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <Page title='White-Label Agency Branding & Member Trust Domain'>
      <div className='vendorHero' style={{ background: 'linear-gradient(135deg, #0066ff 0%, #1e40af 100%)', color: 'white' }}>
        <div>
          <Badge tone='purple'>WHITE-LABEL ENTERPRISE AGENCY</Badge>
          <h2 style={{ color: 'white' }}>Custom Agency Branding & Trust Portal</h2>
          <p style={{ color: '#e0e7ff' }}>
            Configure your agency's logo, custom subdomain, brand theme color, and official WhatsApp invitation templates.
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '12px', textAlign: 'right', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ fontSize: '11px', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>Active Subdomain</span>
          <b style={{ fontSize: '15px', color: 'white', display: 'block', margin: '4px 0' }}>{customSubdomain || 'Not Configured'}</b>
          <small style={{ color: '#68d391', fontWeight: 700 }}>✓ SSL Secured Domain</small>
        </div>
      </div>

      <div className='statsGrid four'>
        <Stat label='White-Label Status' value={customSubdomain ? 'ACTIVE' : 'Pending Setup'} icon={<ShieldCheck />} />
        <Stat label='Custom Domain' value={customSubdomain ? customSubdomain.split('.')[0] : 'N/A'} icon={<ExternalLink />} />
        <Stat label='Brand Primary Color' value={accentColor} icon={<Sparkles />} />
        <Stat label='Auditor Trust Rating' value='100%' icon={<CheckCircle2 />} />
      </div>

      <div className='twoColAdvanced'>
        <Card>
          <SectionTitle title='Agency White-Label Branding Settings' />
          <form onSubmit={handleSaveBranding} className='stack'>
            <label>
              Official Agency / Brand Display Name
              <input 
                value={agencyName} 
                onChange={e => setAgencyName(e.target.value)} 
                placeholder='e.g. Agency Name' 
              />
            </label>

            <label>
              Custom White-Label Subdomain / Domain
              <input 
                value={customSubdomain} 
                onChange={e => setCustomSubdomain(e.target.value)} 
                placeholder='e.g. agency.insightloop.com' 
              />
            </label>

            <label>
              Agency Logo URL
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  value={logoUrl} 
                  onChange={e => setLogoUrl(e.target.value)} 
                  placeholder='https://yourdomain.com/logo.png' 
                />
                {logoUrl && <img src={logoUrl} alt='Logo' style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />}
              </div>
            </label>

            <label>
              Primary Brand Accent Theme Color
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                {['#0066ff', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#0f172a'].map(c => (
                  <button 
                    type='button'
                    key={c}
                    onClick={() => setAccentColor(c)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c,
                      border: accentColor === c ? '3px solid #0f172a' : '2px solid white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginLeft: '6px' }}>Selected: {accentColor}</span>
              </div>
            </label>

            <div className='fieldGrid two'>
              <label>
                Agency Support Email
                <input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="support@agency.com" />
              </label>

              <label>
                Agency Support WhatsApp / Phone
                <input value={supportPhone} onChange={e => setSupportPhone(e.target.value)} placeholder="+91 98765 43210" />
              </label>
            </div>

            <label>
              Custom Member Welcome Banner Heading
              <input value={welcomeHeading} onChange={e => setWelcomeHeading(e.target.value)} placeholder="Welcome to Auditor Portal" />
            </label>

            <label>
              Custom Member Welcome Subtitle & Instructions
              <textarea 
                rows={2}
                value={welcomeSub} 
                onChange={e => setWelcomeSub(e.target.value)} 
                placeholder="Log in to complete audits and track payouts."
              />
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type='button' className='ghost' onClick={() => setShowPreviewModal(true)}>
                👁️ Preview Member Portal
              </button>
              <button type='submit' className='primary' style={{ flex: 1 }}>
                Save & Publish White-Label Branding 🚀
              </button>
            </div>
          </form>
        </Card>

        <Card>
          <SectionTitle title='Live Member Portal Trust Preview' />
          
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {logoUrl && <img src={logoUrl} alt='Agency' style={{ width: '28px', height: '28px', borderRadius: '6px' }} />}
                <b style={{ color: accentColor, fontSize: '15px' }}>{agencyName || 'Agency Portal'}</b>
              </div>
              <span className='badge green' style={{ fontSize: '10.5px' }}>OFFICIAL AGENCY PORTAL</span>
            </div>

            <div style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #1e293b 100%)`, color: 'white', padding: '16px', borderRadius: '12px', marginBottom: '14px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: 'white' }}>{welcomeHeading || 'Welcome Auditor'}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#e2e8f0', lineHeight: '1.4' }}>{welcomeSub || 'Access tasks and track earnings.'}</p>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px' }}>
              <p style={{ margin: '4px 0' }}>• Domain: <b style={{ color: accentColor }}>https://{customSubdomain || 'portal'}</b></p>
              <p style={{ margin: '4px 0' }}>• Contact Support: <b>{supportEmail || 'N/A'}</b> | <b>{supportPhone || 'N/A'}</b></p>
            </div>

            <div className='stack' style={{ gap: '8px' }}>
              <button className='whiteBtn full' onClick={handleCopyLink}>
                📋 Copy Member Trust Invite Link
              </button>
              <button className='primary full' onClick={handleTestWhatsAppInvite} style={{ background: '#25D366', borderColor: '#25D366' }}>
                <MessageSquare size={16} /> Send White-Label WhatsApp Invite
              </button>
            </div>
          </div>
        </Card>
      </div>

      {showPreviewModal && (
        <div className='modalBackdrop'>
          <div className='modalCard' style={{ maxWidth: '680px' }}>
            <div className='row between' style={{ marginBottom: '14px' }}>
              <h3>Auditor Portal View Preview ({agencyName || 'Agency'})</h3>
              <button className='iconBtn' onClick={() => setShowPreviewModal(false)}><X size={18} /></button>
            </div>

            <div style={{ border: '2px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', background: '#f8fafc' }}>
              <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {logoUrl && <img src={logoUrl} alt='Agency' style={{ width: '32px', height: '32px', borderRadius: '8px' }} />}
                  <div>
                    <b style={{ color: accentColor, fontSize: '16px', display: 'block' }}>{agencyName || 'Agency'}</b>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>https://{customSubdomain || 'portal'}</small>
                  </div>
                </div>
                <button className='primary smallBtn' style={{ background: accentColor }}>Auditor Login</button>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #0f172a 100%)`, color: 'white', padding: '24px', borderRadius: '16px', marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 6px', color: 'white', fontSize: '18px' }}>{welcomeHeading || 'Welcome Auditor'}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>{welcomeSub || 'Access tasks and track earnings.'}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className='primary' onClick={() => setShowPreviewModal(false)}>Close Live Preview</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
