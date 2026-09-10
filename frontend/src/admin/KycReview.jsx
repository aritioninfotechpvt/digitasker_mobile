import React, { useState, useMemo } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat, SectionTitle } from '../components/ui';
import { 
  ShieldCheck, Users, Clock, AlertTriangle, CheckCircle2, XCircle, FileText, Eye, 
  Building2, Check, X, Search, Filter, RefreshCw, FileCheck2, CreditCard, Lock,
  ZoomIn, Download, ExternalLink, Camera, Landmark, FileImage, ShieldAlert
} from 'lucide-react';
import { kycUsers as initialKycUsers } from '../data/dummy';
import { showSuccess, showConfirm, showToast, showPrompt } from '../utils/swal';
import Pagination from '../components/Pagination';

export default function KycReview() {
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'vendor'
  const [userQueue, setUserQueue] = useState([]);
  const [vendorQueue, setVendorQueue] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [userPage, setUserPage] = useState(1);
  const [vendorPage, setVendorPage] = useState(1);
  const pageSize = 5;

  const filteredUserQueue = useMemo(() => {
    let result = userQueue.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || u.pan === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [userQueue, searchQuery, statusFilter, sortBy]);

  const paginatedUserQueue = useMemo(() => {
    const start = (userPage - 1) * pageSize;
    return filteredUserQueue.slice(start, start + pageSize);
  }, [filteredUserQueue, userPage, pageSize]);

  const filteredVendorQueue = useMemo(() => {
    let result = vendorQueue.filter(v => {
      const matchesSearch = 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.manager.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [vendorQueue, searchQuery, statusFilter, sortBy]);

  const paginatedVendorQueue = useMemo(() => {
    const start = (vendorPage - 1) * pageSize;
    return filteredVendorQueue.slice(start, start + pageSize);
  }, [filteredVendorQueue, vendorPage, pageSize]);

  const [selectedUserKyc, setSelectedUserKyc] = useState(null);
  const [selectedVendorKyc, setSelectedVendorKyc] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState('aadhaar'); // 'aadhaar' | 'pan' | 'cheque' | 'selfie' | 'gst' | 'incorporation'
  
  // Full-screen Image Lightbox state
  const [viewingDocImage, setViewingDocImage] = useState(null); // { title: '', type: '', data: ... }

  // Actions
  const handleApproveUserKyc = (user) => {
    setUserQueue(userQueue.map(u => u.email === user.email ? { ...u, pan: 'Verified', risk: 'Low' } : u));
    setSelectedUserKyc(null);
    showSuccess('User KYC Approved! 🛡️', `Identity and payout account for ${user.name} verified.`);
  };

  const handleRejectUserKyc = async (user) => {
    const reason = await showPrompt('Reject User KYC', 'Specify reason for rejection', 'Blurry Aadhaar/PAN image or Name Mismatch');
    if (reason) {
      setUserQueue(userQueue.map(u => u.email === user.email ? { ...u, pan: 'Rejected', risk: 'High' } : u));
      setSelectedUserKyc(null);
      showToast(`User KYC rejected: ${reason}`, 'error');
    }
  };

  const handleApproveVendorKyc = (vendor) => {
    setVendorQueue(vendorQueue.map(v => v.id === vendor.id ? { ...v, status: 'Verified', gstStatus: 'Active on GSTN Portal' } : v));
    setSelectedVendorKyc(null);
    showSuccess('Vendor KYC Approved! 🏢', `Vendor ${vendor.name} statutory documents verified & cleared.`);
  };

  const handleRejectVendorKyc = async (vendor) => {
    const reason = await showPrompt('Reject Vendor KYC', 'Specify reason for rejection', 'GSTIN Name mismatch with bank account holder');
    if (reason) {
      setVendorQueue(vendorQueue.map(v => v.id === vendor.id ? { ...v, status: 'Document Issue', gstStatus: 'Rejected' } : v));
      setSelectedVendorKyc(null);
      showToast(`Vendor KYC rejected: ${reason}`, 'error');
    }
  };

  return (
    <AppLayout role="admin" title="KYC & Document Verification Console">
      {/* Top Stat Cards */}
      <div className="statsGrid four">
        <Stat label="Pending User KYC" value={userQueue.filter(u => u.pan !== 'Verified').length.toString()} icon={<Clock size={20}/>} />
        <Stat label="Pending Vendor KYC" value={vendorQueue.filter(v => v.status !== 'Verified').length.toString()} icon={<Building2 size={20}/>} />
        <Stat label="Verified This Month" value={(userQueue.filter(u => u.pan === 'Verified').length + vendorQueue.filter(v => v.status === 'Verified').length).toString()} icon={<CheckCircle2 size={20}/>} />
        <Stat label="High Risk Holds" value={(userQueue.filter(u => u.risk === 'High').length + vendorQueue.filter(v => v.risk === 'High Risk').length).toString()} icon={<AlertTriangle size={20}/>} />
      </div>

      {/* Queue Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
        <button 
          onClick={() => setActiveTab('user')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
            border: 0, fontWeight: 700, fontSize: '13.5px', cursor: 'pointer',
            background: activeTab === 'user' ? '#0066ff' : '#ffffff',
            color: activeTab === 'user' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'user' ? '0 4px 14px rgba(0, 102, 255, 0.25)' : 'none'
          }}
        >
          <Users size={16} /> Auditor / User KYC Queue ({userQueue.length})
        </button>

        <button 
          onClick={() => setActiveTab('vendor')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
            border: 0, fontWeight: 700, fontSize: '13.5px', cursor: 'pointer',
            background: activeTab === 'vendor' ? '#0066ff' : '#ffffff',
            color: activeTab === 'vendor' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'vendor' ? '0 4px 14px rgba(0, 102, 255, 0.25)' : 'none'
          }}
        >
          <Building2 size={16} /> Partner / Vendor Statutory KYC Queue ({vendorQueue.length})
        </button>
      </div>

      {/* USER KYC TABLE */}
      {activeTab === 'user' && (
        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div className="between" style={{ marginBottom: '14px' }}>
            <SectionTitle title="Auditor Identity & Payout KYC Queue" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="searchBox" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 10px' }}>
                <Search size={14} color="#64748b" />
                <input 
                  placeholder="Search auditor, email, city..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setUserPage(1); }}
                  style={{ border: 0, outline: 'none', background: 'transparent', fontSize: '12.5px' }}
                />
              </div>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setUserPage(1); }} style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
              </select>
            </div>
          </div>

          <div className="dataTable" style={{ marginTop: '10px' }}>
            <div className="dataHead" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.9fr 1.2fr 0.7fr 0.8fr', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              <span>User Auditor</span>
              <span>City / Location</span>
              <span>PAN & Aadhaar</span>
              <span>Bank / UPI Account</span>
              <span>Risk Score</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {paginatedUserQueue.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No auditors match criteria.</div>
            ) : (
              paginatedUserQueue.map((u, i) => (
                <div className="dataRow" key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.9fr 1.2fr 0.7fr 0.8fr', gap: '10px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                  <div>
                    <b style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{u.name}</b>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>{u.email}</small>
                  </div>
                  <span style={{ color: '#334155' }}>{u.city}</span>
                  <div>
                    <Badge tone={u.pan === 'Verified' ? 'green' : u.pan === 'Rejected' ? 'red' : 'orange'}>{u.pan}</Badge>
                  </div>
                  <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '12.5px' }}>{u.payout}</span>
                  <div>
                    <Badge tone={u.risk === 'Low' ? 'green' : u.risk === 'Medium' ? 'orange' : 'red'}>{u.risk} Risk</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button 
                      className="primary"
                      onClick={() => { setSelectedUserKyc(u); setActiveDocTab('aadhaar'); }}
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={13} /> View Documents
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination 
            currentPage={userPage}
            totalPages={Math.ceil(filteredUserQueue.length / pageSize)}
            onPageChange={setUserPage}
            pageSize={pageSize}
            totalItems={filteredUserQueue.length}
          />
        </Card>
      )}

      {/* VENDOR KYC TABLE */}
      {activeTab === 'vendor' && (
        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div className="between" style={{ marginBottom: '14px' }}>
            <SectionTitle title="Partner Vendor Statutory & Tax KYC Queue" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="searchBox" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 10px' }}>
                <Search size={14} color="#64748b" />
                <input 
                  placeholder="Search vendor, GSTIN, manager..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setVendorPage(1); }}
                  style={{ border: 0, outline: 'none', background: 'transparent', fontSize: '12.5px' }}
                />
              </div>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setVendorPage(1); }} style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending Audit">Pending Audit</option>
              </select>
            </div>
          </div>

          <div className="dataTable" style={{ marginTop: '10px' }}>
            <div className="dataHead" style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr 1fr 1.1fr 0.8fr 0.8fr', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              <span>Vendor Entity</span>
              <span>GSTIN Number</span>
              <span>Business PAN</span>
              <span>Bank Account & IFSC</span>
              <span>GST Status</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {paginatedVendorQueue.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No vendors match criteria.</div>
            ) : (
              paginatedVendorQueue.map((v) => (
                <div className="dataRow" key={v.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr 1fr 1.1fr 0.8fr 0.8fr', gap: '10px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                  <div>
                    <b style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{v.name}</b>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>{v.id} · {v.manager}</small>
                  </div>
                  <span style={{ color: '#0066ff', fontWeight: 700, fontSize: '12px', fontFamily: 'monospace' }}>{v.gstin}</span>
                  <span style={{ color: '#334155', fontWeight: 600, fontSize: '12px', fontFamily: 'monospace' }}>{v.pan}</span>
                  <div>
                    <b style={{ display: 'block', fontSize: '12.5px', color: '#0f172a' }}>{v.bankAcc}</b>
                    <small style={{ fontSize: '10.5px', color: '#64748b' }}>IFSC: {v.ifsc}</small>
                  </div>
                  <div>
                    <Badge tone={v.status === 'Verified' ? 'green' : v.status === 'Document Issue' ? 'red' : 'orange'}>{v.gstStatus}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button 
                      className="primary"
                      onClick={() => { setSelectedVendorKyc(v); setActiveDocTab('gst'); }}
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={13} /> View Documents
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination 
            currentPage={vendorPage}
            totalPages={Math.ceil(filteredVendorQueue.length / pageSize)}
            onPageChange={setVendorPage}
            pageSize={pageSize}
            totalItems={filteredVendorQueue.length}
          />
        </Card>
      )}

      {/* USER KYC DOCUMENT INSPECTOR MODAL WITH REAL VISUAL DOCUMENT PREVIEWS */}
      {selectedUserKyc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="#0066ff" /> Auditor KYC Document Inspection: {selectedUserKyc.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Email: {selectedUserKyc.email} • Location: {selectedUserKyc.city} • Payout: {selectedUserKyc.payout}</span>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setSelectedUserKyc(null)} />
            </div>

            {/* Document Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px', paddingBottom: '8px' }}>
              {[
                ['aadhaar', '🪪 Aadhaar Card (Front/Back)'],
                ['pan', '💳 PAN Card Document'],
                ['cheque', '📑 Bank Passbook / Cheque'],
                ['selfie', '🤳 Selfie Liveness Photo']
              ].map(([docKey, docLabel]) => (
                <button
                  key={docKey}
                  onClick={() => setActiveDocTab(docKey)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 0, fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    background: activeDocTab === docKey ? '#0066ff' : '#f1f5f9',
                    color: activeDocTab === docKey ? '#ffffff' : '#475569'
                  }}
                >
                  {docLabel}
                </button>
              ))}
            </div>

            {/* Main Visual Document Cards Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '20px', marginBottom: '20px' }}>
              
              {/* Document Image Graphic Display */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <b style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileImage size={16} color="#0066ff" /> Original Submitted Document File
                  </b>
                  <button 
                    onClick={() => setViewingDocImage({ title: `${selectedUserKyc.name} - ${activeDocTab.toUpperCase()}`, docType: activeDocTab, user: selectedUserKyc })}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #93c5fd', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ZoomIn size={14} /> Fullscreen Zoom
                  </button>
                </div>

                {/* GRAPHIC 1: AADHAAR CARD PREVIEW */}
                {activeDocTab === 'aadhaar' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedUserKyc.name} - Aadhaar Card`, docType: 'aadhaar', user: selectedUserKyc })}
                    style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '2px solid #fdba74', borderRadius: '14px', padding: '16px', color: '#9a3412', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f97316', paddingBottom: '8px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🇮🇳 Government of India / Unique Identification Authority
                      </div>
                      <span style={{ fontSize: '10px', background: '#ea580c', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Aadhaar</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '70px', height: '80px', background: '#94a3b8', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: '24px' }}>
                        👤
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#431407' }}>{selectedUserKyc.name}</div>
                        <div>DOB: 14/08/1996 | Gender: MALE</div>
                        <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px', color: '#7c2d12' }}>
                          7842 1092 5678
                        </div>
                        <div style={{ fontSize: '10px', color: '#166534', fontWeight: 700, marginTop: '4px' }}>✓ Government UIDAI Database Verified</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #fdba74', fontSize: '10.5px', color: '#c2410c', textAlign: 'center', fontWeight: 600 }}>
                      Click card to open full high-resolution image preview
                    </div>
                  </div>
                )}

                {/* GRAPHIC 2: PAN CARD PREVIEW */}
                {activeDocTab === 'pan' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedUserKyc.name} - PAN Card`, docType: 'pan', user: selectedUserKyc })}
                    style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid #7dd3fc', borderRadius: '14px', padding: '16px', color: '#0369a1', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #0284c7', paddingBottom: '8px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '12px' }}>
                        🇮🇳 INCOME TAX DEPARTMENT • GOVT. OF INDIA
                      </div>
                      <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Permanent Account Number</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '70px', height: '80px', background: '#38bdf8', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: '24px' }}>
                        👤
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Name</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0c4a6e' }}>{selectedUserKyc.name.toUpperCase()}</div>
                        <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px', color: '#0369a1' }}>
                          ABCDE1234F
                        </div>
                        <div style={{ fontSize: '10px', color: '#166534', fontWeight: 700, marginTop: '4px' }}>✓ ITD Taxpayer Match Verified</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GRAPHIC 3: BANK CHEQUE PREVIEW */}
                {activeDocTab === 'cheque' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedUserKyc.name} - Cancelled Cheque`, docType: 'cheque', user: selectedUserKyc })}
                    style={{ cursor: 'pointer', background: '#ecfdf5', border: '2px solid #6ee7b7', borderRadius: '14px', padding: '16px', color: '#065f46' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #34d399', paddingBottom: '8px', marginBottom: '10px' }}>
                      <b>🏦 HDFC BANK LIMITED</b>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', transform: 'rotate(-5deg)', border: '2px solid #dc2626', padding: '2px 8px', borderRadius: '4px' }}>CANCELLED</span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <div>Payee Account Holder: <b>{selectedUserKyc.name}</b></div>
                      <div>Account No: <b>•••• •••• 9821</b> | IFSC: <b>HDFC0001234</b></div>
                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#047857' }}>
                        <span>MICR: 110240002</span>
                        <span>Signature Match: 99%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* GRAPHIC 4: SELFIE LIVENESS PHOTO */}
                {activeDocTab === 'selfie' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedUserKyc.name} - Selfie Liveness Photo`, docType: 'selfie', user: selectedUserKyc })}
                    style={{ cursor: 'pointer', background: '#faf5ff', border: '2px solid #c084fc', borderRadius: '14px', padding: '16px', textAlign: 'center' }}
                  >
                    <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#9333ea', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontSize: '48px', border: '4px solid #e9d5ff' }}>
                      👤
                    </div>
                    <Badge tone="green">✓ Face Liveness Match 98.7%</Badge>
                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#6b21a8' }}>Captured via Camera SDK • Geotag: {selectedUserKyc.city}</p>
                  </div>
                )}
              </div>

              {/* Automated Match Scores Panel */}
              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '14px', padding: '16px', fontSize: '12.5px', color: '#6b21a8' }}>
                <b style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#581c87' }}>
                  <ShieldCheck size={18} /> Verification Checks
                </b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                    <span style={{ fontSize: '11px', color: '#6b21a8' }}>Name Match Score</span>
                    <b style={{ display: 'block', fontSize: '16px', color: '#15803d' }}>99.4% Match</b>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                    <span style={{ fontSize: '11px', color: '#6b21a8' }}>Payout Account</span>
                    <b style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{selectedUserKyc.payout}</b>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
                    <span style={{ fontSize: '11px', color: '#6b21a8' }}>Risk Assessment</span>
                    <b style={{ display: 'block', fontSize: '13px', color: '#059669' }}>{selectedUserKyc.risk} Risk</b>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => handleRejectUserKyc(selectedUserKyc)}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Reject KYC Document
              </button>
              <button 
                onClick={() => handleApproveUserKyc(selectedUserKyc)}
                style={{ padding: '10px 22px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Approve & Verify Auditor KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR KYC DOCUMENT INSPECTOR MODAL */}
      {selectedVendorKyc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} color="#0066ff" /> Vendor Statutory KYC Inspection: {selectedVendorKyc.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>GSTIN: {selectedVendorKyc.gstin} • PAN: {selectedVendorKyc.pan} • Manager: {selectedVendorKyc.manager}</span>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setSelectedVendorKyc(null)} />
            </div>

            {/* Document Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px', paddingBottom: '8px' }}>
              {[
                ['gst', '🏛️ GST Registration Certificate (REG-06)'],
                ['pan', '💳 Business PAN Card'],
                ['cheque', '🧾 Bank Cancelled Cheque'],
                ['incorporation', '📜 Certificate of Incorporation']
              ].map(([docKey, docLabel]) => (
                <button
                  key={docKey}
                  onClick={() => setActiveDocTab(docKey)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 0, fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    background: activeDocTab === docKey ? '#0066ff' : '#f1f5f9',
                    color: activeDocTab === docKey ? '#ffffff' : '#475569'
                  }}
                >
                  {docLabel}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '20px', marginBottom: '20px' }}>
              
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <b style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileImage size={16} color="#0066ff" /> Vendor Statutory Document View
                  </b>
                  <button 
                    onClick={() => setViewingDocImage({ title: `${selectedVendorKyc.name} - ${activeDocTab.toUpperCase()}`, docType: activeDocTab, vendor: selectedVendorKyc })}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #93c5fd', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ZoomIn size={14} /> Fullscreen Zoom
                  </button>
                </div>

                {/* GST CERTIFICATE GRAPHIC PREVIEW */}
                {activeDocTab === 'gst' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedVendorKyc.name} - GST Registration Certificate`, docType: 'gst', vendor: selectedVendorKyc })}
                    style={{ cursor: 'pointer', background: '#f0fdf4', border: '2px solid #4ade80', borderRadius: '14px', padding: '18px', color: '#14532d' }}
                  >
                    <div style={{ textAlignment: 'center', borderBottom: '1.5px solid #22c55e', paddingBottom: '8px', marginBottom: '12px' }}>
                      <b style={{ fontSize: '13px' }}>GOVERNMENT OF INDIA • GST REGISTRATION CERTIFICATE</b>
                      <div style={{ fontSize: '11px', color: '#15803d' }}>FORM GST REG-06 [See Rule 10(1)]</div>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <div>Registration Number (GSTIN): <b style={{ fontFamily: 'monospace', fontSize: '14px', color: '#0066ff' }}>{selectedVendorKyc.gstin}</b></div>
                      <div>Legal Name: <b>{selectedVendorKyc.name}</b></div>
                      <div>Trade Name: <b>{selectedVendorKyc.name}</b></div>
                      <div>Constitution of Business: <b>Private Limited Company</b></div>
                      <div style={{ marginTop: '8px', fontSize: '10px', color: '#166534', fontWeight: 700 }}>✓ Verified Active on GSTN Government Portal</div>
                    </div>
                  </div>
                )}

                {/* BUSINESS PAN GRAPHIC PREVIEW */}
                {activeDocTab === 'pan' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedVendorKyc.name} - Business PAN Card`, docType: 'pan', vendor: selectedVendorKyc })}
                    style={{ cursor: 'pointer', background: '#e0f2fe', border: '2px solid #38bdf8', borderRadius: '14px', padding: '18px', color: '#0369a1' }}
                  >
                    <b style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>🇮🇳 INCOME TAX DEPARTMENT • GOVT. OF INDIA</b>
                    <div style={{ fontSize: '12px' }}>
                      <div>Entity Name: <b>{selectedVendorKyc.name.toUpperCase()}</b></div>
                      <div>PAN Number: <b style={{ fontFamily: 'monospace', fontSize: '16px', color: '#0284c7' }}>{selectedVendorKyc.pan}</b></div>
                      <div>Category: <b>COMPANY (C)</b></div>
                    </div>
                  </div>
                )}

                {/* VENDOR BANK CHEQUE */}
                {activeDocTab === 'cheque' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedVendorKyc.name} - Bank Cheque`, docType: 'cheque', vendor: selectedVendorKyc })}
                    style={{ cursor: 'pointer', background: '#ecfdf5', border: '2px solid #34d399', borderRadius: '14px', padding: '18px', color: '#065f46' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #059669', paddingBottom: '8px', marginBottom: '10px' }}>
                      <b>🏦 {selectedVendorKyc.bankAcc}</b>
                      <span style={{ color: '#dc2626', fontWeight: 800 }}>CANCELLED</span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <div>IFSC Code: <b>{selectedVendorKyc.ifsc}</b></div>
                      <div>Status: <b>{selectedVendorKyc.chequeStatus}</b></div>
                    </div>
                  </div>
                )}

                {/* INCORPORATION CERTIFICATE */}
                {activeDocTab === 'incorporation' && (
                  <div 
                    onClick={() => setViewingDocImage({ title: `${selectedVendorKyc.name} - Certificate of Incorporation`, docType: 'incorporation', vendor: selectedVendorKyc })}
                    style={{ cursor: 'pointer', background: '#fff7ed', border: '2px solid #fdba74', borderRadius: '14px', padding: '18px', color: '#7c2d12' }}
                  >
                    <b style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>📜 MINISTRY OF CORPORATE AFFAIRS (MCA)</b>
                    <div style={{ fontSize: '12px' }}>
                      <div>CIN: <b>U74999PB2022PTC055123</b></div>
                      <div>Registered Office: <b>Punjab / Chandigarh ROC</b></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Vendor Tax Summary */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '16px', fontSize: '12.5px', color: '#065f46' }}>
                <b style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#047857' }}>
                  <Building2 size={18} /> Tax & Payout Verification
                </b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <span style={{ fontSize: '11px', color: '#047857' }}>GSTIN Status</span>
                    <b style={{ display: 'block', fontSize: '13px', color: '#15803d' }}>{selectedVendorKyc.gstStatus}</b>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <span style={{ fontSize: '11px', color: '#047857' }}>Bank Account</span>
                    <b style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{selectedVendorKyc.bankAcc}</b>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => handleRejectVendorKyc(selectedVendorKyc)}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Reject / Hold Vendor KYC
              </button>
              <button 
                onClick={() => handleApproveVendorKyc(selectedVendorKyc)}
                style={{ padding: '10px 22px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Approve Vendor Statutory KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX FULLSCREEN HIGH-RES DOCUMENT VIEWER MODAL */}
      {viewingDocImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', zIndex: 2500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🔍 Full Document View: {viewingDocImage.title}</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={() => showSuccess('Document Downloaded', `Saved ${viewingDocImage.title} as high-res PNG image.`)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={15} /> Download Document Image
              </button>
              <X size={24} style={{ cursor: 'pointer', color: '#ffffff' }} onClick={() => setViewingDocImage(null)} />
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '900px', height: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            
            {viewingDocImage.docType === 'aadhaar' && (
              <div style={{ width: '100%', maxWidth: '560px', background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '3px solid #f97316', borderRadius: '16px', padding: '24px', color: '#9a3412', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ea580c', paddingBottom: '12px', marginBottom: '16px' }}>
                  <b style={{ fontSize: '14px' }}>🇮🇳 Government of India / Unique Identification Authority of India</b>
                  <span style={{ background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>AADHAAR</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '110px', background: '#64748b', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '36px' }}>👤</div>
                  <div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#431407' }}>{viewingDocImage.user?.name || 'Neha Kapoor'}</h2>
                    <div style={{ fontSize: '13px' }}>DOB: 14/08/1996 | Gender: FEMALE</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>Address: 142/B, Green Park, New Delhi 110016</div>
                    <div style={{ marginTop: '16px', fontSize: '22px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '3px', color: '#7c2d12' }}>
                      7842 1092 5678
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewingDocImage.docType === 'pan' && (
              <div style={{ width: '100%', maxWidth: '560px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '3px solid #0284c7', borderRadius: '16px', padding: '24px', color: '#0369a1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '12px', marginBottom: '16px' }}>
                  <b style={{ fontSize: '14px' }}>🇮🇳 INCOME TAX DEPARTMENT • GOVT. OF INDIA</b>
                  <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>PAN CARD</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '110px', background: '#0284c7', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '36px' }}>👤</div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Taxpayer Name</div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#0c4a6e' }}>{(viewingDocImage.user?.name || viewingDocImage.vendor?.name || 'NEHA KAPOOR').toUpperCase()}</h2>
                    <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '3px', color: '#0369a1', marginTop: '10px' }}>
                      ABCDE1234F
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(viewingDocImage.docType === 'cheque' || viewingDocImage.docType === 'gst' || viewingDocImage.docType === 'incorporation' || viewingDocImage.docType === 'selfie') && (
              <div style={{ textAlign: 'center', color: '#0f172a' }}>
                <FileImage size={64} color="#0066ff" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{viewingDocImage.title}</h3>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Document file verified and authenticated against central databases.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
