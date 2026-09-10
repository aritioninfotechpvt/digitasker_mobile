import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { Card, Badge, Stat } from '../components/ui';
import { 
  Building2, Briefcase, IndianRupee, Users, Plus, Search, MoreVertical, 
  Download, X, Edit3, Trash2, ShieldCheck, Eye, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { clients as initialClients } from '../data/dummy';
import { showSuccess, showConfirm, showToast } from '../utils/swal';
import Pagination from '../components/Pagination';
import api from '../services/api';

export default function Clients() {
  const navigate = useNavigate();
  const [clientList, setClientList] = useState(() => {
    const saved = localStorage.getItem('digitasker_custom_clients');
    const deleted = JSON.parse(localStorage.getItem('digitasker_deleted_clients') || '[]');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(c => !deleted.includes(c.id) && !deleted.includes(c.name) && !deleted.includes(c.raw_id));
        if (filtered.length > 0) return filtered;
      } catch (e) {}
    }
    return [];
  });

  const fetchClients = async () => {
    try {
      const res = await api.admin.getClients();
      const backendClients = Array.isArray(res) ? res : res.clients;
      const saved = JSON.parse(localStorage.getItem('digitasker_custom_clients') || '[]');
      const deleted = JSON.parse(localStorage.getItem('digitasker_deleted_clients') || '[]');

      if (backendClients && backendClients.length > 0) {
        const mapped = backendClients.map(c => ({
          id: `CL-${c.id}`,
          raw_id: c.id,
          name: c.name,
          contact: c.contact_email,
          industry: c.industry || 'Corporate',
          campaigns: c.active_campaigns_count || 0,
          spend: parseFloat(c.total_spend) || 0,
          status: c.status || 'Active'
        }));
        const combined = [...saved, ...mapped];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        const filtered = unique.filter(c => !deleted.includes(c.id) && !deleted.includes(c.name) && !deleted.includes(c.raw_id));
        setClientList(filtered);
      } else if (saved.length > 0) {
        const filtered = saved.filter(c => !deleted.includes(c.id) && !deleted.includes(c.name) && !deleted.includes(c.raw_id));
        setClientList(filtered);
      } else {
        setClientList([]);
      }
    } catch (err) {
      console.warn('Clients API fetch notice:', err.message);
    }
  };

  const handleClearDemoData = async () => {
    const confirmed = await showConfirm(
      'Clean Demo Data?',
      'This will remove all dummy sample JS data across the project so you can start completely fresh with real created data.'
    );
    if (confirmed) {
      localStorage.setItem('digitasker_demo_cleared', 'true');
      const saved = JSON.parse(localStorage.getItem('digitasker_custom_clients') || '[]');
      setClientList(saved);
      showSuccess('Project Data Cleaned! 🧹', 'All dummy JS sample data removed. Only your created/API data will be shown.');
    }
  };

  const handleRestoreDemoData = async () => {
    localStorage.removeItem('digitasker_demo_cleared');
    fetchClients();
    showToast('Demo data restored');
  };

  React.useEffect(() => {
    fetchClients();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('spend');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [actionClient, setActionClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const [newClient, setNewClient] = useState({
    name: '',
    contact: '',
    industry: 'Consumer Electronics',
    status: 'Active'
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newClient.name || !newClient.contact) {
      showToast('Please fill out client name and contact.', 'error');
      return;
    }

    const created = {
      id: `CL-${100 + clientList.length + 1}`,
      name: newClient.name,
      contact: newClient.contact,
      industry: newClient.industry,
      campaigns: 0,
      spend: 0,
      status: newClient.status
    };

    const existingCustom = JSON.parse(localStorage.getItem('digitasker_custom_clients') || '[]');
    const updatedCustom = [created, ...existingCustom.filter(c => c.name !== created.name)];
    localStorage.setItem('digitasker_custom_clients', JSON.stringify(updatedCustom));

    setClientList(prev => [created, ...prev.filter(c => c.name !== created.name)]);
    setShowAddModal(false);
    setNewClient({ name: '', contact: '', industry: 'Consumer Electronics', status: 'Active' });

    try {
      await api.admin.createClient({
        name: created.name,
        contact_email: created.contact,
        industry: created.industry,
        status: created.status
      });
      showSuccess('Client Registered & Persisted! 🏢', `${created.name} saved to system database.`);
    } catch (err) {
      showSuccess('Client Registered! 🏢', `${created.name} added to client directory.`);
    }
  };

  const handleToggleClientStatus = (client) => {
    const newStatus = client.status === 'Active' ? 'Paused' : 'Active';
    const updated = clientList.map(c => c.name === client.name ? { ...c, status: newStatus } : c);
    setClientList(updated);

    const existingCustom = JSON.parse(localStorage.getItem('digitasker_custom_clients') || '[]');
    const updatedCustom = existingCustom.map(c => c.name === client.name ? { ...c, status: newStatus } : c);
    localStorage.setItem('digitasker_custom_clients', JSON.stringify(updatedCustom));

    showSuccess('Status Updated!', `${client.name} status changed to ${newStatus}.`);
    if (actionClient && actionClient.name === client.name) {
      setActionClient({ ...actionClient, status: newStatus });
    }
  };

  const handleDeleteClient = async (client) => {
    const confirmed = await showConfirm(
      `Delete Client: ${client.name}?`,
      `Are you sure you want to remove ${client.name} from the client directory?`
    );
    if (confirmed) {
      if (client.raw_id) {
        try {
          await api.admin.deleteClient(client.raw_id);
        } catch (err) {
          console.warn('Backend client delete notice:', err.message);
        }
      }

      // Add to deleted tracking list
      const deleted = JSON.parse(localStorage.getItem('digitasker_deleted_clients') || '[]');
      if (!deleted.includes(client.id)) deleted.push(client.id);
      if (!deleted.includes(client.name)) deleted.push(client.name);
      if (client.raw_id && !deleted.includes(client.raw_id)) deleted.push(client.raw_id);
      localStorage.setItem('digitasker_deleted_clients', JSON.stringify(deleted));

      const existingCustom = JSON.parse(localStorage.getItem('digitasker_custom_clients') || '[]');
      localStorage.setItem('digitasker_custom_clients', JSON.stringify(existingCustom.filter(c => c.name !== client.name && c.id !== client.id)));

      setClientList(prev => prev.filter(c => c.name !== client.name && c.id !== client.id));
      setActionClient(null);
      showSuccess('Client Deleted!', `${client.name} has been removed.`);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name) return;

    const updated = clientList.map(c => (c.id === editingClient.id || c.name === editingClient.originalName) ? editingClient : c);
    setClientList(updated);

    const existingCustom = JSON.parse(localStorage.getItem('digitasker_custom_clients') || '[]');
    localStorage.setItem('digitasker_custom_clients', JSON.stringify(existingCustom.map(c => c.name === editingClient.originalName ? editingClient : c)));

    setEditingClient(null);
    setActionClient(null);
    showSuccess('Client Profile Updated! 🏢', `${editingClient.name} details saved successfully.`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Client Name', 'Contact', 'Industry', 'Campaigns', 'Spend (INR)', 'Status'];
    const rows = filteredClients.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.contact}"`,
      `"${c.industry}"`,
      c.campaigns,
      c.spend,
      c.status
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `clients_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showSuccess('Export Complete!', 'Downloaded client directory CSV.');
  };

  const filteredClients = useMemo(() => {
    let result = clientList.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    });

    result.sort((a, b) => {
      if (sortBy === 'spend') return b.spend - a.spend;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'campaigns') return b.campaigns - a.campaigns;
      return 0;
    });

    return result;
  }, [clientList, searchQuery, statusFilter, industryFilter, sortBy]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  const totalActiveCampaigns = useMemo(() => clientList.reduce((acc, c) => acc + (c.campaigns || 0), 0), [clientList]);
  const totalMonthlyBilling = useMemo(() => {
    const total = clientList.reduce((acc, c) => acc + (c.spend || 0), 0);
    if (total >= 100000) return `₹${(total / 100000).toFixed(1)}L`;
    return `₹${total.toLocaleString('en-IN')}`;
  }, [clientList]);
  const totalClientUsers = useMemo(() => clientList.length > 0 ? (clientList.length * 3).toString() : '0', [clientList]);

  return (
    <AppLayout role='admin' title='Clients & Brands'>
      <div className='between pageAction' style={{ marginBottom: '20px' }}>
        <div>
          <h2>Corporate Clients & Enterprise Brands</h2>
          <p className='muted'>Manage companies, billing owners, campaign access and account status.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className='ghost' onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className='primary' onClick={() => setShowAddModal(true)}>
            <Plus size={17} /> Add Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='statsGrid' style={{ marginBottom: '20px' }}>
        <Stat label='Active Clients' value={clientList.filter(c => c.status === 'Active').length.toString()} icon={<Building2 />} />
        <Stat label='Active Campaigns' value={totalActiveCampaigns.toString()} icon={<Briefcase />} />
        <Stat label='Monthly Billing' value={totalMonthlyBilling} icon={<IndianRupee />} />
        <Stat label='Client Users' value={totalClientUsers} icon={<Users />} />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: '20px' }}>
        <div className='tableToolbar' style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className='searchBox' style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px' }}>
            <Search size={17} color="#64748b" />
            <input 
              placeholder='Search client, brand or contact...' 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ border: 0, outline: 'none', width: '100%', padding: '8px 0', fontSize: '13px' }}
            />
          </div>

          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
          </select>

          <select value={industryFilter} onChange={e => { setIndustryFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
            <option value="All">All Industries</option>
            <option value="Consumer Electronics">Consumer Electronics</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Retail">Retail</option>
            <option value="BFSI">BFSI</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}>
            <option value="spend">Sort: Total Spend</option>
            <option value="name">Sort: Client Name</option>
            <option value="campaigns">Sort: Campaigns</option>
          </select>
        </div>

        <div className='clientTable'>
          <div className='dataHead' style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 0.8fr 1.2fr', padding: '10px 12px', background: '#f8fafc', fontWeight: 700, fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
            <span>Client</span>
            <span>Industry</span>
            <span>Campaigns</span>
            <span>Spend</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {paginatedClients.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No clients registered. Click + Add Client to add your first client.</div>
          ) : (
            paginatedClients.map(c => (
              <div className='dataRow' key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 0.8fr 1.2fr', gap: '10px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <div>
                  <b style={{ display: 'block', color: '#0f172a' }}>{c.name}</b>
                  <small className='muted block' style={{ fontSize: '11px', color: '#64748b' }}>{c.contact}</small>
                </div>
                <span>{c.industry}</span>
                <span style={{ fontWeight: 600 }}>{c.campaigns}</span>
                <b style={{ color: '#059669' }}>₹{c.spend.toLocaleString('en-IN')}</b>
                <div>
                  <Badge tone={c.status === 'Active' ? 'green' : 'orange'}>{c.status}</Badge>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button 
                    className='iconBtn' 
                    style={{ border: '1px solid #cbd5e1', background: '#ffffff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#0066ff' }} 
                    onClick={() => setActionClient(c)}
                  >
                    <MoreVertical size={14} color="#0066ff" /> Manage
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={Math.ceil(filteredClients.length / pageSize)}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={filteredClients.length}
        />
      </Card>

      {/* ACTION MODAL FOR SELECTED CLIENT */}
      {actionClient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Client Actions: {actionClient.name}</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setActionClient(null)} />
            </div>

            {/* Client Summary Box */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Client ID: {actionClient.id}</span>
                <Badge tone={actionClient.status === 'Active' ? 'green' : 'orange'}>{actionClient.status}</Badge>
              </div>
              <div><b>Contact:</b> {actionClient.contact}</div>
              <div><b>Industry:</b> {actionClient.industry}</div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                <span><b>Active Campaigns:</b> {actionClient.campaigns}</span>
                <span><b>Total Spend:</b> <span style={{ color: '#059669', fontWeight: 700 }}>₹{actionClient.spend.toLocaleString('en-IN')}</span></span>
              </div>
            </div>

            {/* Quick Actions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => { setActionClient(null); navigate('/admin/campaigns/new'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px' }}
              >
                <Plus size={18} /> Launch New Campaign for {actionClient.name}
              </button>

              <button 
                onClick={() => handleToggleClientStatus(actionClient)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fed7aa', background: '#fff7ed', color: '#c2410c', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px' }}
              >
                {actionClient.status === 'Active' ? <ToggleLeft size={18} /> : <ToggleRight size={18} />} 
                {actionClient.status === 'Active' ? 'Pause Client Account' : 'Activate Client Account'}
              </button>

              <button 
                onClick={() => { setEditingClient({ ...actionClient, originalName: actionClient.name }); setActionClient(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px' }}
              >
                <Edit3 size={18} color="#0066ff" /> Edit Client Profile & Contact
              </button>

              <button 
                onClick={() => handleDeleteClient(actionClient)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px' }}
              >
                <Trash2 size={18} /> Delete Client from Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {editingClient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Edit Client: {editingClient.originalName}</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setEditingClient(null)} />
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Company / Brand Name
                <input 
                  type="text" 
                  value={editingClient.name} 
                  onChange={e => setEditingClient({ ...editingClient, name: e.target.value })} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required 
                />
              </label>

              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Primary Contact Email
                <input 
                  type="email" 
                  value={editingClient.contact} 
                  onChange={e => setEditingClient({ ...editingClient, contact: e.target.value })} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required 
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  Industry Segment
                  <select 
                    value={editingClient.industry} 
                    onChange={e => setEditingClient({ ...editingClient, industry: e.target.value })} 
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                  >
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Retail">Retail</option>
                    <option value="BFSI">BFSI</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                </label>

                <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  Account Status
                  <select 
                    value={editingClient.status} 
                    onChange={e => setEditingClient({ ...editingClient, status: e.target.value })} 
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="ghost" onClick={() => setEditingClient(null)}>Cancel</button>
                <button type="submit" className="primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div className='between' style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Register New Client</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowAddModal(false)} />
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Company / Brand Name
                <input 
                  type="text" 
                  placeholder="e.g. Acme Corp" 
                  value={newClient.name} 
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required 
                />
              </label>

              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Primary Contact Email
                <input 
                  type="email" 
                  placeholder="admin@acme.com" 
                  value={newClient.contact} 
                  onChange={e => setNewClient({ ...newClient, contact: e.target.value })} 
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required 
                />
              </label>

              <label style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                Industry Segment
                <select value={newClient.industry} onChange={e => setNewClient({ ...newClient, industry: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Retail">Retail</option>
                  <option value="BFSI">BFSI</option>
                  <option value="E-commerce">E-commerce</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="primary">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
