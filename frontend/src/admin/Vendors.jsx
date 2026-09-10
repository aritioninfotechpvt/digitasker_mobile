import React, { useState, useMemo } from 'react';
import { 
  Building2, Plus, Search, Filter, Users, ClipboardList, WalletCards, 
  ShieldCheck, ArrowUpRight, Edit3, Trash2, Download, CheckCircle2, 
  X, RefreshCw, SlidersHorizontal, MapPin, Award
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Badge, Card, SectionTitle, Stat } from '../components/ui';
import { vendors as initialVendors } from '../data/dummy';
import { showSuccess, showConfirm, showToast } from '../utils/swal';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import api from '../services/api';

export default function Vendors() {
  const [vendorList, setVendorList] = useState(() => {
    const saved = localStorage.getItem('digitasker_custom_vendors');
    const deleted = JSON.parse(localStorage.getItem('digitasker_deleted_vendors') || '[]');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(v => !deleted.includes(v.id) && !deleted.includes(v.name) && !deleted.includes(v.raw_id));
        if (filtered.length > 0) return filtered;
      } catch (e) {}
    }
    return [];
  });

  const fetchVendors = async () => {
    try {
      const res = await api.admin.getVendors();
      const backendVendors = Array.isArray(res) ? res : res.vendors;
      const saved = JSON.parse(localStorage.getItem('digitasker_custom_vendors') || '[]');
      const deleted = JSON.parse(localStorage.getItem('digitasker_deleted_vendors') || '[]');

      if (backendVendors && backendVendors.length > 0) {
        const mapped = backendVendors.map(v => ({
          id: `VEN-${v.id}`,
          raw_id: v.id,
          name: v.name,
          manager: v.manager_name,
          coverage: v.coverage_area,
          members: v.member_count || 0,
          activeTasks: 0,
          payable: `₹${v.payable_balance || 0}`,
          quality: `${v.quality_score || 100}%`,
          status: v.status || 'Active'
        }));
        const combined = [...saved, ...mapped];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        const filtered = unique.filter(v => !deleted.includes(v.id) && !deleted.includes(v.name) && !deleted.includes(v.raw_id));
        setVendorList(filtered);
      } else if (saved.length > 0) {
        const filtered = saved.filter(v => !deleted.includes(v.id) && !deleted.includes(v.name) && !deleted.includes(v.raw_id));
        setVendorList(filtered);
      } else {
        setVendorList([]);
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    fetchVendors();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [coverageFilter, setCoverageFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedControlRule, setSelectedControlRule] = useState(null);

  // New Vendor Form
  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    coverage: '',
    members: '0',
    activeTasks: '0',
    payable: '₹0',
    quality: '100%',
    status: 'Active'
  });

  // Filtered & Sorted Vendor List
  const filteredVendors = useMemo(() => {
    let result = vendorList.filter(v => {
      const matchesSearch = 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.coverage.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesCoverage = coverageFilter === 'All' || v.coverage.includes(coverageFilter);

      return matchesSearch && matchesStatus && matchesCoverage;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'members') return (parseInt(b.members) || 0) - (parseInt(a.members) || 0);
      if (sortBy === 'tasks') return (parseInt(b.activeTasks) || 0) - (parseInt(a.activeTasks) || 0);
      if (sortBy === 'quality') return (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0);
      return 0;
    });

    return result;
  }, [vendorList, searchQuery, statusFilter, coverageFilter, sortBy]);

  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, currentPage, pageSize]);

  // Dynamic Statistics
  const totalActiveVendors = useMemo(() => vendorList.filter(v => v.status === 'Active').length, [vendorList]);
  const totalMembers = useMemo(() => vendorList.reduce((acc, v) => acc + (parseInt(v.members) || 0), 0), [vendorList]);
  const totalTasks = useMemo(() => vendorList.reduce((acc, v) => acc + (parseInt(v.activeTasks) || 0), 0), [vendorList]);
  const totalPayableVal = useMemo(() => {
    return vendorList.reduce((acc, v) => {
      const num = parseFloat(String(v.payable).replace(/[^0-9.]/g, '')) || 0;
      return acc + num;
    }, 0);
  }, [vendorList]);

  const formattedPayable = useMemo(() => {
    if (totalPayableVal >= 100000) return `₹${(totalPayableVal / 100000).toFixed(2)}L`;
    if (totalPayableVal >= 1000) return `₹${(totalPayableVal / 1000).toFixed(1)}k`;
    return `₹${totalPayableVal.toLocaleString('en-IN')}`;
  }, [totalPayableVal]);

  // Handlers
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.manager || !formData.coverage) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    try {
      const res = await api.admin.createVendor({
        name: formData.name,
        manager_name: formData.manager,
        coverage_area: formData.coverage,
        member_count: parseInt(formData.members) || 0,
        daily_capacity: 100,
        payable_balance: parseFloat(formData.payable.replace(/[^0-9.]/g, '')) || 50000,
        quality_score: parseFloat(formData.quality.replace(/[^0-9.]/g, '')) || 96,
        status: formData.status
      });

      const v = res.vendor || {};
      const newVendor = {
        id: `VEN-${v.id || vendorList.length + 1001}`,
        raw_id: v.id,
        name: v.name || formData.name,
        manager: v.manager_name || formData.manager,
        coverage: v.coverage_area || formData.coverage,
        members: v.member_count || parseInt(formData.members) || 0,
        activeTasks: 10,
        payable: `₹${v.payable_balance || formData.payable}`,
        quality: `${v.quality_score || 96}%`,
        status: v.status || formData.status
      };

      const existing = JSON.parse(localStorage.getItem('digitasker_custom_vendors') || '[]');
      localStorage.setItem('digitasker_custom_vendors', JSON.stringify([newVendor, ...existing.filter(v => v.name !== newVendor.name)]));

      setVendorList(prev => [newVendor, ...prev.filter(v => v.name !== newVendor.name)]);
      setShowRegisterModal(false);
      setFormData({
        name: '',
        manager: '',
        coverage: '',
        members: '0',
        activeTasks: '0',
        payable: '₹0',
        quality: '100%',
        status: 'Active'
      });
      showSuccess('Vendor Registered!', `Vendor ${newVendor.name} registered successfully on backend.`);
    } catch (err) {
      showToast(`Error creating vendor: ${err.message}`, 'error');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingVendor) return;

    setVendorList(vendorList.map(v => v.id === editingVendor.id ? editingVendor : v));
    setEditingVendor(null);
    showToast('Vendor details updated successfully!', 'success');
  };

  const handleDelete = async (vendor) => {
    const confirmed = await showConfirm(
      'Remove Vendor?',
      `Are you sure you want to remove ${vendor.name} (${vendor.id}) from the network?`
    );
    if (confirmed) {
      if (vendor.raw_id) {
        try {
          await api.admin.deleteVendor(vendor.raw_id);
        } catch (err) {
          console.warn('Backend delete notice:', err.message);
        }
      }

      // Add to deleted tracking list
      const deleted = JSON.parse(localStorage.getItem('digitasker_deleted_vendors') || '[]');
      if (!deleted.includes(vendor.id)) deleted.push(vendor.id);
      if (!deleted.includes(vendor.name)) deleted.push(vendor.name);
      if (vendor.raw_id && !deleted.includes(vendor.raw_id)) deleted.push(vendor.raw_id);
      localStorage.setItem('digitasker_deleted_vendors', JSON.stringify(deleted));

      // Remove from saved custom vendors
      const saved = JSON.parse(localStorage.getItem('digitasker_custom_vendors') || '[]');
      const updatedSaved = saved.filter(v => v.id !== vendor.id && v.name !== vendor.name && v.raw_id !== vendor.raw_id);
      localStorage.setItem('digitasker_custom_vendors', JSON.stringify(updatedSaved));

      setVendorList(prev => prev.filter(v => v.id !== vendor.id && v.name !== vendor.name));
      showToast(`Vendor ${vendor.name} removed`, 'info');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Vendor Name', 'Manager', 'Coverage', 'Members', 'Active Tasks', 'Payable', 'Quality', 'Status'];
    const rows = filteredVendors.map(v => [
      v.id,
      `"${v.name}"`,
      `"${v.manager}"`,
      `"${v.coverage}"`,
      v.members,
      v.activeTasks,
      `"${v.payable}"`,
      v.quality,
      v.status
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendor_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Export Complete!', `Downloaded ${filteredVendors.length} vendor records as CSV.`);
  };

  // Vendor Control Rules List
  const controlRules = [
    { title: 'Vendor KYC & agreement', detail: 'Mandatory verification before task allocation', status: 'Enforced' },
    { title: 'Member invitation policy', detail: 'Vendor can invite & verify field agents', status: 'Active' },
    { title: 'Task redistribution', detail: 'Vendor can assign only allocated inventory', status: 'Strict' },
    { title: 'Payment hierarchy', detail: 'Admin → Vendor → Member payout flow', status: 'Automated' },
    { title: 'Quality threshold', detail: 'Auto-pause vendor tasks below 80% approval', status: '80% Min' }
  ];

  return (
    <AppLayout role="admin" title="Vendors & Partner Network">
      {/* Top Stat Cards */}
      <div className="statsGrid four">
        <Stat label="Active vendors" value={totalActiveVendors.toString()} icon={<Building2 size={20}/>} />
        <Stat label="Vendor members" value={totalMembers.toLocaleString()} icon={<Users size={20}/>} />
        <Stat label="Tasks with vendors" value={totalTasks.toLocaleString()} icon={<ClipboardList size={20}/>} />
        <Stat label="Vendor payable" value={formattedPayable} icon={<WalletCards size={20}/>} />
      </div>

      {/* Toolbar: Search, Filters, Export, Add Vendor */}
      <div className="advancedToolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div className="searchBox" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px' }}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search vendor name, manager, city, ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 0, padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', fontSize: '13.5px' }}
          />
          {searchQuery && (
            <X size={16} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearchQuery('')} />
          )}
        </div>

        <Link 
          to="/admin/users/kyc"
          className="ghostDark" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '13.5px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none' }}
        >
          <ShieldCheck size={15} color="#0066ff" /> Vendor KYC Queue
        </Link>

        <select 
          value={sortBy} 
          onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 600, fontSize: '13.5px', color: '#334155' }}
        >
          <option value="name">Sort: Name (A-Z)</option>
          <option value="members">Sort: Most Members</option>
          <option value="tasks">Sort: Most Active Tasks</option>
          <option value="quality">Sort: Highest Quality</option>
        </select>

        <button 
          className="ghostDark" 
          onClick={() => setShowFilterModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}
        >
          <Filter size={15} /> 
          Filters {(statusFilter !== 'All' || coverageFilter !== 'All') ? '• Active' : ''}
        </button>

        <button 
          className="ghostDark" 
          onClick={handleExportCSV}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}
        >
          <Download size={15} /> Export
        </button>

        <button 
          className="primary" 
          onClick={() => setShowRegisterModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13.5px', background: '#0066ff', color: '#ffffff', border: 0 }}
        >
          <Plus size={16} /> Register Vendor
        </button>
      </div>

      {/* Main Vendor Directory & Controls Grid */}
      <div className="vendorAdminGrid" style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr', gap: '20px' }}>
        {/* Vendor Table Card */}
        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <SectionTitle 
            title={`Vendor Directory (${filteredVendors.length})`} 
            action={`Export CSV (${filteredVendors.length})`} 
            onActionClick={handleExportCSV}
          />
          
          <div className="dataTable vendorTable" style={{ marginTop: '14px' }}>
            <div className="dataHead" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 0.6fr 0.7fr 0.8fr 0.6fr 0.7fr 0.7fr', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              <span>Vendor</span>
              <span>Coverage</span>
              <span>Members</span>
              <span>Active Tasks</span>
              <span>Payable</span>
              <span>Quality</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {paginatedVendors.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                <Building2 size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No vendors match your filter criteria.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCoverageFilter('All'); setCurrentPage(1); }}
                  style={{ marginTop: '12px', padding: '6px 14px', background: '#e0e7ff', color: '#4338ca', border: 0, borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                >
                  Reset Search Filters
                </button>
              </div>
            ) : (
              paginatedVendors.map(v => (
                <div className="dataRow" key={v.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 0.6fr 0.7fr 0.8fr 0.6fr 0.7fr 0.7fr', gap: '10px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                  <div>
                    <b style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{v.name}</b>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>{v.id} · {v.manager}</small>
                  </div>
                  <span style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
                    <MapPin size={12} color="#0066ff" /> {v.coverage}
                  </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{v.members}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{v.activeTasks}</span>
                  <strong style={{ color: '#059669', fontSize: '13px' }}>{v.payable}</strong>
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>{v.quality}</span>
                  <div>
                    <Badge tone={v.status === 'Active' ? 'green' : 'orange'}>{v.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setEditingVendor(v)}
                      title="Edit Vendor"
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', color: '#475569' }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(v)}
                      title="Delete Vendor"
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecdd3', background: '#fff1f2', cursor: 'pointer', color: '#e11d48' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(filteredVendors.length / pageSize)}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={filteredVendors.length}
          />
        </Card>

        {/* Vendor Governance Controls Side Panel */}
        <Card style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <SectionTitle title="Vendor Controls & Governance" />
          
          <div className="policyBox" style={{ padding: '14px', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', marginBottom: '16px' }}>
            <b style={{ color: '#6b21a8', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Vendor Task Allocation Policy
            </b>
            <p style={{ color: '#7e22ce', fontSize: '12px', lineHeight: 1.5, margin: '6px 0 10px' }}>
              Admin manages campaign allocations, task quotas, regional locks, and completion SLAs across vendor partners.
            </p>
            <div className="ruleChips" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <Badge tone="purple">Location based</Badge>
              <Badge tone="purple">Quota based</Badge>
              <Badge tone="purple">SLA protected</Badge>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {controlRules.map((rule, idx) => (
              <div 
                key={idx} 
                className="riskRule" 
                onClick={() => setSelectedControlRule(rule)}
                style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center', 
                  padding: '12px 10px', 
                  borderRadius: '10px', 
                  border: '1px solid #f1f5f9', 
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                <ShieldCheck size={16} color="#0066ff" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>{rule.title}</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{rule.detail}</span>
                </div>
                <Badge tone="green">{rule.status}</Badge>
                <ArrowUpRight size={14} color="#94a3b8" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* MODAL: Register New Vendor */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#0066ff" /> Register New Partner Vendor
              </h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowRegisterModal(false)} />
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Vendor Business Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Apex Consumer Insights Ltd" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Account Manager *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Rajesh Kumar" 
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Coverage / Cities *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Delhi NCR, Haryana" 
                    value={formData.coverage}
                    onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Field Members</label>
                  <input 
                    type="number" 
                    placeholder="25" 
                    value={formData.members}
                    onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Monthly Payable (₹)</label>
                  <input 
                    type="text" 
                    placeholder="₹50,000" 
                    value={formData.payable}
                    onChange={(e) => setFormData({ ...formData, payable: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Quality Score</label>
                  <input 
                    type="text" 
                    placeholder="96%" 
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Network Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Audit</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Save & Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Vendor */}
      {editingVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#0066ff" /> Edit Vendor: {editingVendor.name}
              </h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setEditingVendor(null)} />
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Vendor Business Name</label>
                <input 
                  type="text" 
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Manager</label>
                  <input 
                    type="text" 
                    value={editingVendor.manager}
                    onChange={(e) => setEditingVendor({ ...editingVendor, manager: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Coverage</label>
                  <input 
                    type="text" 
                    value={editingVendor.coverage}
                    onChange={(e) => setEditingVendor({ ...editingVendor, coverage: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Active Members</label>
                  <input 
                    type="number" 
                    value={editingVendor.members}
                    onChange={(e) => setEditingVendor({ ...editingVendor, members: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Status</label>
                  <select 
                    value={editingVendor.status}
                    onChange={(e) => setEditingVendor({ ...editingVendor, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Audit</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Update Vendor Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Filter Options */}
      {showFilterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="#0066ff" /> Directory Filter Options
              </h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowFilterModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Status Filter</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', background: '#fff' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Pending">Pending Audit</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Coverage Region Filter</label>
                <select 
                  value={coverageFilter}
                  onChange={(e) => setCoverageFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', background: '#fff' }}
                >
                  <option value="All">All Coverage Regions</option>
                  <option value="Chandigarh">Chandigarh / Punjab</option>
                  <option value="Delhi">Delhi NCR / Haryana</option>
                  <option value="Mumbai">Mumbai / Maharashtra</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  onClick={() => { setStatusFilter('All'); setCoverageFilter('All'); setShowFilterModal(false); }}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View/Configure Control Rule */}
      {selectedControlRule && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', placeItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#0066ff" /> {selectedControlRule.title}
              </h3>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setSelectedControlRule(null)} />
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                {selectedControlRule.detail}
              </p>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Current Policy Enforcement:</span>
                <Badge tone="green">{selectedControlRule.status}</Badge>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Update Enforcement Threshold</label>
              <select style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}>
                <option value="strict">Strict (Immediate Auto-Pause on Violation)</option>
                <option value="moderate">Standard (24h SLA Warning Grace Period)</option>
                <option value="custom">Custom Partner Exception</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setSelectedControlRule(null)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setSelectedControlRule(null);
                  showSuccess('Policy Rule Updated', `${selectedControlRule.title} policy configuration updated.`);
                }}
                style={{ padding: '10px 18px', borderRadius: '8px', border: 0, background: '#0066ff', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function uppercaseText() {
  return 'uppercase';
}
